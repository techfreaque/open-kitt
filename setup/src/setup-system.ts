#!/usr/bin/env node
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';

const program = new Command();
program
  .option('-u, --user <user>', 'User to run the application as', process.env.SUDO_USER || process.env.USER || 'root')
  .option('-p, --port <port>', 'Port for the web application', '3000')
  .option('-a, --autostart', 'Configure autostart on boot', true)
  .parse(process.argv);

const options = program.opts();

const log = {
  info: (message: string) => console.log(chalk.blue(`ℹ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✓ ${message}`)),
  error: (message: string) => console.log(chalk.red(`✗ ${message}`)),
  warn: (message: string) => console.log(chalk.yellow(`⚠ ${message}`))
};

async function setupSystem() {
  log.info('Starting system setup...');

  // Check if running as root
  if (process.getuid && process.getuid() !== 0) {
    log.error('This script must be run as root. Please use sudo.');
    process.exit(1);
  }

  try {
    // Get the project root directory (assuming this script is in setup/dist)
    const projectRoot = path.resolve(__dirname, '../..');
    
    // Create PM2 ecosystem file
    const ecosystemSpinner = ora('Creating PM2 ecosystem file...').start();
    const ecosystemConfig = {
      apps: [
        {
          name: 'open-car-server',
          script: `${projectRoot}/server/dist/index.js`,
          env: {
            NODE_ENV: 'production',
            PORT: options.port
          },
          watch: false,
          instances: 1,
          autorestart: true,
          max_memory_restart: '500M'
        },
        {
          name: 'open-car-frontend',
          script: 'npm',
          args: 'start',
          cwd: projectRoot,
          env: {
            NODE_ENV: 'production',
            PORT: options.port
          },
          watch: false,
          instances: 1,
          autorestart: true,
          max_memory_restart: '500M'
        }
      ]
    };

    await fs.writeFile(
      path.join(projectRoot, 'ecosystem.config.json'), 
      JSON.stringify(ecosystemConfig, null, 2)
    );
    ecosystemSpinner.succeed('PM2 ecosystem file created');

    // Configure autostart if requested
    if (options.autostart) {
      const autostartSpinner = ora('Configuring autostart...').start();
      
      // Create systemd service for the application
      const serviceContent = `[Unit]
Description=OpenCar Dashboard
After=network.target can-setup.service

[Service]
Type=forking
User=${options.user}
WorkingDirectory=${projectRoot}
ExecStart=/usr/local/bin/pm2 start ecosystem.config.json
ExecReload=/usr/local/bin/pm2 reload ecosystem.config.json
ExecStop=/usr/local/bin/pm2 stop ecosystem.config.json
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
`;

      await fs.writeFile('/etc/systemd/system/open-car.service', serviceContent);
      await execa('systemctl', ['daemon-reload']);
      await execa('systemctl', ['enable', 'open-car.service']);
      autostartSpinner.succeed('Autostart configured');

      // Configure X server autostart for kiosk mode
      const kioskSpinner = ora('Configuring kiosk mode...').start();
      
      // Create .xinitrc file for the user
      const xinitrcPath = path.join('/home', options.user, '.xinitrc');
      const xinitrcContent = `#!/bin/sh
xset -dpms
xset s off
xset s noblank

unclutter -idle 0.1 -root &

# Start Chromium in kiosk mode
chromium --kiosk --app=http://localhost:${options.port} --start-fullscreen --disable-infobars --noerrdialogs --disable-translate
`;

      await fs.writeFile(xinitrcPath, xinitrcContent);
      await execa('chown', [`${options.user}:${options.user}`, xinitrcPath]);
      await execa('chmod', ['+x', xinitrcPath]);

      // Create a script to start X on boot
      const startXPath = '/etc/profile.d/start-opencar.sh';
      const startXContent = `#!/bin/sh
if [ "$(tty)" = "/dev/tty1" ] && [ "$(whoami)" = "${options.user}" ]; then
  startx
fi
`;

      await fs.writeFile(startXPath, startXContent);
      await execa('chmod', ['+x', startXPath]);
      
      kioskSpinner.succeed('Kiosk mode configured');
    }

    // Configure network manager to prioritize WiFi
    const networkSpinner = ora('Configuring network settings...').start();
    const networkConfig = `[connection]
wifi.cloned-mac-address=preserve
ethernet.cloned-mac-address=preserve

[device]
wifi.scan-rand-mac-address=no

[main]
dhcp=dhclient
`;

    await fs.writeFile('/etc/NetworkManager/conf.d/99-opencar.conf', networkConfig);
    await execa('systemctl', ['restart', 'NetworkManager']);
    networkSpinner.succeed('Network settings configured');

    log.success('System setup complete!');
    
    if (options.autostart) {
      log.info('The system will automatically start the OpenCar dashboard on next boot.');
      log.info(`You can manually start it with: systemctl start open-car.service`);
    } else {
      log.info(`You can start the application manually with: cd ${projectRoot} && pm2 start ecosystem.config.json`);
    }
    
  } catch (error) {
    log.error(`Failed to set up system: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

setupSystem().catch(error => {
  log.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

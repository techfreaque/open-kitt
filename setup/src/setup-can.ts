#!/usr/bin/env node
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import { Command } from 'commander';

const program = new Command();
program
  .option('-b, --bitrate <bitrate>', 'CAN bus bitrate', '500000')
  .option('-i, --interface <interface>', 'CAN interface name', 'can0')
  .parse(process.argv);

const options = program.opts();

const log = {
  info: (message: string) => console.log(chalk.blue(`ℹ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✓ ${message}`)),
  error: (message: string) => console.log(chalk.red(`✗ ${message}`)),
  warn: (message: string) => console.log(chalk.yellow(`⚠ ${message}`))
};

async function setupCAN() {
  log.info(`Starting CAN bus setup for ${options.interface} with bitrate ${options.bitrate}...`);

  // Check if running as root
  if (process.getuid && process.getuid() !== 0) {
    log.error('This script must be run as root. Please use sudo.');
    process.exit(1);
  }

  try {
    // Load the CAN modules
    const modulesSpinner = ora('Loading CAN kernel modules...').start();
    await execa('modprobe', ['can']);
    await execa('modprobe', ['can_raw']);
    await execa('modprobe', ['can_dev']);
    
    try {
      // Try to load MCP2515 module (common for USB CAN adapters)
      await execa('modprobe', ['mcp251x']);
      modulesSpinner.succeed('CAN kernel modules loaded including MCP2515 support');
    } catch (error) {
      modulesSpinner.warn('CAN kernel modules loaded, but MCP2515 module not available');
    }

    // Set up CAN interface
    const interfaceSpinner = ora(`Setting up ${options.interface} with bitrate ${options.bitrate}...`).start();
    try {
      await execa('ip', ['link', 'set', options.interface, 'type', 'can', 'bitrate', options.bitrate]);
      await execa('ip', ['link', 'set', options.interface, 'up']);
      interfaceSpinner.succeed(`${options.interface} configured and brought up`);
    } catch (error) {
      interfaceSpinner.fail(`Failed to configure ${options.interface}`);
      log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      log.warn('This could be because the interface does not exist or is already configured.');
      log.info('Continuing with service setup...');
    }

    // Create systemd service for CAN setup
    const serviceSpinner = ora('Creating systemd service for CAN setup...').start();
    const serviceContent = `[Unit]
Description=Setup CAN Bus Interface
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/sbin/ip link set ${options.interface} type can bitrate ${options.bitrate}
ExecStart=/sbin/ip link set ${options.interface} up
ExecStop=/sbin/ip link set ${options.interface} down

[Install]
WantedBy=multi-user.target
`;

    await fs.writeFile('/etc/systemd/system/can-setup.service', serviceContent);
    await execa('systemctl', ['daemon-reload']);
    await execa('systemctl', ['enable', 'can-setup.service']);
    serviceSpinner.succeed('CAN setup service created and enabled');

    // Test the CAN interface
    const testSpinner = ora('Testing CAN interface...').start();
    try {
      // Try to capture some CAN messages with a timeout
      await execa('timeout', ['5', 'candump', options.interface, '-n', '1']);
      testSpinner.succeed('CAN interface is working and receiving messages');
    } catch (error) {
      testSpinner.warn('No CAN messages received in 5 seconds. This is normal if no device is sending messages.');
    }

    log.success('CAN bus setup complete!');
  } catch (error) {
    log.error(`Failed to set up CAN bus: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

setupCAN().catch(error => {
  log.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

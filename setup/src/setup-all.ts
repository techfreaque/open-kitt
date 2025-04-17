#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";
import path from "path";

// Define the program
const program = new Command();
program
  .name("setup-all")
  .description("Set up OpenCar dashboard on Debian ARM")
  .option("-i, --interface <interface>", "CAN interface name", "can0")
  .option("-b, --bitrate <bitrate>", "CAN bitrate", "500000")
  .option("-p, --port <port>", "Server port", "3001")
  .option("-a, --auto-start", "Auto-start on boot", false)
  .option("-f, --fullscreen", "Start in fullscreen mode", true)
  .parse(process.argv);

const options = program.opts();

// Main setup function
async function setupAll() {
  console.log(chalk.blue.bold("OpenCar Dashboard Setup"));
  console.log(chalk.blue("============================"));
  console.log("");

  try {
    // Check if running as root
    if (process.getuid && process.getuid() !== 0) {
      console.error(chalk.red("Error: This script must be run as root"));
      process.exit(1);
    }

    // 1. Set up CAN bus
    await setupCanBus();

    // 2. Set up system services
    await setupSystemServices();

    // 3. Set up configuration
    await setupConfiguration();

    console.log("");
    console.log(chalk.green.bold("Setup completed successfully!"));
    console.log("");
    console.log(chalk.yellow("You can now start the OpenCar dashboard:"));
    console.log("  sudo systemctl start open-car.service");
    console.log("");
    console.log(chalk.yellow("To check the status:"));
    console.log("  sudo systemctl status open-car.service");
    console.log("");
  } catch (error) {
    console.error(
      chalk.red(
        `Setup failed: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
    process.exit(1);
  }
}

// Set up CAN bus
async function setupCanBus() {
  console.log(chalk.blue.bold("Setting up CAN bus..."));

  const spinner = ora("Installing CAN utilities").start();

  try {
    // Install CAN utilities
    await execa("apt-get", ["update"]);
    await execa("apt-get", ["install", "-y", "can-utils"]);
    spinner.succeed("CAN utilities installed");

    // Create CAN setup script
    spinner.text = "Creating CAN setup script";

    const canSetupScript = `#!/bin/bash
# Set up CAN interface ${options.interface} with bitrate ${options.bitrate}
ip link set ${options.interface} type can bitrate ${options.bitrate}
ip link set ${options.interface} up
`;

    await fs.writeFile("/usr/local/bin/setup-can.sh", canSetupScript);
    await execa("chmod", ["+x", "/usr/local/bin/setup-can.sh"]);
    spinner.succeed("CAN setup script created");

    // Create systemd service for CAN setup
    spinner.text = "Creating CAN systemd service";

    const canService = `[Unit]
Description=Set up CAN bus interface
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/setup-can.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
`;

    await fs.writeFile("/etc/systemd/system/can-setup.service", canService);
    await execa("systemctl", ["daemon-reload"]);
    await execa("systemctl", ["enable", "can-setup.service"]);
    spinner.succeed("CAN systemd service created and enabled");

    // Start the service
    spinner.text = "Starting CAN service";
    await execa("systemctl", ["start", "can-setup.service"]);
    spinner.succeed("CAN service started");
  } catch (error) {
    spinner.fail(
      `Failed to set up CAN bus: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

// Set up system services
async function setupSystemServices() {
  console.log(chalk.blue.bold("Setting up system services..."));

  const spinner = ora("Creating OpenCar systemd service").start();

  try {
    // Get the current directory (assuming we're in the setup directory)
    const setupDir = process.cwd();
    const projectDir = path.resolve(setupDir, "..");

    // Create systemd service for OpenCar
    const openCarService = `[Unit]
Description=OpenCar Dashboard
After=network.target can-setup.service

[Service]
Type=simple
User=root
WorkingDirectory=${projectDir}
ExecStart=/usr/bin/npm run start:all
Restart=always
RestartSec=10
Environment=PORT=${options.port}
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

    await fs.writeFile("/etc/systemd/system/open-car.service", openCarService);
    await execa("systemctl", ["daemon-reload"]);

    if (options.autoStart) {
      await execa("systemctl", ["enable", "open-car.service"]);
      spinner.succeed("OpenCar systemd service created and enabled");
    } else {
      spinner.succeed("OpenCar systemd service created");
    }
  } catch (error) {
    spinner.fail(
      `Failed to set up system services: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

// Set up configuration
async function setupConfiguration() {
  console.log(chalk.blue.bold("Setting up configuration..."));

  const spinner = ora("Creating configuration").start();

  try {
    // Create configuration directory if it doesn't exist
    const configDir = "/etc/open-car";
    await fs.ensureDir(configDir);

    // Create configuration file
    const config = {
      display: {
        fullscreen: options.fullscreen,
        brightness: 100,
        theme: "dark",
      },
      system: {
        serverUrl: `http://localhost:${options.port}`,
        autostart: options.autoStart,
        debugMode: false,
      },
      canBus: {
        interface: options.interface,
        bitrate: parseInt(options.bitrate),
        autoConnect: true,
      },
      androidAuto: {
        enabled: true,
        wirelessMode: true,
        autoConnect: true,
      },
    };

    await fs.writeJson(`${configDir}/config.json`, config, { spaces: 2 });
    spinner.succeed("Configuration created");

    // Create symlink to the configuration in the project directory
    const setupDir = process.cwd();
    const projectDir = path.resolve(setupDir, "..");

    try {
      await fs.ensureSymlink(
        `${configDir}/config.json`,
        `${projectDir}/config.json`,
      );
      spinner.succeed("Configuration symlinked to project directory");
    } catch (error) {
      spinner.warn(
        `Could not create symlink: ${error instanceof Error ? error.message : String(error)}`,
      );
      spinner.info(
        "You will need to manually copy the configuration file to the project directory",
      );
    }
  } catch (error) {
    spinner.fail(
      `Failed to set up configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

// Run the setup
setupAll().catch((error) => {
  console.error(
    chalk.red(
      `Unhandled error: ${error instanceof Error ? error.message : String(error)}`,
    ),
  );
  process.exit(1);
});

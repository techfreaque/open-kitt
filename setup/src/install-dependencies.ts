#!/usr/bin/env node
import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";

const log = {
  info: (message: string) => console.log(chalk.blue(`ℹ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✓ ${message}`)),
  error: (message: string) => console.log(chalk.red(`✗ ${message}`)),
  warn: (message: string) => console.log(chalk.yellow(`⚠ ${message}`)),
};

async function installDependencies() {
  log.info("Starting dependency installation...");

  // Check if running as root
  if (process.getuid && process.getuid() !== 0) {
    log.error("This script must be run as root. Please use sudo.");
    process.exit(1);
  }

  try {
    // Update package lists
    const updateSpinner = ora("Updating package lists...").start();
    await execa("apt-get", ["update"]);
    updateSpinner.succeed("Package lists updated");

    // Install essential packages
    const essentialSpinner = ora("Installing essential packages...").start();
    await execa("apt-get", [
      "install",
      "-y",
      "can-utils",
      "nodejs",
      "npm",
      "git",
      "usbutils",
      "network-manager",
      "dnsmasq",
      "hostapd",
      "bluez",
      "bluetooth",
      "pulseaudio",
      "pulseaudio-module-bluetooth",
      "alsa-utils",
      "v4l-utils",
      "xinit",
      "xserver-xorg",
      "x11-xserver-utils",
      "chromium",
      "unclutter",
      "supervisor",
      "nginx",
      "libnss3-tools",
      "libgbm1",
      "libasound2",
      "libatk1.0-0",
      "libc6",
      "libcairo2",
      "libcups2",
      "libdbus-1-3",
      "libexpat1",
      "libfontconfig1",
      "libgcc1",
      "libgconf-2-4",
      "libgdk-pixbuf2.0-0",
      "libglib2.0-0",
      "libgtk-3-0",
      "libnspr4",
      "libpango-1.0-0",
      "libpangocairo-1.0-0",
      "libstdc++6",
      "libx11-6",
      "libx11-xcb1",
      "libxcb1",
      "libxcomposite1",
      "libxcursor1",
      "libxdamage1",
      "libxext6",
      "libxfixes3",
      "libxi6",
      "libxrandr2",
      "libxrender1",
      "libxss1",
      "libxtst6",
      "lsb-release",
      "wget",
      "xdg-utils",
    ]);
    essentialSpinner.succeed("Essential packages installed");

    // Install Node.js LTS
    const nodeSpinner = ora("Setting up Node.js LTS...").start();
    await execa("bash", [
      "-c",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
    ]);
    await execa("apt-get", ["install", "-y", "nodejs"]);
    nodeSpinner.succeed("Node.js LTS installed");

    // Install PM2 for process management
    const pm2Spinner = ora("Installing PM2...").start();
    await execa("npm", ["install", "-g", "pm2"]);
    pm2Spinner.succeed("PM2 installed");

    // Setup user permissions
    const permissionsSpinner = ora("Setting up user permissions...").start();
    const username = process.env.SUDO_USER || process.env.USER || "root";
    await execa("usermod", ["-a", "-G", "dialout", username]);
    await execa("usermod", ["-a", "-G", "bluetooth", username]);
    await execa("usermod", ["-a", "-G", "audio", username]);
    await execa("usermod", ["-a", "-G", "video", username]);
    permissionsSpinner.succeed("User permissions set up");

    log.success("All dependencies installed successfully!");
  } catch (error) {
    log.error(
      `Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

installDependencies().catch((error) => {
  log.error(
    `Unhandled error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});

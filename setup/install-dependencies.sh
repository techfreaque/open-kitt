#!/bin/bash
set -e

# Update package lists
echo "Updating package lists..."
apt-get update

# Install essential packages
echo "Installing essential packages..."
apt-get install -y \
  can-utils \
  nodejs \
  npm \
  git \
  usbutils \
  network-manager \
  dnsmasq \
  hostapd \
  bluez \
  bluetooth \
  pulseaudio \
  pulseaudio-module-bluetooth \
  alsa-utils \
  v4l-utils \
  xinit \
  xserver-xorg \
  x11-xserver-utils \
  chromium \
  unclutter \
  supervisor \
  nginx \
  libnss3-tools \
  libgbm1 \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils

# Install Node.js LTS
echo "Setting up Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
echo "Installing PM2..."
npm install -g pm2

# Install CAN utilities
echo "Setting up CAN utilities..."
apt-get install -y can-utils

# Setup user permissions
echo "Setting up user permissions..."
usermod -a -G dialout $USER
usermod -a -G bluetooth $USER
usermod -a -G audio $USER
usermod -a -G video $USER

echo "All dependencies installed successfully!"

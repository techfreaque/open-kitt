#!/bin/bash
set -e

# Load the CAN modules
modprobe can
modprobe can_raw
modprobe can_dev
modprobe mcp251x  # For MCP2515 based CAN controllers

# Set up CAN interface (assuming can0)
# Adjust the bitrate as needed for your vehicle (common values: 500000, 250000, 125000)
ip link set can0 type can bitrate 500000
ip link set can0 up

# Test the CAN interface
echo "Testing CAN interface..."
candump can0 -n 10 -T 5000 || echo "No CAN messages received in 5 seconds. This is normal if no device is sending messages."

# Create systemd service for CAN setup
cat > /etc/systemd/system/can-setup.service << EOF
[Unit]
Description=Setup CAN Bus Interface
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/sbin/ip link set can0 type can bitrate 500000
ExecStart=/sbin/ip link set can0 up
ExecStop=/sbin/ip link set can0 down

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl enable can-setup.service

echo "CAN bus setup complete!"

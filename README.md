# open K.I.T.T

A modern car dashboard application with CAN bus integration and Android Auto support, designed to run on Debian ARM-based systems.

## Features

- **Modern UI**: Built with Next.js and shadcn/ui components
- **CAN Bus Integration**: Real-time vehicle data via WebSockets
- **System Monitoring**: CPU, memory, storage, and network monitoring
- **Android Auto Support**: Integration with Android Auto for navigation and media
- **Responsive Design**: Works on various screen sizes
- **Dark Theme**: Optimized for in-car visibility

## System Requirements

- Debian ARM-based system (e.g., Raspberry Pi, LEHX L6PRO with Rockchip PX6)
- CAN bus interface (USB-to-CAN adapter or SPI-based CAN module)
- Node.js 20.x or later
- Internet connection for initial setup

## Project Structure

```
open-car/
├── src/                  # Frontend Next.js app
├── server/               # Backend TypeScript server
│   ├── src/              # Server source code
│   │   ├── can/          # CAN bus integration
│   │   ├── system/       # System management
│   │   └── websocket/    # WebSocket server
│   └── dist/             # Compiled server code
├── setup/                # System setup scripts
│   ├── src/              # Setup script source code
│   └── dist/             # Compiled setup scripts
└── package.json          # Root package.json
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/open-car.git
cd open-car
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install setup dependencies
cd setup
npm install
cd ..
```

### 3. Build the project

```bash
# Build everything
npm run build:all
```

### 4. Set up the system (requires root)

```bash
# Run the complete setup
sudo npm run setup

# Or run individual setup steps
sudo npm run setup:can     # Set up CAN bus only
sudo npm run setup:system  # Set up system services only
```

### 5. Start the application

```bash
# Start everything
npm run start:all

# Or start components individually
npm run start        # Start frontend
npm run start:server # Start backend
```

## Development

```bash
# Run development servers
npm run dev:all

# Or run components individually
npm run dev        # Run frontend in development mode
npm run dev:server # Run backend in development mode
```

## CAN Bus Configuration

The CAN bus interface is configured by default to use `can0` with a bitrate of 500 kbps. You can customize this by editing the setup scripts or by running:

```bash
sudo npm run setup:can -- --interface can1 --bitrate 250000
```

## System Services

The setup process creates the following systemd services:

- `can-setup.service`: Sets up the CAN bus interface on boot
- `open-car.service`: Starts the OpenCar dashboard application on boot

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

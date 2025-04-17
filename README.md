# open K.I.T.T

A modern car dashboard application with CAN bus integration and Android Auto support, designed to run on Debian ARM-based systems.

## Features

- **Modern UI**: Built with Next.js and shadcn/ui components
- **CAN Bus Integration**: Real-time vehicle data via Next.js API routes
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
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes for server-side operations
│   │   │   ├── can/      # CAN bus API endpoints
│   │   │   └── system/   # System API endpoints
│   │   └── page.tsx      # Main dashboard page
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript type definitions
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
# Install dependencies
npm install

# Install setup dependencies (if needed)
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
# Start the application
npm run start
```

## Development

```bash
# Run development server
npm run dev
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

## API Routes

The application uses Next.js API routes to handle server-side operations:

### CAN Bus

- `GET /api/can/status` - Get the current status of the CAN bus
- `POST /api/can/connect` - Connect to the CAN bus
- `POST /api/can/disconnect` - Disconnect from the CAN bus

### System

- `GET /api/system/info` - Get system information (CPU, memory, storage, network)
- `POST /api/system/execute` - Execute a system command (whitelist restricted)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

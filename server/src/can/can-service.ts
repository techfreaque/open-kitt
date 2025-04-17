import { Server as SocketIOServer } from 'socket.io';
import { createRawChannel, parseDbcFile } from 'socketcan';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';
import { CanMessage, CanStatus } from './can-types.js';

const execAsync = promisify(exec);

// Store the latest CAN messages
const canMessages: Record<string, CanMessage> = {};
let canStatus: CanStatus = { connected: false, interface: '', bitrate: 0 };

// Map of known CAN IDs to human-readable names
const canIdMap: Record<string, string> = {
  '0x123': 'Engine RPM',
  '0x124': 'Vehicle Speed',
  '0x125': 'Coolant Temperature',
  '0x126': 'Fuel Level',
  '0x127': 'Battery Voltage',
  '0x128': 'Outdoor Temperature',
  '0x129': 'Oil Pressure',
  '0x12A': 'Transmission Temperature',
  // Add more mappings as needed
};

/**
 * Check if CAN interface is available and get its status
 */
async function checkCanInterface(interfaceName: string = 'can0'): Promise<CanStatus> {
  try {
    // Check if interface exists
    const { stdout: ipLinkOutput } = await execAsync(`ip -d link show ${interfaceName}`);
    
    // Extract bitrate if available
    const bitrateMatch = ipLinkOutput.match(/bitrate (\d+)/);
    const bitrate = bitrateMatch ? parseInt(bitrateMatch[1], 10) : 0;
    
    // Check if interface is up
    const isUp = ipLinkOutput.includes('state UP');
    
    return {
      connected: isUp,
      interface: interfaceName,
      bitrate,
      error: isUp ? undefined : 'Interface exists but is not up'
    };
  } catch (error) {
    logger.error(`Failed to check CAN interface: ${error instanceof Error ? error.message : String(error)}`);
    return {
      connected: false,
      interface: interfaceName,
      bitrate: 0,
      error: `Interface not found: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Try to bring up the CAN interface
 */
async function bringUpCanInterface(interfaceName: string = 'can0', bitrate: number = 500000): Promise<boolean> {
  try {
    await execAsync(`ip link set ${interfaceName} type can bitrate ${bitrate}`);
    await execAsync(`ip link set ${interfaceName} up`);
    logger.info(`CAN interface ${interfaceName} brought up with bitrate ${bitrate}`);
    return true;
  } catch (error) {
    logger.error(`Failed to bring up CAN interface: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Initialize CAN bus connection and set up message handling
 */
export async function setupCanBus(io: SocketIOServer): Promise<void> {
  // Check CAN interface status
  canStatus = await checkCanInterface();
  
  // If interface is not up, try to bring it up
  if (!canStatus.connected) {
    logger.warn(`CAN interface ${canStatus.interface} is not connected. Attempting to bring it up...`);
    const success = await bringUpCanInterface();
    if (success) {
      canStatus = await checkCanInterface();
    }
  }
  
  // Broadcast initial status
  io.emit('can:status', canStatus);
  
  // If still not connected, set up periodic retry
  if (!canStatus.connected) {
    logger.warn(`Could not connect to CAN interface. Will retry periodically.`);
    const retryInterval = setInterval(async () => {
      const success = await bringUpCanInterface();
      if (success) {
        canStatus = await checkCanInterface();
        io.emit('can:status', canStatus);
        if (canStatus.connected) {
          clearInterval(retryInterval);
          initializeCanChannel(io);
        }
      }
    }, 30000); // Retry every 30 seconds
    return;
  }
  
  // If connected, initialize the CAN channel
  initializeCanChannel(io);
}

/**
 * Initialize the CAN channel and set up message handling
 */
function initializeCanChannel(io: SocketIOServer): void {
  try {
    const channel = createRawChannel(canStatus.interface);
    
    channel.addListener('onMessage', (msg) => {
      // Format the CAN ID as a hex string
      const id = `0x${msg.id.toString(16).toUpperCase()}`;
      
      // Create a CAN message object
      const canMessage: CanMessage = {
        id,
        name: canIdMap[id] || `Unknown (${id})`,
        data: Array.from(msg.data),
        timestamp: Date.now(),
        raw: msg
      };
      
      // Store the message
      canMessages[id] = canMessage;
      
      // Broadcast the message to all connected clients
      io.emit('can:message', canMessage);
    });
    
    channel.addListener('onError', (error) => {
      logger.error(`CAN channel error: ${error}`);
      canStatus.connected = false;
      canStatus.error = error.message;
      io.emit('can:status', canStatus);
    });
    
    // Start the channel
    channel.start();
    logger.info(`CAN channel started on interface ${canStatus.interface}`);
    
    // Set up periodic status updates
    setInterval(async () => {
      const status = await checkCanInterface();
      if (status.connected !== canStatus.connected) {
        canStatus = status;
        io.emit('can:status', canStatus);
        
        // If connection was lost, try to reconnect
        if (!canStatus.connected) {
          logger.warn(`CAN connection lost. Attempting to reconnect...`);
          channel.stop();
          setupCanBus(io);
        }
      }
    }, 10000); // Check every 10 seconds
    
  } catch (error) {
    logger.error(`Failed to initialize CAN channel: ${error instanceof Error ? error.message : String(error)}`);
    canStatus.connected = false;
    canStatus.error = error instanceof Error ? error.message : String(error);
    io.emit('can:status', canStatus);
  }
}

/**
 * Get all current CAN messages
 */
export function getAllCanMessages(): CanMessage[] {
  return Object.values(canMessages);
}

/**
 * Get current CAN status
 */
export function getCanStatus(): CanStatus {
  return canStatus;
}

/**
 * Send a CAN message (for testing or control purposes)
 */
export async function sendCanMessage(id: number, data: Buffer): Promise<boolean> {
  try {
    if (!canStatus.connected) {
      throw new Error('CAN interface is not connected');
    }
    
    // Use cansend for simplicity
    const hexData = data.toString('hex').match(/.{1,2}/g)?.join(' ') || '';
    await execAsync(`cansend ${canStatus.interface} ${id.toString(16)}#${hexData}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send CAN message: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

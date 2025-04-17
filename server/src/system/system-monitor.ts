import { exec } from "child_process";
import type { Server as SocketIOServer } from "socket.io";
import si from "systeminformation";
import { promisify } from "util";

import { logger } from "../utils/logger.js";
import type { NetworkStatus, SystemInfo } from "./system-types.js";

const execAsync = promisify(exec);

// Store the latest system information
let systemInfo: SystemInfo = {
  cpu: { usage: 0, temperature: 0 },
  memory: { total: 0, used: 0, free: 0 },
  storage: { total: 0, used: 0, free: 0 },
  network: { connected: false, type: "unknown", ip: "", ssid: "" },
  time: new Date().toISOString(),
};

/**
 * Get network status information
 */
async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    // Get network interfaces
    const networkInterfaces = await si.networkInterfaces();

    // Find the active interface (prioritize wlan over eth)
    const activeInterface = networkInterfaces.find(
      (iface) =>
        iface.operstate === "up" &&
        (iface.type === "wireless" || iface.type === "wired"),
    );

    if (!activeInterface) {
      return { connected: false, type: "unknown", ip: "", ssid: "" };
    }

    // Get SSID for wireless connections
    let ssid = "";
    if (activeInterface.type === "wireless") {
      try {
        const { stdout } = await execAsync("iwgetid -r");
        ssid = stdout.trim();
      } catch (error) {
        logger.error(
          `Failed to get SSID: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      connected: true,
      type: activeInterface.type === "wireless" ? "wifi" : "ethernet",
      ip: activeInterface.ip4,
      ssid,
    };
  } catch (error) {
    logger.error(
      `Failed to get network status: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { connected: false, type: "unknown", ip: "", ssid: "" };
  }
}

/**
 * Collect system information
 */
async function collectSystemInfo(): Promise<SystemInfo> {
  try {
    // Get CPU information
    const cpuLoad = await si.currentLoad();
    const cpuTemp = await si.cpuTemperature();

    // Get memory information
    const memory = await si.mem();

    // Get storage information
    const fsSize = await si.fsSize();
    const rootFs = fsSize.find((fs) => fs.mount === "/") || fsSize[0];

    // Get network status
    const network = await getNetworkStatus();

    return {
      cpu: {
        usage: Math.round(cpuLoad.currentLoad),
        temperature: Math.round(cpuTemp.main || 0),
      },
      memory: {
        total: memory.total,
        used: memory.used,
        free: memory.free,
      },
      storage: {
        total: rootFs?.size || 0,
        used: rootFs?.used || 0,
        free: rootFs?.size ? rootFs.size - rootFs.used : 0,
      },
      network,
      time: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(
      `Failed to collect system info: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      ...systemInfo,
      time: new Date().toISOString(),
    };
  }
}

/**
 * Set up system monitoring and broadcast to clients
 */
export function setupSystemMonitoring(io: SocketIOServer): void {
  // Initial collection
  collectSystemInfo().then((info) => {
    systemInfo = info;
    io.emit("system:info", systemInfo);
  });

  // Set up periodic collection
  setInterval(async () => {
    systemInfo = await collectSystemInfo();
    io.emit("system:info", systemInfo);
  }, 5000); // Update every 5 seconds
}

/**
 * Get the latest system information
 */
export function getSystemInfo(): SystemInfo {
  return systemInfo;
}

/**
 * Execute a system command
 */
export async function executeSystemCommand(
  command: string,
): Promise<{ success: boolean; output: string }> {
  try {
    // Whitelist of allowed commands for security
    const allowedCommands = [
      "iwlist",
      "ifconfig",
      "ip",
      "systemctl status",
      "df",
      "free",
      "uptime",
      "date",
    ];

    // Check if command is allowed
    const isAllowed = allowedCommands.some((allowed) =>
      command.startsWith(allowed),
    );
    if (!isAllowed) {
      throw new Error(`Command not allowed: ${command}`);
    }

    const { stdout, stderr } = await execAsync(command);
    return {
      success: true,
      output: stdout || stderr,
    };
  } catch (error) {
    logger.error(
      `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      success: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}

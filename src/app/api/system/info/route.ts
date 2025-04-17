import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

import type { NetworkStatus, SystemInfo } from "@/types/system";

const execAsync = promisify(exec);

// Default system info
const defaultSystemInfo: SystemInfo = {
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
    // Check if we have network interfaces
    const { stdout: ipOutput } = await execAsync("ip -j addr show");
    const interfaces = JSON.parse(ipOutput);

    // Find the active interface (prioritize wlan over eth)
    const wifiInterface = interfaces.find(
      (iface: any) => iface.operstate === "UP" && iface.name.startsWith("wlan"),
    );

    const ethInterface = interfaces.find(
      (iface: any) => iface.operstate === "UP" && iface.name.startsWith("eth"),
    );

    const activeInterface = wifiInterface || ethInterface;

    if (!activeInterface) {
      return { connected: false, type: "unknown", ip: "", ssid: "" };
    }

    // Get IP address
    const ipAddress =
      activeInterface.addr_info?.find((addr: any) => addr.family === "inet")
        ?.local || "";

    // Get SSID for wireless connections
    let ssid = "";
    if (activeInterface.name.startsWith("wlan")) {
      try {
        const { stdout } = await execAsync("iwgetid -r");
        ssid = stdout.trim();
      } catch (error) {
        console.error(
          `Failed to get SSID: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      connected: true,
      type: activeInterface.name.startsWith("wlan") ? "wifi" : "ethernet",
      ip: ipAddress,
      ssid,
    };
  } catch (error) {
    console.error(
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
    const { stdout: cpuInfoOutput } = await execAsync(
      'cat /proc/stat | grep "cpu "',
    );
    const cpuInfo = cpuInfoOutput.trim().split(/\s+/).slice(1).map(Number);
    const totalCpuTime = cpuInfo.reduce((acc, val) => acc + val, 0);
    const idleTime = cpuInfo[3];
    const cpuUsage = Math.round(100 * (1 - idleTime / totalCpuTime));

    // Get CPU temperature
    let cpuTemp = 0;
    try {
      const { stdout: tempOutput } = await execAsync(
        "cat /sys/class/thermal/thermal_zone0/temp",
      );
      cpuTemp = Math.round(parseInt(tempOutput.trim(), 10) / 1000);
    } catch (error) {
      console.error(
        `Failed to get CPU temperature: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Get memory information
    const { stdout: memInfoOutput } = await execAsync("cat /proc/meminfo");
    const memInfo = memInfoOutput.split("\n").reduce((acc: any, line) => {
      const match = line.match(/^(\w+):\s+(\d+)/);
      if (match) {
        acc[match[1]] = parseInt(match[2], 10) * 1024; // Convert from KB to bytes
      }
      return acc;
    }, {});

    const totalMem = memInfo.MemTotal || 0;
    const freeMem = memInfo.MemAvailable || 0;
    const usedMem = totalMem - freeMem;

    // Get storage information
    const { stdout: dfOutput } = await execAsync("df -B1 / | tail -n 1");
    const dfInfo = dfOutput.trim().split(/\s+/);
    const totalStorage = parseInt(dfInfo[1], 10);
    const usedStorage = parseInt(dfInfo[2], 10);
    const freeStorage = parseInt(dfInfo[3], 10);

    // Get network status
    const network = await getNetworkStatus();

    return {
      cpu: {
        usage: cpuUsage,
        temperature: cpuTemp,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
      },
      storage: {
        total: totalStorage,
        used: usedStorage,
        free: freeStorage,
      },
      network,
      time: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Failed to collect system info: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      ...defaultSystemInfo,
      time: new Date().toISOString(),
    };
  }
}

export async function GET() {
  try {
    // Check if running on server
    if (typeof window !== "undefined") {
      return NextResponse.json(
        { error: "This endpoint can only be called from the server" },
        { status: 400 },
      );
    }

    const systemInfo = await collectSystemInfo();
    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error("Error getting system info:", error);
    return NextResponse.json(
      {
        ...defaultSystemInfo,
        error: "Failed to get system info",
      },
      { status: 500 },
    );
  }
}

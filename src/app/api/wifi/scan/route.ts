import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

const execAsync = promisify(exec);

interface WiFiNetwork {
  ssid: string;
  signal: number;
  secure: boolean;
  connected: boolean;
}

export async function POST() {
  try {
    // Check if running on server
    if (typeof window !== "undefined") {
      return NextResponse.json(
        { error: "This endpoint can only be called from the server" },
        { status: 400 },
      );
    }

    // Get current connection status
    const { stdout: connectedOutput } = await execAsync(
      "nmcli -t -f NAME,DEVICE con show --active",
    );
    const connectedNetworks = connectedOutput
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split(":")[0]);

    // Scan for available networks
    const { stdout } = await execAsync(
      "nmcli -t -f SSID,SIGNAL,SECURITY device wifi list",
    );

    // Parse the output
    const networks: WiFiNetwork[] = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [ssid, signalStr, security] = line.split(":");
        return {
          ssid,
          signal: parseInt(signalStr, 10),
          secure: security !== "",
          connected: connectedNetworks.includes(ssid),
        };
      })
      // Sort by signal strength (descending)
      .sort((a, b) => b.signal - a.signal);

    return NextResponse.json({ networks });
  } catch (error) {
    console.error("Error scanning WiFi networks:", error);
    return NextResponse.json(
      { error: "Failed to scan WiFi networks" },
      { status: 500 },
    );
  }
}

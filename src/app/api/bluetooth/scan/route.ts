import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

const execAsync = promisify(exec);

interface BluetoothDevice {
  id: string;
  name: string;
  type: "phone" | "audio" | "computer" | "other";
  connected: boolean;
  paired: boolean;
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

    // Get paired devices
    const { stdout: pairedOutput } = await execAsync(
      "bluetoothctl paired-devices",
    );
    const pairedDevices = pairedOutput
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/Device\s+([0-9A-F:]+)\s+(.*)/);
        return match ? { id: match[1], name: match[2] } : null;
      })
      .filter(Boolean);

    // Get connected devices
    const { stdout: connectedOutput } = await execAsync("bluetoothctl info");
    const connectedDevices = connectedOutput
      .split("\n")
      .filter((line) => line.includes("Connected: yes"))
      .map((line) => {
        const match = line.match(/Device\s+([0-9A-F:]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    // Scan for new devices
    await execAsync("bluetoothctl scan on");

    // Wait for scan to complete (5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Stop scanning
    await execAsync("bluetoothctl scan off");

    // Get all devices
    const { stdout: devicesOutput } = await execAsync("bluetoothctl devices");
    const allDevices = devicesOutput
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/Device\s+([0-9A-F:]+)\s+(.*)/);
        if (!match) {
          return null;
        }

        const id = match[1];
        const name = match[2];

        // Determine device type based on name or class
        let type: "phone" | "audio" | "computer" | "other" = "other";

        const lowerName = name.toLowerCase();
        if (
          lowerName.includes("phone") ||
          lowerName.includes("pixel") ||
          lowerName.includes("galaxy") ||
          lowerName.includes("iphone")
        ) {
          type = "phone";
        } else if (
          lowerName.includes("speaker") ||
          lowerName.includes("headphone") ||
          lowerName.includes("airpod") ||
          lowerName.includes("buds")
        ) {
          type = "audio";
        } else if (
          lowerName.includes("laptop") ||
          lowerName.includes("pc") ||
          lowerName.includes("mac") ||
          lowerName.includes("book")
        ) {
          type = "computer";
        }

        return {
          id,
          name,
          type,
          paired: pairedDevices.some((device) => device.id === id),
          connected: connectedDevices.includes(id),
        };
      })
      .filter(Boolean) as BluetoothDevice[];

    return NextResponse.json({ devices: allDevices });
  } catch (error) {
    console.error("Error scanning Bluetooth devices:", error);
    return NextResponse.json(
      { error: "Failed to scan Bluetooth devices" },
      { status: 500 },
    );
  }
}

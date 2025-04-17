import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

import type { CanStatus } from "@/types/can";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Check if running on server
    if (typeof window !== "undefined") {
      return NextResponse.json(
        { error: "This endpoint can only be called from the server" },
        { status: 400 },
      );
    }

    // Check if CAN interface exists
    const { stdout: ifconfigOutput } = await execAsync("ip -j link show");
    const interfaces = JSON.parse(ifconfigOutput);

    // Find CAN interfaces
    const canInterfaces = interfaces.filter(
      (iface: any) => iface.link_type === "can" || iface.name.startsWith("can"),
    );

    if (canInterfaces.length === 0) {
      return NextResponse.json({
        connected: false,
        interface: "can0",
        bitrate: 500_000,
        error: "No CAN interface found",
      });
    }

    // Get the first CAN interface
    const canInterface = canInterfaces[0];

    // Check if the interface is up
    const isUp = canInterface.operstate === "UP";

    // Get the bitrate
    let bitrate = 500_000; // Default
    try {
      const { stdout: canInfoOutput } = await execAsync(
        `ip -d -j link show ${canInterface.name}`,
      );
      const canInfo = JSON.parse(canInfoOutput)[0];

      if (canInfo.linkinfo?.info_data?.bitrate) {
        bitrate = canInfo.linkinfo.info_data.bitrate;
      }
    } catch (error) {
      console.error("Error getting CAN bitrate:", error);
    }

    const status: CanStatus = {
      connected: isUp,
      interface: canInterface.name,
      bitrate,
    };

    if (!isUp) {
      status.error = "CAN interface is down";
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error getting CAN status:", error);
    return NextResponse.json(
      {
        connected: false,
        interface: "can0",
        bitrate: 500_000,
        error: "Failed to get CAN status",
      },
      { status: 500 },
    );
  }
}

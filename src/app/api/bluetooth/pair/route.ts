import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    // Check if running on server
    if (typeof window !== "undefined") {
      return NextResponse.json(
        { error: "This endpoint can only be called from the server" },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    // Pair with the device
    await execAsync(`bluetoothctl pair ${id}`);

    // Trust the device for future connections
    await execAsync(`bluetoothctl trust ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error pairing with Bluetooth device:", error);
    return NextResponse.json(
      {
        error: "Failed to pair with Bluetooth device",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

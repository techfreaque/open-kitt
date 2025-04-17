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
    const { interface: canInterface = "can0", bitrate = 500_000 } = body;

    // Bring down the interface first (in case it's already up)
    try {
      await execAsync(`ip link set ${canInterface} down`);
    } catch (error) {
      // Ignore errors here, as the interface might not exist yet
    }

    // Set the bitrate
    await execAsync(`ip link set ${canInterface} type can bitrate ${bitrate}`);

    // Bring up the interface
    await execAsync(`ip link set ${canInterface} up`);

    return NextResponse.json({
      success: true,
      interface: canInterface,
      bitrate,
    });
  } catch (error) {
    console.error("Error connecting to CAN bus:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to CAN bus",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

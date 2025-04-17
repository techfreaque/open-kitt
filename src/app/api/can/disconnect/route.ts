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
    const { interface: canInterface = "can0" } = body;

    // Bring down the interface
    await execAsync(`ip link set ${canInterface} down`);

    return NextResponse.json({
      success: true,
      interface: canInterface,
    });
  } catch (error) {
    console.error("Error disconnecting from CAN bus:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to disconnect from CAN bus",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

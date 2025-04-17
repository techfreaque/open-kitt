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
    const { ssid, password, secure } = body;

    if (!ssid) {
      return NextResponse.json({ error: "SSID is required" }, { status: 400 });
    }

    // If the network is secure, password is required
    if (secure && !password) {
      return NextResponse.json(
        { error: "Password is required for secure networks" },
        { status: 400 },
      );
    }

    // Connect to the network
    let command;
    if (secure) {
      command = `nmcli device wifi connect "${ssid}" password "${password}"`;
    } else {
      command = `nmcli device wifi connect "${ssid}"`;
    }

    await execAsync(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error connecting to WiFi network:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to WiFi network",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

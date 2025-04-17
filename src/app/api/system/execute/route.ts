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
    const { command } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 },
      );
    }

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
      return NextResponse.json(
        { error: `Command not allowed: ${command}` },
        { status: 403 },
      );
    }

    // Execute the command
    const { stdout, stderr } = await execAsync(command);

    return NextResponse.json({
      success: true,
      output: stdout || stderr,
    });
  } catch (error) {
    console.error("Error executing system command:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute command",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

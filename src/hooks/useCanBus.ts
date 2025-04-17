"use client";

import { useCallback, useEffect, useState } from "react";

import type { CanMessage, CanStatus, DecodedCanData } from "@/types/can";

// Default values
const DEFAULT_CAN_STATUS: CanStatus = {
  connected: false,
  interface: "can0",
  bitrate: 500_000,
};

const DEFAULT_DECODED_DATA: DecodedCanData = {
  rpm: 0,
  speed: 0,
  coolantTemp: 0,
  fuelLevel: 0,
  batteryVoltage: 0,
  outdoorTemp: 0,
  oilPressure: 0,
  transmissionTemp: 0,
};

// Helper function to decode CAN messages
function decodeCanMessage(message: CanMessage): Partial<DecodedCanData> {
  // This is a simplified decoder - in a real application, you would use a proper DBC file parser
  // or implement specific decoding logic based on your vehicle's CAN protocol
  switch (message.id) {
    case "0x123": // Engine RPM
      return { rpm: (message.data[0] << 8) | message.data[1] };
    case "0x124": // Vehicle Speed
      return { speed: message.data[0] };
    case "0x125": // Coolant Temperature
      return { coolantTemp: message.data[0] - 40 }; // Common offset for temperature
    case "0x126": // Fuel Level
      return { fuelLevel: (message.data[0] * 100) / 255 }; // Convert to percentage
    case "0x127": // Battery Voltage
      return { batteryVoltage: message.data[0] * 0.1 }; // Scale factor
    case "0x128": // Outdoor Temperature
      return { outdoorTemp: message.data[0] - 40 }; // Common offset for temperature
    case "0x129": // Oil Pressure
      return { oilPressure: message.data[0] * 0.1 }; // Scale factor
    case "0x12A": // Transmission Temperature
      return { transmissionTemp: message.data[0] - 40 }; // Common offset for temperature
    default:
      return {};
  }
}

export function useCanBus() {
  const [messages, setMessages] = useState<Record<string, CanMessage>>({});
  const [status, setStatus] = useState<CanStatus>(DEFAULT_CAN_STATUS);
  const [decodedData, setDecodedData] =
    useState<DecodedCanData>(DEFAULT_DECODED_DATA);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch CAN status
  const fetchCanStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/can/status");
      if (!response.ok) {
        throw new Error(`Failed to fetch CAN status: ${response.statusText}`);
      }

      const canStatus: CanStatus = await response.json();
      setStatus(canStatus);
      setIsConnected(canStatus.connected);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error fetching CAN status: ${errorMessage}`);
      setIsConnected(false);
      setStatus({
        ...DEFAULT_CAN_STATUS,
        error: errorMessage,
      });
    }
  }, []);

  // Connect to CAN bus
  const connectToCan = useCallback(async () => {
    try {
      const response = await fetch("/api/can/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interface: "can0",
          bitrate: 500_000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to CAN bus: ${response.statusText}`);
      }

      await fetchCanStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error connecting to CAN bus: ${errorMessage}`);
      setStatus((prev) => ({
        ...prev,
        connected: false,
        error: errorMessage,
      }));
    }
  }, [fetchCanStatus]);

  // Disconnect from CAN bus
  const disconnectFromCan = useCallback(async () => {
    try {
      const response = await fetch("/api/can/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interface: "can0",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to disconnect from CAN bus: ${response.statusText}`,
        );
      }

      await fetchCanStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error disconnecting from CAN bus: ${errorMessage}`);
      setStatus((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [fetchCanStatus]);

  // Initial fetch of CAN status
  useEffect(() => {
    fetchCanStatus();

    // Set up polling for CAN status
    const interval = setInterval(fetchCanStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchCanStatus]);

  // Connect to WebSocket for real-time CAN messages
  useEffect(() => {
    if (status.connected) {
      // Create WebSocket connection to receive CAN messages
      const ws = new WebSocket(
        `ws://${window.location.hostname}:${window.location.port}/api/can/stream`,
      );

      ws.onopen = () => {
        console.info("WebSocket connection established for CAN data");
      };

      ws.onmessage = (event) => {
        try {
          const message: CanMessage = JSON.parse(event.data);

          // Update messages
          setMessages((prev) => ({
            ...prev,
            [message.id]: message,
          }));

          // Decode and update data
          const decoded = decodeCanMessage(message);
          setDecodedData((prev) => ({
            ...prev,
            ...decoded,
          }));
        } catch (error) {
          console.error("Error processing CAN message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.info("WebSocket connection closed");
      };

      return () => {
        ws.close();
      };
    }
  }, [status.connected]);

  // Fallback to reasonable values when disconnected
  useEffect(() => {
    if (!isConnected) {
      // Log the disconnection for monitoring
      console.warn("CAN bus disconnected - using fallback values");

      // Use last known values if available, otherwise use safe defaults
      const lastKnownValues = localStorage.getItem("lastKnownCanValues");

      if (lastKnownValues) {
        try {
          const parsedValues = JSON.parse(lastKnownValues) as DecodedCanData;
          setDecodedData(parsedValues);
        } catch (error) {
          console.error("Error parsing stored CAN values:", error);
          setFallbackValues();
        }
      } else if (decodedData.rpm === 0 && decodedData.speed === 0) {
        setFallbackValues();
      }
    } else {
      // Store current values when connected for future fallback
      localStorage.setItem("lastKnownCanValues", JSON.stringify(decodedData));
    }
  }, [isConnected, decodedData]);

  // Helper function to set fallback values
  const setFallbackValues = () => {
    setDecodedData({
      rpm: 800,
      speed: 0,
      coolantTemp: 80,
      fuelLevel: 50,
      batteryVoltage: 12.6,
      outdoorTemp: 20,
      oilPressure: 40,
      transmissionTemp: 70,
    });
  };

  return {
    isConnected,
    status,
    messages: Object.values(messages),
    decodedData,
    connectToCan,
    disconnectFromCan,
  };
}

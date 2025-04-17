"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

// Types
export interface CanMessage {
  id: string;
  name: string;
  data: number[];
  timestamp: number;
  raw: any;
}

export interface CanStatus {
  connected: boolean;
  interface: string;
  bitrate: number;
  error?: string;
}

export interface DecodedCanData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  fuelLevel: number;
  batteryVoltage: number;
  outdoorTemp: number;
  oilPressure: number;
  transmissionTemp: number;
}

interface CanEvents {
  'can:message': CanMessage;
  'can:status': CanStatus;
}

// Default values
const DEFAULT_CAN_STATUS: CanStatus = {
  connected: false,
  interface: 'can0',
  bitrate: 500000,
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
    case '0x123': // Engine RPM
      return { rpm: (message.data[0] << 8 | message.data[1]) };
    case '0x124': // Vehicle Speed
      return { speed: message.data[0] };
    case '0x125': // Coolant Temperature
      return { coolantTemp: message.data[0] - 40 }; // Common offset for temperature
    case '0x126': // Fuel Level
      return { fuelLevel: (message.data[0] * 100) / 255 }; // Convert to percentage
    case '0x127': // Battery Voltage
      return { batteryVoltage: (message.data[0] * 0.1) }; // Scale factor
    case '0x128': // Outdoor Temperature
      return { outdoorTemp: message.data[0] - 40 }; // Common offset for temperature
    case '0x129': // Oil Pressure
      return { oilPressure: message.data[0] * 0.1 }; // Scale factor
    case '0x12A': // Transmission Temperature
      return { transmissionTemp: message.data[0] - 40 }; // Common offset for temperature
    default:
      return {};
  }
}

export function useCanBus(serverUrl: string = 'http://localhost:3001') {
  const [messages, setMessages] = useState<Record<string, CanMessage>>({});
  const [status, setStatus] = useState<CanStatus>(DEFAULT_CAN_STATUS);
  const [decodedData, setDecodedData] = useState<DecodedCanData>(DEFAULT_DECODED_DATA);

  // Connect to WebSocket
  const { isConnected, subscribe, emit } = useWebSocket<CanEvents>({
    url: serverUrl,
    autoConnect: true,
    onConnect: () => console.log('Connected to CAN WebSocket'),
    onDisconnect: () => console.log('Disconnected from CAN WebSocket'),
    onError: (error) => console.error('CAN WebSocket error:', error),
  });

  // Handle CAN messages
  useEffect(() => {
    const unsubscribeMessage = subscribe('can:message', (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.id]: message,
      }));

      // Decode the message and update decoded data
      const decoded = decodeCanMessage(message);
      if (Object.keys(decoded).length > 0) {
        setDecodedData((prev) => ({
          ...prev,
          ...decoded,
        }));
      }
    });

    const unsubscribeStatus = subscribe('can:status', (status) => {
      setStatus(status);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
    };
  }, [subscribe]);

  // Function to send a CAN message
  const sendCanMessage = useCallback((id: number, data: number[]) => {
    return emit('can:send', { id, data });
  }, [emit]);

  // Fallback to last known values when disconnected
  useEffect(() => {
    if (!isConnected) {
      // Log the disconnection for monitoring
      console.warn('CAN bus disconnected - using last known values');

      // If we have no data at all, initialize with safe defaults
      if (decodedData.rpm === 0 && decodedData.speed === 0) {
        setDecodedData(prev => ({
          ...prev,
          rpm: 800,
          speed: 0,
          coolantTemp: 80,
          fuelLevel: 50,
          batteryVoltage: 12.6,
          outdoorTemp: 20,
          oilPressure: 40,
          transmissionTemp: 70,
        }));
      }
    }
  }, [isConnected, decodedData]);

  return {
    isConnected,
    status,
    messages: Object.values(messages),
    decodedData,
    sendCanMessage,
  };
}

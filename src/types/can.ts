/**
 * Represents a CAN message
 */
export interface CanMessage {
  id: string;
  name: string;
  data: number[];
  timestamp: number;
  raw: any; // Raw message from socketcan
}

/**
 * Represents the status of the CAN interface
 */
export interface CanStatus {
  connected: boolean;
  interface: string;
  bitrate: number;
  error?: string;
}

/**
 * Represents a decoded CAN signal
 */
export interface CanSignal {
  name: string;
  value: number | string;
  unit?: string;
  min?: number;
  max?: number;
  description?: string;
}

/**
 * Represents decoded CAN data
 */
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

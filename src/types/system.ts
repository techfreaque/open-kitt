/**
 * Represents network connection status
 */
export interface NetworkStatus {
  connected: boolean;
  type: "wifi" | "ethernet" | "unknown";
  ip: string;
  ssid: string;
}

/**
 * Represents system information
 */
export interface SystemInfo {
  cpu: {
    usage: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
  };
  network: NetworkStatus;
  time: string;
}

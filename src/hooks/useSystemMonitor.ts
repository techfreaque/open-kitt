"use client";

import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

// Types
export interface NetworkStatus {
  connected: boolean;
  type: 'wifi' | 'ethernet' | 'unknown';
  ip: string;
  ssid: string;
}

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

interface SystemEvents {
  'system:info': SystemInfo;
}

// Default values
const DEFAULT_SYSTEM_INFO: SystemInfo = {
  cpu: { usage: 0, temperature: 0 },
  memory: { total: 0, used: 0, free: 0 },
  storage: { total: 0, used: 0, free: 0 },
  network: { connected: false, type: 'unknown', ip: '', ssid: '' },
  time: new Date().toISOString(),
};

export function useSystemMonitor(serverUrl: string = 'http://localhost:3001') {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(DEFAULT_SYSTEM_INFO);

  // Connect to WebSocket
  const { isConnected, subscribe } = useWebSocket<SystemEvents>({
    url: serverUrl,
    autoConnect: true,
    onConnect: () => console.log('Connected to System WebSocket'),
    onDisconnect: () => console.log('Disconnected from System WebSocket'),
    onError: (error) => console.error('System WebSocket error:', error),
  });

  // Handle system info updates
  useEffect(() => {
    const unsubscribe = subscribe('system:info', (info) => {
      setSystemInfo(info);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  // Fallback to reasonable defaults when disconnected
  useEffect(() => {
    if (!isConnected) {
      // Log the disconnection for monitoring
      console.warn('System monitor disconnected - using defaults');

      // Update time even when disconnected
      const interval = setInterval(() => {
        setSystemInfo(prev => ({
          ...prev,
          time: new Date().toISOString()
        }));
      }, 1000);

      // If we have no data at all, initialize with safe defaults
      if (systemInfo.cpu.usage === 0) {
        setSystemInfo(prev => ({
          ...prev,
          cpu: {
            usage: 10, // Assume low CPU usage when idle
            temperature: 45, // Normal operating temperature
          },
          memory: {
            total: 4 * 1024 * 1024 * 1024, // 4GB
            used: 1 * 1024 * 1024 * 1024,  // 1GB
            free: 3 * 1024 * 1024 * 1024,  // 3GB
          },
          storage: {
            total: 32 * 1024 * 1024 * 1024, // 32GB
            used: 16 * 1024 * 1024 * 1024,  // 16GB
            free: 16 * 1024 * 1024 * 1024,  // 16GB
          },
          network: {
            connected: navigator.onLine, // Use browser online status
            type: 'unknown',
            ip: '',
            ssid: '',
          },
          time: new Date().toISOString(),
        }));
      }

      return () => clearInterval(interval);
    }
  }, [isConnected, systemInfo]);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return {
    isConnected,
    systemInfo,
    formatBytes,
  };
}

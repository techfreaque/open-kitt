"use client";

import { useCallback, useEffect, useState } from "react";

import type { SystemInfo } from "@/types/system";

// Default values
const DEFAULT_SYSTEM_INFO: SystemInfo = {
  cpu: { usage: 0, temperature: 0 },
  memory: { total: 0, used: 0, free: 0 },
  storage: { total: 0, used: 0, free: 0 },
  network: { connected: false, type: "unknown", ip: "", ssid: "" },
  time: new Date().toISOString(),
};

export function useSystemMonitor() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(DEFAULT_SYSTEM_INFO);
  const [isConnected, setIsConnected] = useState(true);

  // Fetch system information
  const fetchSystemInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/system/info");
      if (!response.ok) {
        throw new Error(`Failed to fetch system info: ${response.statusText}`);
      }

      const info: SystemInfo = await response.json();
      setSystemInfo(info);
      setIsConnected(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error fetching system info: ${errorMessage}`);
      setIsConnected(false);

      // Update time even when disconnected
      setSystemInfo((prev) => ({
        ...prev,
        time: new Date().toISOString(),
        error: errorMessage,
      }));
    }
  }, []);

  // Initial fetch and set up polling
  useEffect(() => {
    // Fetch immediately
    fetchSystemInfo();

    // Set up polling
    const interval = setInterval(fetchSystemInfo, 5000);

    // Update time more frequently
    const timeInterval = setInterval(() => {
      setSystemInfo((prev) => ({
        ...prev,
        time: new Date().toISOString(),
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [fetchSystemInfo]);

  // Fallback to reasonable defaults when disconnected
  useEffect(() => {
    if (isConnected) {
      // Store current values when connected for future fallback
      try {
        const systemInfoToStore = {
          ...systemInfo,
          time: new Date().toISOString(), // Don't store the exact time
        };
        localStorage.setItem(
          "lastKnownSystemInfo",
          JSON.stringify(systemInfoToStore),
        );
      } catch (error) {
        console.error("Error storing system info:", error);
      }
      return;
    }

    // Log the disconnection for monitoring
    console.warn("System monitor disconnected - using fallback values");

    // Update time even when disconnected
    const interval = setInterval(() => {
      setSystemInfo((prev) => ({
        ...prev,
        time: new Date().toISOString(),
      }));
    }, 1000);

    // Try to use stored values first
    const lastKnownInfo = localStorage.getItem("lastKnownSystemInfo");

    if (lastKnownInfo) {
      try {
        const parsedInfo = JSON.parse(lastKnownInfo) as SystemInfo;
        setSystemInfo(() => ({
          ...parsedInfo,
          time: new Date().toISOString(),
          network: {
            ...parsedInfo.network,
            connected: navigator.onLine, // Update with current online status
          },
        }));
      } catch (error) {
        console.error("Error parsing stored system info:", error);
        setFallbackSystemInfo();
      }
    } else if (systemInfo.cpu.usage === 0) {
      setFallbackSystemInfo();
    }

    return () => clearInterval(interval);
  }, [isConnected, systemInfo]);

  // Helper function to set fallback system info
  const setFallbackSystemInfo = () => {
    setSystemInfo((prev) => ({
      ...prev,
      cpu: {
        usage: 10, // Assume low CPU usage when idle
        temperature: 45, // Normal operating temperature
      },
      memory: {
        total: 4 * 1024 * 1024 * 1024, // 4GB
        used: 1 * 1024 * 1024 * 1024, // 1GB
        free: 3 * 1024 * 1024 * 1024, // 3GB
      },
      storage: {
        total: 32 * 1024 * 1024 * 1024, // 32GB
        used: 16 * 1024 * 1024 * 1024, // 16GB
        free: 16 * 1024 * 1024 * 1024, // 16GB
      },
      network: {
        connected: navigator.onLine, // Use browser online status
        type: "unknown",
        ip: "",
        ssid: "",
      },
      time: new Date().toISOString(),
    }));
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  };

  return {
    isConnected,
    systemInfo,
    formatBytes,
  };
}

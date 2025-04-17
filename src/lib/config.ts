/**
 * Application configuration
 */

// Configuration type
export interface Config {
  // Display settings
  display: {
    fullscreen: boolean;
    brightness: number;
    theme: "dark" | "light" | "auto";
  };

  // System settings
  system: {
    serverUrl: string;
    autostart: boolean;
    debugMode: boolean;
  };

  // CAN bus settings
  canBus: {
    interface: string;
    bitrate: number;
    autoConnect: boolean;
  };

  // Android Auto settings
  androidAuto: {
    enabled: boolean;
    wirelessMode: boolean;
    autoConnect: boolean;
  };
}

// Default configuration
export const DEFAULT_CONFIG: Config = {
  display: {
    fullscreen: true,
    brightness: 100,
    theme: "dark",
  },
  system: {
    serverUrl: "http://localhost:3001",
    autostart: true,
    debugMode: false,
  },
  canBus: {
    interface: "can0",
    bitrate: 500_000,
    autoConnect: true,
  },
  androidAuto: {
    enabled: true,
    wirelessMode: true,
    autoConnect: true,
  },
};

// Load configuration from localStorage
export function loadConfig(): Config {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIG;
  }

  try {
    const savedConfig = localStorage.getItem("dashboard-config");
    if (!savedConfig) {
      return DEFAULT_CONFIG;
    }

    const parsedConfig = JSON.parse(savedConfig);
    return {
      ...DEFAULT_CONFIG,
      ...parsedConfig,
      // Ensure nested objects are properly merged
      display: { ...DEFAULT_CONFIG.display, ...(parsedConfig.display || {}) },
      system: { ...DEFAULT_CONFIG.system, ...(parsedConfig.system || {}) },
      canBus: { ...DEFAULT_CONFIG.canBus, ...(parsedConfig.canBus || {}) },
      androidAuto: {
        ...DEFAULT_CONFIG.androidAuto,
        ...(parsedConfig.androidAuto || {}),
      },
    } satisfies Config;
  } catch (error) {
    console.error("Failed to load configuration:", error);
    return DEFAULT_CONFIG;
  }
}

// Save configuration to localStorage
export function saveConfig(config: Config): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("dashboard-config", JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save configuration:", error);
  }
}

// Update configuration
export function updateConfig(partialConfig: Partial<Config>): Config {
  const currentConfig = loadConfig();
  const newConfig = {
    ...currentConfig,
    ...partialConfig,
    display: {
      ...currentConfig.display,
      ...(partialConfig.display || {}),
    },
    system: {
      ...currentConfig.system,
      ...(partialConfig.system || {}),
    },
    canBus: {
      ...currentConfig.canBus,
      ...(partialConfig.canBus || {}),
    },
    androidAuto: {
      ...currentConfig.androidAuto,
      ...(partialConfig.androidAuto || {}),
    },
  };

  saveConfig(newConfig);
  return newConfig;
}

// Export a singleton instance for use throughout the app
export const config = loadConfig();

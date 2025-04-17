/**
 * Application configuration
 */

import { z } from 'zod';

// Configuration schema
export const ConfigSchema = z.object({
  // Display settings
  display: z.object({
    fullscreen: z.boolean().default(true),
    brightness: z.number().min(0).max(100).default(100),
    theme: z.enum(['dark', 'light', 'auto']).default('dark'),
  }),
  
  // System settings
  system: z.object({
    serverUrl: z.string().url().default('http://localhost:3001'),
    autostart: z.boolean().default(true),
    debugMode: z.boolean().default(false),
  }),
  
  // CAN bus settings
  canBus: z.object({
    interface: z.string().default('can0'),
    bitrate: z.number().default(500000),
    autoConnect: z.boolean().default(true),
  }),
  
  // Android Auto settings
  androidAuto: z.object({
    enabled: z.boolean().default(true),
    wirelessMode: z.boolean().default(true),
    autoConnect: z.boolean().default(true),
  }),
});

// Configuration type
export type Config = z.infer<typeof ConfigSchema>;

// Default configuration
export const DEFAULT_CONFIG: Config = {
  display: {
    fullscreen: true,
    brightness: 100,
    theme: 'dark',
  },
  system: {
    serverUrl: 'http://localhost:3001',
    autostart: true,
    debugMode: false,
  },
  canBus: {
    interface: 'can0',
    bitrate: 500000,
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
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }
  
  try {
    const savedConfig = localStorage.getItem('opencar-config');
    if (!savedConfig) {
      return DEFAULT_CONFIG;
    }
    
    const parsedConfig = JSON.parse(savedConfig);
    return ConfigSchema.parse({
      ...DEFAULT_CONFIG,
      ...parsedConfig,
    });
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return DEFAULT_CONFIG;
  }
}

// Save configuration to localStorage
export function saveConfig(config: Config): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('opencar-config', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save configuration:', error);
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

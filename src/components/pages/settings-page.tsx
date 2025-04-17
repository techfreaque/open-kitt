"use client";

import {
  BatteryMedium,
  Bluetooth,
  Info,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  Volume2,
  Wifi,
} from "lucide-react";
import { useState } from "react";

import { useSystemMonitor } from "@/hooks/useSystemMonitor";

export function SettingsPage() {
  const { systemInfo } = useSystemMonitor();
  const [scanning, setScanning] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(
    systemInfo.network.type === "wifi",
  );
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [volume, setVolume] = useState(70);

  const wifiNetworks = [
    {
      ssid: "Home Network",
      signal: 90,
      secured: true,
      connected: systemInfo.network.ssid === "Home Network",
    },
    { ssid: "Guest Network", signal: 75, secured: true, connected: false },
    { ssid: "Public WiFi", signal: 60, secured: false, connected: false },
    { ssid: "Neighbor's WiFi", signal: 40, secured: true, connected: false },
  ];

  const bluetoothDevices = [
    { name: "Car Stereo", type: "audio", paired: true, connected: true },
    { name: "My Phone", type: "phone", paired: true, connected: false },
    {
      name: "Wireless Headphones",
      type: "audio",
      paired: false,
      connected: false,
    },
  ];

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className="h-full w-full">
      {/* Tesla-style header */}
      <div className="mb-6">
        <h1 className="text-3xl font-medium mb-1">Settings</h1>
        <p className="text-gray-400">System preferences and connectivity</p>
      </div>

      {/* Settings categories */}
      <div className="space-y-6">
        {/* Display settings */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium">Display</h3>
          </div>

          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-blue-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
              <span>Dark Mode</span>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative ${darkMode ? "bg-blue-500/50" : "bg-white/20"} transition-colors`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${darkMode ? "bg-blue-400 right-1" : "bg-white left-1"}`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <BatteryMedium className="h-5 w-5 text-green-400" />
              <span>Power Saving Mode</span>
            </div>
            <button className="w-12 h-6 rounded-full relative bg-white/20 transition-colors">
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all"></div>
            </button>
          </div>
        </div>

        {/* Sound settings */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium">Sound</h3>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span>System Volume</span>
              <span className="text-sm text-gray-400">{volume}%</span>
            </div>
            <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-400 h-1.5 rounded-full"
                style={{ width: `${volume}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* WiFi settings */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium">WiFi</h3>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative ${wifiEnabled ? "bg-blue-500/50" : "bg-white/20"} transition-colors`}
              onClick={() => setWifiEnabled(!wifiEnabled)}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${wifiEnabled ? "bg-blue-400 right-1" : "bg-white left-1"}`}
              ></div>
            </button>
          </div>

          {wifiEnabled && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Available Networks
                </span>
                <button
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                  onClick={handleScan}
                  disabled={scanning}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`}
                  />
                  {scanning ? "Scanning..." : "Scan"}
                </button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {wifiNetworks.map((network) => (
                  <div
                    key={network.ssid}
                    className={`p-3 rounded-lg flex items-center justify-between ${network.connected ? "bg-blue-500/20" : "bg-white/5 hover:bg-white/10"} transition-colors`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {network.ssid}
                        {network.secured && (
                          <span className="text-xs text-gray-400">🔒</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Signal: {network.signal}%
                      </div>
                    </div>
                    {network.connected ? (
                      <button className="px-3 py-1 rounded-full bg-white/10 text-xs hover:bg-white/20 transition-colors">
                        Disconnect
                      </button>
                    ) : (
                      <button className="px-3 py-1 rounded-full bg-blue-500/30 text-xs text-blue-400 hover:bg-blue-500/40 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bluetooth settings */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bluetooth className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium">Bluetooth</h3>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative ${bluetoothEnabled ? "bg-blue-500/50" : "bg-white/20"} transition-colors`}
              onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${bluetoothEnabled ? "bg-blue-400 right-1" : "bg-white left-1"}`}
              ></div>
            </button>
          </div>

          {bluetoothEnabled && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Paired Devices</span>
                <button
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                  onClick={handleScan}
                  disabled={scanning}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`}
                  />
                  {scanning ? "Scanning..." : "Scan"}
                </button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {bluetoothDevices.map((device) => (
                  <div
                    key={device.name}
                    className={`p-3 rounded-lg flex items-center justify-between ${device.connected ? "bg-blue-500/20" : "bg-white/5 hover:bg-white/10"} transition-colors`}
                  >
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-gray-400">
                        {device.type} •{" "}
                        {device.paired ? "Paired" : "Not paired"}
                      </div>
                    </div>
                    {device.connected ? (
                      <button className="px-3 py-1 rounded-full bg-white/10 text-xs hover:bg-white/20 transition-colors">
                        Disconnect
                      </button>
                    ) : (
                      <button className="px-3 py-1 rounded-full bg-blue-500/30 text-xs text-blue-400 hover:bg-blue-500/40 transition-colors">
                        {device.paired ? "Connect" : "Pair"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System info */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium">System Information</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-2 border-b border-white/10">
              <span className="text-gray-400">CPU Usage</span>
              <span>{systemInfo.cpu.usage}%</span>
            </div>
            <div className="flex justify-between p-2 border-b border-white/10">
              <span className="text-gray-400">Memory</span>
              <span>
                {Math.round(systemInfo.memory.used / 1024)} MB /{" "}
                {Math.round(systemInfo.memory.total / 1024)} MB
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-white/10">
              <span className="text-gray-400">Storage</span>
              <span>
                {Math.round(systemInfo.storage.used / 1024 / 1024)} GB /{" "}
                {Math.round(systemInfo.storage.total / 1024 / 1024)} GB
              </span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-gray-400">Uptime</span>
              <span>
                {Math.floor(systemInfo.uptime / 3600)} hours{" "}
                {Math.floor((systemInfo.uptime % 3600) / 60)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

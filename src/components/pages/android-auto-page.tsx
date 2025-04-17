"use client";

import {
  AlertTriangle,
  Bluetooth,
  Car,
  CheckCircle,
  ChevronRight,
  MapPin,
  MessageSquare,
  Music,
  Phone,
  RefreshCw,
  Settings,
  Smartphone,
  Wifi,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export function AndroidAutoPage() {
  const [connectionMethod, setConnectionMethod] = useState<
    "bluetooth" | "wireless" | null
  >(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "failed"
  >("idle");
  const [showConnectionError, setShowConnectionError] = useState(false);

  // Scan for Android Auto compatible devices
  const scanForDevices = async () => {
    setIsScanning(true);
    setAvailableDevices([]);

    try {
      // In a real implementation, this would use the Bluetooth API
      // or a native bridge to access the car's Bluetooth system
      const devices = await window.navigator?.bluetooth?.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['android_auto']
      }) || null;

      // Since we can't actually use the Bluetooth API in this demo,
      // we'll simulate finding devices based on stored paired devices
      const pairedDevices = localStorage.getItem('pairedDevices');
      const deviceList = pairedDevices ? JSON.parse(pairedDevices) : [];

      if (deviceList.length > 0) {
        // Simulate finding devices with slight delays to appear realistic
        for (let i = 0; i < deviceList.length; i++) {
          setTimeout(() => {
            setAvailableDevices(prev => [...prev, deviceList[i]]);
            if (i === deviceList.length - 1) {
              setIsScanning(false);
            }
          }, 800 * (i + 1));
        }
      } else {
        // If no paired devices, add some default ones for demo purposes
        // In production, this would be empty until actual devices are found
        const defaultDevices = ['Google Pixel 7', 'Samsung Galaxy S22'];
        localStorage.setItem('pairedDevices', JSON.stringify(defaultDevices));

        for (let i = 0; i < defaultDevices.length; i++) {
          setTimeout(() => {
            setAvailableDevices(prev => [...prev, defaultDevices[i]]);
            if (i === defaultDevices.length - 1) {
              setIsScanning(false);
            }
          }, 800 * (i + 1));
        }
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      setIsScanning(false);
    }
  };

  // Connect to a device
  const connectToDevice = async (device: string) => {
    setConnectionStatus("connecting");
    setConnectedDevice(device);

    try {
      // In a real implementation, this would use the Android Auto API
      // or a native bridge to establish the connection

      // Simulate the connection process with a slight delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store the connected device in localStorage
      localStorage.setItem('connectedDevice', device);
      localStorage.setItem('connectionMethod', connectionMethod || 'bluetooth');

      setConnectionStatus("connected");
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to device:', error);
      setConnectionStatus("failed");
      setShowConnectionError(true);
      setTimeout(() => setShowConnectionError(false), 5000);
    }
  };

  // Disconnect from device
  const disconnectDevice = () => {
    setConnectionStatus("idle");
    setIsConnected(false);
    setConnectedDevice(null);
    setConnectionMethod(null);

    // Remove connection info from localStorage
    localStorage.removeItem('connectedDevice');
    localStorage.removeItem('connectionMethod');
  };

  // Load connection state from localStorage and auto-scan on first load
  useEffect(() => {
    // Check if we have a previously connected device
    const savedDevice = localStorage.getItem('connectedDevice');
    const savedMethod = localStorage.getItem('connectionMethod') as 'bluetooth' | 'wireless' | null;

    if (savedDevice) {
      setConnectedDevice(savedDevice);
      setConnectionMethod(savedMethod);
      setConnectionStatus('connected');
      setIsConnected(true);
    } else {
      // If no saved connection, scan for devices
      scanForDevices();
    }

    // Monitor connection status
    const interval = setInterval(() => {
      // In a real implementation, this would check the actual connection status
      // For now, we'll just simulate occasional connection drops
      if (isConnected && Math.random() > 0.95) {
        disconnectDevice();
        localStorage.removeItem('connectedDevice');
        localStorage.removeItem('connectionMethod');
        setShowConnectionError(true);
        setTimeout(() => setShowConnectionError(false), 5000);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="h-full w-full">
      {/* Enhanced Tesla-style header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-medium mb-1">Android Auto</h1>
          <p className="text-gray-400">Connect your Android device</p>
        </div>
        <button
          onClick={scanForDevices}
          className="flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors"
          disabled={isScanning}
        >
          <RefreshCw
            className={`h-4 w-4 text-blue-400 ${isScanning ? "animate-spin" : ""}`}
          />
          <span className="text-sm">{isScanning ? "Scanning..." : "Scan"}</span>
        </button>
      </div>

      {/* Connection status with animation */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg shadow-black/20 border border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-black/60 rounded-xl flex items-center justify-center relative overflow-hidden">
            <Smartphone
              className={`h-12 w-12 ${isConnected ? "text-blue-400" : "text-white/70"}`}
            />
            {connectionStatus === "connecting" && (
              <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center animate-pulse">
                <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-light mb-1">
              {connectionStatus === "connecting"
                ? "Connecting..."
                : isConnected
                  ? "Connected"
                  : "Not Connected"}
            </h2>
            <p className="text-lg text-gray-300 mb-1">
              {connectionStatus === "connecting"
                ? "Establishing connection"
                : isConnected
                  ? `Connected to ${connectedDevice}`
                  : "Connect your Android device"}
            </p>
            <p className="text-sm text-gray-400">
              {connectionMethod === "bluetooth" && "Via Bluetooth"}
              {connectionMethod === "wireless" && "Via Wireless"}
              {!connectionMethod && "Select a connection method below"}
            </p>

            {/* Connection status indicator */}
            {connectionStatus === "connecting" && (
              <div className="mt-2 bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-400 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            )}
          </div>
          <div
            className={`w-4 h-4 rounded-full ${connectionStatus === "connected" ? "bg-green-400" : connectionStatus === "connecting" ? "bg-blue-400 animate-pulse" : connectionStatus === "failed" ? "bg-red-400" : "bg-amber-400"}`}
          />
        </div>
      </div>

      {/* Connection error alert */}
      {showConnectionError && (
        <div className="mb-6 bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-400">Connection Failed</h3>
              <p className="text-sm text-red-300/80">
                Unable to establish connection with device. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection methods */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors shadow-lg shadow-black/20 border border-white/5 ${connectionMethod === "bluetooth" ? "bg-blue-500/20" : "hover:bg-black/60"}`}
          onClick={() => {
            setConnectionMethod("bluetooth");
            connectToDevice("Google Pixel 7");
          }}
          disabled={connectionStatus === "connecting"}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${connectionMethod === "bluetooth" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}
          >
            <Bluetooth className="h-6 w-6" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium">Bluetooth</div>
            <div className="text-xs text-gray-400">Connect via Bluetooth</div>
          </div>
          {connectionMethod === "bluetooth" &&
            connectionStatus === "connected" && (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
        </button>

        <button
          className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors shadow-lg shadow-black/20 border border-white/5 ${connectionMethod === "wireless" ? "bg-blue-500/20" : "hover:bg-black/60"}`}
          onClick={() => {
            setConnectionMethod("wireless");
            connectToDevice("Samsung Galaxy S22");
          }}
          disabled={connectionStatus === "connecting"}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${connectionMethod === "wireless" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}
          >
            <Wifi className="h-6 w-6" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium">Wireless</div>
            <div className="text-xs text-gray-400">Connect wirelessly</div>
          </div>
          {connectionMethod === "wireless" &&
            connectionStatus === "connected" && (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
        </button>
      </div>

      {/* Available devices */}
      {isScanning && (
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg shadow-black/20 border border-white/5">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
            Scanning for devices...
          </h3>

          <div className="space-y-2">
            {availableDevices.map((device, index) => (
              <div
                key={index}
                className="p-3 bg-white/5 rounded-lg flex items-center justify-between animate-fadeIn"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <span>{device}</span>
                </div>
                <button
                  className="px-3 py-1 rounded-full bg-blue-500/20 text-xs text-blue-400 hover:bg-blue-500/30 transition-colors"
                  onClick={() => connectToDevice(device)}
                >
                  Connect
                </button>
              </div>
            ))}

            {availableDevices.length === 0 && (
              <div className="p-4 text-center text-gray-400 animate-pulse">
                Searching for nearby devices...
              </div>
            )}
          </div>
        </div>
      )}

      {/* App shortcuts - only shown when connected */}
      {isConnected && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-400" />
            Android Auto Apps
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <button className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-black/60 transition-colors shadow-lg shadow-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-sm">Maps</span>
            </button>

            <button className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-black/60 transition-colors shadow-lg shadow-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Music className="h-6 w-6" />
              </div>
              <span className="text-sm">Music</span>
            </button>

            <button className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-black/60 transition-colors shadow-lg shadow-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-sm">Calls</span>
            </button>

            <button className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-black/60 transition-colors shadow-lg shadow-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-sm">Messages</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings and actions */}
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between shadow-lg shadow-black/20 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Android Auto Settings</div>
              <div className="text-xs text-gray-400">
                Configure connection preferences
              </div>
            </div>
          </div>
          <button className="px-4 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition-colors flex items-center gap-1">
            Open
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isConnected && (
          <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between shadow-lg shadow-black/20 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Disconnect Device</div>
                <div className="text-xs text-gray-400">
                  End Android Auto session
                </div>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-full bg-red-500/20 text-sm text-red-400 hover:bg-red-500/30 transition-colors"
              onClick={disconnectDevice}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Android Auto™ is a trademark of Google LLC
        </p>
      </div>
    </div>
  );
}

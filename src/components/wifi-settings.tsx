"use client";

import { Lock, LockOpen, RefreshCw, Wifi, WifiOff } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface WiFiNetwork {
  ssid: string;
  signal: number;
  secure: boolean;
  connected: boolean;
}

interface WiFiSettingsProps {
  className?: string;
}

export function WiFiSettings({ className }: WiFiSettingsProps) {
  const [enabled, setEnabled] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(
    null,
  );
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Scan for networks using the backend API
  const scanNetworks = async () => {
    setScanning(true);

    try {
      // Call the backend API to scan for networks
      const response = await fetch("/api/wifi/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Network scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      setNetworks(data.networks);
    } catch (error) {
      console.error("Failed to scan networks:", error);
      // Fallback to empty networks list
      setNetworks([]);
    } finally {
      setScanning(false);
    }
  };

  // Connect to a network
  const connectToNetwork = (network: WiFiNetwork) => {
    if (network.connected) {
      // Already connected, do nothing
      return;
    }

    if (network.secure && !password) {
      // Need password for secure network
      setSelectedNetwork(network);
      return;
    }

    setConnecting(true);

    // Simulate connection delay
    setTimeout(() => {
      // Update networks to show connected status
      setNetworks((prev) =>
        prev.map((n) => ({
          ...n,
          connected: n.ssid === network.ssid,
        })),
      );

      setConnecting(false);
      setSelectedNetwork(null);
      setPassword("");
    }, 2000);
  };

  // Disconnect from a network
  const disconnectFromNetwork = (network: WiFiNetwork) => {
    if (!network.connected) {
      // Not connected, do nothing
      return;
    }

    // Update networks to show disconnected status
    setNetworks((prev) =>
      prev.map((n) => ({
        ...n,
        connected: n.ssid === network.ssid ? false : n.connected,
      })),
    );
  };

  // Connect with password
  const connectWithPassword = async () => {
    if (!selectedNetwork) {
      return;
    }

    setConnecting(true);

    try {
      // Call the backend API to connect to the network
      const response = await fetch("/api/wifi/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ssid: selectedNetwork.ssid,
          password,
          secure: selectedNetwork.secure,
        }),
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update networks to show connected status
        setNetworks((prev) =>
          prev.map((n) => ({
            ...n,
            connected: n.ssid === selectedNetwork.ssid,
          })),
        );
      } else {
        throw new Error(data.error || "Failed to connect to network");
      }
    } catch (error) {
      console.error("Failed to connect to network:", error);
      // Show error to user
      alert(
        `Failed to connect: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setConnecting(false);
      setSelectedNetwork(null);
      setPassword("");
    }
  };

  // Initial scan
  useEffect(() => {
    if (enabled) {
      scanNetworks();
    }
  }, [enabled]);

  // Get signal strength icon
  const getSignalIcon = (signal: number) => {
    if (signal >= 70) {
      return "bg-green-500";
    } else if (signal >= 40) {
      return "bg-yellow-500";
    } else {
      return "bg-red-500";
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WiFi Settings
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </CardTitle>
        <CardDescription>
          {enabled
            ? "Connect to available WiFi networks"
            : "WiFi is currently disabled"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled ? (
          <>
            {/* Network list */}
            <div className="space-y-2">
              {networks.map((network) => (
                <div
                  key={network.ssid}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Wifi className="h-5 w-5" />
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-2 h-2 rounded-full",
                          getSignalIcon(network.signal),
                        )}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{network.ssid}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {network.secure ? (
                          <>
                            <Lock className="h-3 w-3" />
                            Secured
                          </>
                        ) : (
                          <>
                            <LockOpen className="h-3 w-3" />
                            Open
                          </>
                        )}
                        {network.connected && (
                          <span className="ml-2 text-green-500">
                            • Connected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={network.connected ? "destructive" : "default"}
                    size="sm"
                    onClick={() =>
                      network.connected
                        ? disconnectFromNetwork(network)
                        : connectToNetwork(network)
                    }
                  >
                    {network.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}

              {networks.length === 0 && !scanning && (
                <div className="text-center py-8 text-muted-foreground">
                  No networks found
                </div>
              )}

              {scanning && (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Scanning for networks...
                </div>
              )}
            </div>

            {/* Password dialog */}
            {selectedNetwork && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="font-medium">
                  Connect to {selectedNetwork.ssid}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wifi-password">Password</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    placeholder="Enter network password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedNetwork(null);
                      setPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={connectWithPassword}
                    disabled={!password || connecting}
                  >
                    {connecting ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <WifiOff className="h-12 w-12 mb-4" />
            <p>WiFi is turned off</p>
            <p className="text-sm">Enable WiFi to see available networks</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 ml-auto"
          onClick={scanNetworks}
          disabled={!enabled || scanning}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", scanning && "animate-spin")}
          />
          {scanning ? "Scanning..." : "Scan"}
        </Button>
      </CardFooter>
    </Card>
  );
}

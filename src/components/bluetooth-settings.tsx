"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bluetooth, BluetoothOff, RefreshCw, Smartphone, Headphones, Speaker, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BluetoothDevice {
  id: string;
  name: string;
  type: 'phone' | 'audio' | 'computer' | 'other';
  connected: boolean;
  paired: boolean;
}

interface BluetoothSettingsProps {
  className?: string;
}

export function BluetoothSettings({ className }: BluetoothSettingsProps) {
  const [enabled, setEnabled] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  // Scan for Bluetooth devices using the backend API
  const scanDevices = async () => {
    setScanning(true);

    try {
      // Call the backend API to scan for devices
      const response = await fetch('/api/bluetooth/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Bluetooth scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      setDevices(data.devices);
    } catch (error) {
      console.error('Failed to scan Bluetooth devices:', error);
      // Fallback to empty devices list or keep existing
      // Don't clear existing devices on error
    } finally {
      setScanning(false);
    }
  };

  // Connect to a device
  const connectToDevice = async (device: BluetoothDevice) => {
    if (device.connected) {
      // Already connected, do nothing
      return;
    }

    try {
      // Call the backend API to connect to the device
      const response = await fetch('/api/bluetooth/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: device.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update devices to show connected status
        setDevices(prev =>
          prev.map(d => ({
            ...d,
            connected: d.id === device.id ? true : d.connected
          }))
        );
      } else {
        throw new Error(data.error || 'Failed to connect to device');
      }
    } catch (error) {
      console.error('Failed to connect to device:', error);
      // Show error to user
      alert(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Disconnect from a device
  const disconnectFromDevice = (device: BluetoothDevice) => {
    if (!device.connected) {
      // Not connected, do nothing
      return;
    }

    // Update devices to show disconnected status
    setDevices(prev =>
      prev.map(d => ({
        ...d,
        connected: d.id === device.id ? false : d.connected
      }))
    );
  };

  // Pair a device
  const pairDevice = (device: BluetoothDevice) => {
    if (device.paired) {
      // Already paired, do nothing
      return;
    }

    // Update devices to show paired status
    setDevices(prev =>
      prev.map(d => ({
        ...d,
        paired: d.id === device.id ? true : d.paired
      }))
    );
  };

  // Unpair a device
  const unpairDevice = (device: BluetoothDevice) => {
    if (!device.paired) {
      // Not paired, do nothing
      return;
    }

    // Update devices to show unpaired status
    setDevices(prev =>
      prev.map(d => ({
        ...d,
        paired: d.id === device.id ? false : d.paired,
        connected: d.id === device.id ? false : d.connected
      }))
    );
  };

  // Initial scan
  useEffect(() => {
    if (enabled) {
      scanDevices();
    }
  }, [enabled]);

  // Get device icon
  const getDeviceIcon = (type: BluetoothDevice['type']) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'computer':
        return <Laptop className="h-5 w-5" />;
      default:
        return <Bluetooth className="h-5 w-5" />;
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Bluetooth Settings
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </CardTitle>
        <CardDescription>
          {enabled
            ? 'Connect to available Bluetooth devices'
            : 'Bluetooth is currently disabled'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled ? (
          <>
            {/* Device list */}
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">Paired Devices</div>
              {devices.filter(d => d.paired).map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {device.connected ? (
                          <span className="text-green-500">Connected</span>
                        ) : (
                          <span>Paired</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={device.connected ? "destructive" : "default"}
                      size="sm"
                      onClick={() => device.connected
                        ? disconnectFromDevice(device)
                        : connectToDevice(device)
                      }
                    >
                      {device.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unpairDevice(device)}
                    >
                      Unpair
                    </Button>
                  </div>
                </div>
              ))}

              <div className="text-sm font-medium mt-4 mb-2">Available Devices</div>
              {devices.filter(d => !d.paired).map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Available
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pairDevice(device)}
                  >
                    Pair
                  </Button>
                </div>
              ))}

              {devices.length === 0 && !scanning && (
                <div className="text-center py-8 text-muted-foreground">
                  No devices found
                </div>
              )}

              {scanning && (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Scanning for devices...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BluetoothOff className="h-12 w-12 mb-4" />
            <p>Bluetooth is turned off</p>
            <p className="text-sm">Enable Bluetooth to see available devices</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 ml-auto"
          onClick={scanDevices}
          disabled={!enabled || scanning}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
          {scanning ? 'Scanning...' : 'Scan'}
        </Button>
      </CardFooter>
    </Card>
  );
}

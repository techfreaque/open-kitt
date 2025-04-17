"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Thermometer, Droplet, Battery, Gauge as GaugeIcon, Settings, Clock, AlertTriangle, Wifi as WifiIcon, Cpu, HardDrive, Wifi, Bluetooth, Smartphone, Music, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useCanBus } from "@/hooks/useCanBus";
import { useSystemMonitor } from "@/hooks/useSystemMonitor";
import { MediaPlayer } from "@/components/media-player";
import { AndroidAuto } from "@/components/android-auto";
import { ClimateControl } from "@/components/climate-control";
import { WiFiSettings } from "@/components/wifi-settings";
import { BluetoothSettings } from "@/components/bluetooth-settings";
import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { SettingsDialog } from "@/components/settings-dialog";
import { loadConfig } from "@/lib/config";

// Define types
type GaugeProps = {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  icon?: React.ReactNode;
};



// Gauge component
function Gauge({ value, max, label, unit, color, icon }: GaugeProps) {
  const percentage = (value / max) * 100;

  return (
    <Card className="w-full max-w-[250px]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pb-0">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-muted stroke-current"
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              className={`stroke-current ${color}`}
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              fill="none"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (percentage * 251.2) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{unit}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 justify-center">
        <p className="text-sm text-muted-foreground">{Math.round(percentage)}% of max</p>
      </CardFooter>
    </Card>
  );
}

// Media Player component
function MediaPlayer() {
  const [volume, setVolume] = useState(75);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Player</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Currently Playing</h3>
            <p className="text-sm text-muted-foreground">Artist - Song Title</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">1:23</span>
            <span className="text-sm text-muted-foreground">3:45</span>
          </div>
          <Slider defaultValue={[33]} max={100} step={1} />
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="icon" className="rounded-full">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" className="rounded-full h-12 w-12">
            <Play className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(vals) => setVolume(vals[0])}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Android Auto component
function AndroidAuto() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Android Auto</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-medium">Connect Your Device</h3>
          <p className="text-sm text-muted-foreground">Access navigation, media, and more from your Android device</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Bluetooth className="h-4 w-4" />
            Bluetooth
          </Button>
          <Button className="gap-2">
            <Wifi className="h-4 w-4" />
            Wireless
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">Android Auto™ is a trademark of Google LLC</p>
      </CardFooter>
    </Card>
  );
}



export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { decodedData, status: canStatus } = useCanBus();
  const { systemInfo } = useSystemMonitor();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const config = loadConfig();

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Apply fullscreen mode on initial load if configured
  useEffect(() => {
    if (config.display.fullscreen && typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    }
  }, [config.display.fullscreen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GaugeIcon className="h-6 w-6 text-primary" />
          OpenCar Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Thermometer className="h-4 w-4" />
            {systemInfo.network.connected ? (
              <span>{Math.round(decodedData.outdoorTemp)}°C</span>
            ) : (
              <span>{Math.round(systemInfo.cpu.temperature)}°C</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            {systemInfo.network.connected ? (
              <>
                {systemInfo.network.type === 'wifi' ? (
                  <WifiIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <Wifi className="h-4 w-4 text-green-500" />
                )}
                <span>{systemInfo.network.ssid || systemInfo.network.ip}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Offline</span>
              </>
            )}
          </div>
          <FullscreenToggle />
          <SettingsDialog />
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GaugeIcon className="h-5 w-5" />
                CAN Bus Data
                {canStatus.connected ? (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">Connected</span>
                ) : (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded-full">Disconnected</span>
                )}
              </CardTitle>
              <CardDescription>
                {canStatus.connected
                  ? `Interface: ${canStatus.interface} (${canStatus.bitrate / 1000} kbps)`
                  : canStatus.error || 'Waiting for connection...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] overflow-y-auto space-y-2">
              {/* Engine RPM */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <GaugeIcon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Engine RPM</div>
                    <div className="text-xs text-muted-foreground">0x123</div>
                  </div>
                </div>
                <div className="font-mono text-sm bg-background px-2 py-1 rounded">{decodedData.rpm} rpm</div>
              </div>

              {/* Vehicle Speed */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <GaugeIcon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Vehicle Speed</div>
                    <div className="text-xs text-muted-foreground">0x124</div>
                  </div>
                </div>
                <div className="font-mono text-sm bg-background px-2 py-1 rounded">{decodedData.speed} km/h</div>
              </div>

              {/* Coolant Temperature */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Coolant Temp</div>
                    <div className="text-xs text-muted-foreground">0x125</div>
                  </div>
                </div>
                <div className="font-mono text-sm bg-background px-2 py-1 rounded">{decodedData.coolantTemp} °C</div>
              </div>

              {/* Fuel Level */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Fuel Level</div>
                    <div className="text-xs text-muted-foreground">0x126</div>
                  </div>
                </div>
                <div className="font-mono text-sm bg-background px-2 py-1 rounded">{decodedData.fuelLevel} %</div>
              </div>

              {/* Battery Voltage */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Battery Voltage</div>
                    <div className="text-xs text-muted-foreground">0x127</div>
                  </div>
                </div>
                <div className="font-mono text-sm bg-background px-2 py-1 rounded">{decodedData.batteryVoltage.toFixed(1)} V</div>
              </div>

              {/* Outdoor Temperature */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Outdoor Temp</div>
                    <div className="text-xs text-muted-foreground">0x128</div>
                  </div>
                </div>
                <div className="font-mono text-sm bg-background px-2 py-1 rounded">{decodedData.outdoorTemp} °C</div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" size="sm" className="gap-1 ml-auto">
                <Settings className="h-3.5 w-3.5" />
                Configure
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main dashboard */}
        <div className="lg:col-span-3 space-y-4">
          {/* Gauges */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
              <CardDescription>Real-time performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-8">
                <Gauge
                  value={Math.round(decodedData.speed)}
                  max={180}
                  label="Speed"
                  unit="km/h"
                  color="text-primary"
                  icon={<GaugeIcon className="h-4 w-4" />}
                />
                <Gauge
                  value={Math.round(decodedData.rpm)}
                  max={7000}
                  label="RPM"
                  unit="rpm"
                  color="text-destructive"
                  icon={<GaugeIcon className="h-4 w-4" />}
                />
                <Gauge
                  value={Math.round(decodedData.fuelLevel)}
                  max={100}
                  label="Fuel"
                  unit="%"
                  color="text-green-500"
                  icon={<Droplet className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media, Android Auto, and Climate Control */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <MediaPlayer />
            </div>
            <div className="md:col-span-1">
              <AndroidAuto />
            </div>
            <div className="md:col-span-1">
              <Tabs defaultValue="climate">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="climate">Climate</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="climate">
                  <ClimateControl />
                </TabsContent>

                <TabsContent value="settings">
                  <Tabs defaultValue="wifi">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="wifi">WiFi</TabsTrigger>
                      <TabsTrigger value="bluetooth">Bluetooth</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wifi">
                      <WiFiSettings />
                    </TabsContent>

                    <TabsContent value="bluetooth">
                      <BluetoothSettings />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t text-muted-foreground text-sm">
        <div className="flex justify-between items-center">
          <div>
            OpenCar Dashboard - CAN Bus Integration & Android Auto Support
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              {systemInfo.cpu.usage}%
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-4 w-4" />
              {Math.round((systemInfo.storage.used / systemInfo.storage.total) * 100)}%
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

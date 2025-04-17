"use client";

import {
  Bluetooth,
  Gauge as GaugeIcon,
  Info,
  Laptop,
  Maximize,
  Monitor,
  Moon,
  Settings,
  Sun,
  Volume2,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Config } from "@/lib/config";
import { loadConfig, updateConfig } from "@/lib/config";

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [config, setConfig] = useState<Config>(loadConfig());
  const [open, setOpen] = useState(false);

  // Update config when settings change
  const handleConfigChange = (partialConfig: Partial<Config>) => {
    const newConfig = updateConfig(partialConfig);
    setConfig(newConfig);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const newFullscreen = !config.display.fullscreen;
    handleConfigChange({ display: { fullscreen: newFullscreen } });

    if (newFullscreen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`,
          );
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  // Set theme
  const setTheme = (theme: Config["display"]["theme"]) => {
    handleConfigChange({ display: { theme } });

    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Auto theme based on system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Apply theme when component mounts
  useEffect(() => {
    setTheme(config.display.theme);
  }, [config.display.theme]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="display" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize className="h-4 w-4" />
                <Label htmlFor="fullscreen-mode">Fullscreen Mode</Label>
              </div>
              <Switch
                id="fullscreen-mode"
                checked={config.display.fullscreen}
                onCheckedChange={() => toggleFullscreen()}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <Label>Brightness</Label>
              </div>
              <Slider
                value={[config.display.brightness]}
                max={100}
                step={1}
                onValueChange={(vals) =>
                  handleConfigChange({ display: { brightness: vals[0] } })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={
                    config.display.theme === "light" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={
                    config.display.theme === "dark" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={
                    config.display.theme === "auto" ? "default" : "outline"
                  }
                  className="flex-1"
                  onClick={() => setTheme("auto")}
                >
                  <Laptop className="h-4 w-4 mr-2" />
                  Auto
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GaugeIcon className="h-4 w-4" />
                <Label htmlFor="can-autoconnect">Auto-connect CAN Bus</Label>
              </div>
              <Switch
                id="can-autoconnect"
                checked={config.canBus.autoConnect}
                onCheckedChange={(checked) =>
                  handleConfigChange({ canBus: { autoConnect: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4" />
                <Label htmlFor="android-auto">Enable Android Auto</Label>
              </div>
              <Switch
                id="android-auto"
                checked={config.androidAuto.enabled}
                onCheckedChange={(checked) =>
                  handleConfigChange({ androidAuto: { enabled: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <Label htmlFor="wireless-android-auto">
                  Wireless Android Auto
                </Label>
              </div>
              <Switch
                id="wireless-android-auto"
                checked={config.androidAuto.wirelessMode}
                onCheckedChange={(checked) =>
                  handleConfigChange({ androidAuto: { wirelessMode: checked } })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Label htmlFor="system-sounds">System Sounds</Label>
              </div>
              <Switch id="system-sounds" checked={true} />
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-4">
              <GaugeIcon className="h-16 w-16 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-1">OpenCar Dashboard</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>

              <div className="mt-6 text-sm text-center">
                <p className="mb-2">
                  A modern car dashboard with CAN bus integration
                </p>
                <p className="mb-2">and Android Auto support</p>
                <p className="text-xs text-muted-foreground">
                  © 2023 OpenCar Project
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs">
                This software is open source and provided as-is without
                warranty. Always keep your attention on the road while driving.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Battery, Car, Cpu, HardDrive, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";

import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { NavBar } from "@/components/nav-bar";
import { AndroidAutoPage } from "@/components/pages/android-auto-page";
import { ClimatePage } from "@/components/pages/climate-page";
import { DashboardPage } from "@/components/pages/dashboard-page";
import { MediaPage } from "@/components/pages/media-page";
import { SettingsPage } from "@/components/pages/settings-page";
import { SwipeablePages } from "@/components/swipeable-pages";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCanBus } from "@/hooks/useCanBus";
import { useSystemMonitor } from "@/hooks/useSystemMonitor";
import { loadConfig } from "@/lib/config";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePage, setActivePage] = useState(0);
  const [showBatteryVoltage, setShowBatteryVoltage] = useState(false);
  const { decodedData } = useCanBus();
  const { systemInfo } = useSystemMonitor();
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
    if (
      config.display.fullscreen &&
      typeof document !== "undefined" &&
      !document.fullscreenElement
    ) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  }, [config.display.fullscreen]);

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* Status Bar */}
      <div className="status-bar fixed top-0 left-0 right-0 z-50 px-6 py-2 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/60 to-transparent h-16 w-full">
        {/* Left side - Time and System Info */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start">
            <div className="text-xl font-light">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-xs text-gray-400">
              {currentTime.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {/* System Info */}
          <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs">{systemInfo.cpu.usage}%</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs">
                {Math.round(
                  (systemInfo.storage.used / systemInfo.storage.total) * 100,
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Center - Vehicle status */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/5">
            <Car className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium">Ready to drive</span>
          </div>
        </div>

        {/* Right side - System info and controls */}
        <div className="flex items-center gap-4">
          {/* Battery status with toggle */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/5">
            <Battery className="h-4 w-4 text-green-400" />
            <button
              onClick={() => setShowBatteryVoltage(!showBatteryVoltage)}
              className="text-xs font-medium"
            >
              {showBatteryVoltage
                ? `${decodedData.batteryVoltage.toFixed(1)}V`
                : `${Math.round((decodedData.batteryVoltage / 14) * 100)}%`}
            </button>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/5">
            <Thermometer className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium">
              {Math.round(decodedData.outdoorTemp)}°C
            </span>
          </div>

          {/* System controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <FullscreenToggle />
          </div>
        </div>
      </div>

      {/* Main content with swipeable pages */}
      <main className="h-full w-full pt-16 pb-24">
        {/* Added padding-top and padding-bottom to prevent overlap with status bar and navbar */}
        <SwipeablePages onPageChange={setActivePage}>
          <DashboardPage />
          <MediaPage />
          <ClimatePage />
          <AndroidAutoPage />
          <SettingsPage />
        </SwipeablePages>
      </main>

      {/* Enhanced Tesla-style app dock */}
      <div className="nav-bar fixed bottom-0 left-0 right-0 z-50 flex justify-center h-24 w-full">
        <div className="bg-gradient-to-t from-black/90 via-black/80 to-black/70 backdrop-blur-md rounded-t-2xl px-2 py-3 shadow-lg shadow-black/50 border-t border-white/5 w-full max-w-7xl">
          <NavBar activePage={activePage} onPageChange={setActivePage} />
        </div>
      </div>
    </div>
  );
}

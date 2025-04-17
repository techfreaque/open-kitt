"use client";

import {
  Car,
  Check,
  Flame,
  GaugeIcon,
  Music,
  Settings,
  Smartphone,
  Thermometer,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useCanBus } from "@/hooks/useCanBus";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Temperature thresholds for auto seat heating
interface SeatHeatingThresholds {
  off: number; // Temperature above which heating is off
  low: number; // Temperature below which heating is low
  medium: number; // Temperature below which heating is medium
  high: number; // Temperature below which heating is high
}

// Default thresholds for auto seat heating
const DEFAULT_SEAT_HEATING_THRESHOLDS: SeatHeatingThresholds = {
  off: 20, // Above 20°C, heating is off
  low: 15, // Between 15-20°C, heating is low
  medium: 10, // Between 10-15°C, heating is medium
  high: 5, // Below 5°C, heating is high
};

// Get the appropriate heating level based on temperature and thresholds
function getAutoHeatingLevel(
  temperature: number,
  thresholds: SeatHeatingThresholds = DEFAULT_SEAT_HEATING_THRESHOLDS,
): number {
  if (temperature >= thresholds.off) {
    return 0; // Off
  } else if (temperature >= thresholds.low) {
    return 1; // Low
  } else if (temperature >= thresholds.medium) {
    return 2; // Medium
  } else if (temperature >= thresholds.high) {
    return 3; // High
  } else {
    return 3; // High (for very cold temperatures)
  }
}

interface NavBarProps {
  activePage: number;
  onPageChange: (page: number) => void;
}

export function NavBar({
  activePage,
  onPageChange,
}: NavBarProps): React.ReactNode {
  const { decodedData } = useCanBus();

  // Use localStorage to persist seat heating settings
  const [driverHeat, setDriverHeat] = useLocalStorage<number>("driverHeat", 4); // Default to auto (4)
  const [passengerHeat, setPassengerHeat] = useLocalStorage<number>(
    "passengerHeat",
    4,
  ); // Default to auto (4)

  // Track if passenger is present (based on weight sensor)
  const [passengerPresent, setPassengerPresent] = useState(false);

  // Simulate passenger detection
  useEffect(() => {
    // For demo purposes, randomly detect passenger every 10 seconds
    const interval = setInterval(() => {
      setPassengerPresent(Math.random() > 0.5);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Match the order in SwipeablePages component
  const navItems = [
    { icon: <GaugeIcon className="h-6 w-6" />, label: "Dashboard" },
    { icon: <Music className="h-6 w-6" />, label: "Media" },
    { icon: <Thermometer className="h-6 w-6" />, label: "Climate" },
    { icon: <Smartphone className="h-6 w-6" />, label: "Android Auto" },
    { icon: <Settings className="h-6 w-6" />, label: "Settings" },
  ];

  // Toggle driver seat heating level (0-4)
  const toggleDriverHeat = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent triggering the parent button
    setDriverHeat((prev) => (prev >= 4 ? 0 : prev + 1));
  };

  // Toggle passenger seat heating level (0-4)
  const togglePassengerHeat = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent triggering the parent button
    setPassengerHeat((prev) => (prev >= 4 ? 0 : prev + 1));
  };

  // Auto-heat based on temperature and passenger detection
  useEffect(() => {
    // Check if either seat is in auto mode (level 4)
    const isDriverAuto = driverHeat === 4;
    const isPassengerAuto = passengerHeat === 4;

    if (!isDriverAuto && !isPassengerAuto) {
      return;
    }

    // Get the outdoor temperature from CAN bus
    const outdoorTemp = decodedData.outdoorTemp;

    // Calculate the appropriate heating level based on temperature
    const autoHeatingLevel = getAutoHeatingLevel(
      outdoorTemp,
      DEFAULT_SEAT_HEATING_THRESHOLDS,
    );

    // Only update seats that are in auto mode
    if (isDriverAuto) {
      // Keep it in auto mode (4) but apply the effect visually
      setDriverHeat(4);
    }

    if (isPassengerAuto) {
      // Only apply heating if passenger is present
      if (passengerPresent) {
        // Keep it in auto mode (4) but apply the effect visually
        setPassengerHeat(4);
      } else {
        // Turn off heating if no passenger is detected
        setPassengerHeat(4); // Keep in auto mode, but it will be visually off
      }
    }
  }, [
    driverHeat,
    passengerHeat,
    decodedData.outdoorTemp,
    passengerPresent,
    setDriverHeat,
    setPassengerHeat,
  ]);

  // Get the effective heating level for display (what would be applied in auto mode)
  const getEffectiveHeatLevel = (
    isAuto: boolean,
    isPassenger: boolean = false,
  ): number => {
    if (!isAuto) {
      return 0;
    } // Not in auto mode

    // For passenger seat, check if passenger is present
    if (isPassenger && !passengerPresent) {
      return 0;
    }

    // Calculate based on outdoor temperature
    return getAutoHeatingLevel(decodedData.outdoorTemp);
  };

  // Get the driver's effective heat level
  const driverEffectiveHeat =
    driverHeat === 4 ? getEffectiveHeatLevel(true) : driverHeat;

  // Get the passenger's effective heat level
  const passengerEffectiveHeat =
    passengerHeat === 4 ? getEffectiveHeatLevel(true, true) : passengerHeat;

  return (
    <div className="flex justify-between items-center w-full px-4">
      {/* All navigation items in a single row */}
      <div className="flex items-center gap-4 justify-center w-full">
        {/* Driver seat heating */}
        <button
          onClick={toggleDriverHeat}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${driverHeat > 0 ? "bg-gradient-to-b from-red-500/20 to-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
          aria-label="Driver Seat"
        >
          <div className="w-14 h-14 flex items-center justify-center relative">
            <Flame className={`h-6 w-6 ${getHeatColor(driverEffectiveHeat)}`} />
            {driverHeat === 4 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-medium">
              {driverHeat === 0
                ? "Off"
                : driverHeat === 1
                  ? "Low"
                  : driverHeat === 2
                    ? "Med"
                    : driverHeat === 3
                      ? "High"
                      : "Auto"}
            </span>
          </div>
        </button>

        {/* Main navigation items */}
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
              activePage === index
                ? "bg-gradient-to-b from-white/20 to-white/5 text-white scale-105 shadow-lg shadow-black/30 border border-white/10"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
            onClick={() => {
              // Dispatch custom event for SwipeablePages to listen to
              window.dispatchEvent(
                new CustomEvent("pageChange", { detail: index }),
              );
              // Also call the provided callback
              onPageChange(index);
            }}
            aria-label={item.label}
          >
            <div className="w-14 h-14 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}

        {/* Passenger seat heating */}
        <button
          onClick={togglePassengerHeat}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${passengerHeat > 0 && passengerPresent ? "bg-gradient-to-b from-red-500/20 to-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
          aria-label="Passenger Seat"
        >
          <div className="w-14 h-14 flex items-center justify-center relative">
            <Flame
              className={`h-6 w-6 ${getHeatColor(passengerEffectiveHeat)}`}
            />
            {passengerHeat === 4 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full" />
            )}
            {/* Passenger presence indicator */}
            <div className="absolute -bottom-1 -right-1">
              {passengerPresent ? (
                <div className="flex items-center justify-center h-3 w-3 bg-green-400 rounded-full">
                  <Check className="h-2 w-2 text-white" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-3 w-3 bg-red-400 rounded-full">
                  <X className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3 text-purple-400" />
            <span className="text-xs font-medium">
              {passengerHeat === 0
                ? "Off"
                : passengerHeat === 1
                  ? "Low"
                  : passengerHeat === 2
                    ? "Med"
                    : passengerHeat === 3
                      ? "High"
                      : "Auto"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

// Helper function to get heat color based on level
function getHeatColor(level: number): string {
  switch (level) {
    case 0:
      return "text-white/50";
    case 1:
      return "text-amber-400";
    case 2:
      return "text-orange-500";
    case 3:
      return "text-red-500";
    case 4:
      return "text-blue-400"; // Auto mode
    default:
      return "text-white/50";
  }
}

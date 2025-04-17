"use client";

import {
  ArrowDown,
  ArrowUp,
  Car,
  Droplet,
  Fan,
  Power,
  RotateCcw,
  Snowflake,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useCanBus } from "@/hooks/useCanBus";

export function ClimatePage(): React.ReactNode {
  const { decodedData } = useCanBus();

  // Load climate settings from localStorage or use defaults
  const [driverTemp, setDriverTemp] = useState(() => {
    const saved = localStorage.getItem("driverTemp");
    return saved ? parseFloat(saved) : 22;
  });

  const [passengerTemp, setPassengerTemp] = useState(() => {
    const saved = localStorage.getItem("passengerTemp");
    return saved ? parseFloat(saved) : 22;
  });

  const [tempSynced, setTempSynced] = useState(() => {
    const saved = localStorage.getItem("tempSynced");
    return saved ? saved === "true" : true;
  });

  const [fanSpeed, setFanSpeed] = useState(() => {
    const saved = localStorage.getItem("fanSpeed");
    return saved ? parseInt(saved, 10) : 2;
  });

  const [isAcOn, setIsAcOn] = useState(() => {
    const saved = localStorage.getItem("isAcOn");
    return saved ? saved === "true" : false;
  });

  const [isAutoOn, setIsAutoOn] = useState(() => {
    const saved = localStorage.getItem("isAutoOn");
    return saved ? saved === "true" : true;
  });

  const [isRecirculateOn, setIsRecirculateOn] = useState(() => {
    const saved = localStorage.getItem("isRecirculateOn");
    return saved ? saved === "true" : false;
  });

  const [airDirection, setAirDirection] = useState(() => {
    const saved = localStorage.getItem("airDirection");
    return saved || "face";
  });

  const [isPowerOn, setIsPowerOn] = useState(() => {
    const saved = localStorage.getItem("isPowerOn");
    return saved ? saved === "true" : true;
  });

  // Get environmental data from CAN bus
  const outdoorTemp = decodedData.outdoorTemp;
  const humidity = 65; // This would come from a humidity sensor if available

  // Helper function to update temperatures based on sync status
  const updateTemperature = (isDriver: boolean, value: number): void => {
    if (tempSynced) {
      setDriverTemp(value);
      setPassengerTemp(value);
    } else if (isDriver) {
      setDriverTemp(value);
    } else {
      setPassengerTemp(value);
    }
  };

  // Save climate settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("driverTemp", driverTemp.toString());
    localStorage.setItem("passengerTemp", passengerTemp.toString());
    localStorage.setItem("tempSynced", tempSynced.toString());
    localStorage.setItem("fanSpeed", fanSpeed.toString());
    localStorage.setItem("isAcOn", isAcOn.toString());
    localStorage.setItem("isAutoOn", isAutoOn.toString());
    localStorage.setItem("isRecirculateOn", isRecirculateOn.toString());
    localStorage.setItem("airDirection", airDirection);
    localStorage.setItem("isPowerOn", isPowerOn.toString());
  }, [
    driverTemp,
    passengerTemp,
    tempSynced,
    fanSpeed,
    isAcOn,
    isAutoOn,
    isRecirculateOn,
    airDirection,
    isPowerOn,
  ]);

  return (
    <div className="h-full w-full">
      {/* Enhanced Tesla-style header with outdoor temperature */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-medium mb-1">Climate</h1>
          <p className="text-gray-400">Temperature and air control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-2xl font-light">{outdoorTemp}°C</div>
            <div className="text-xs text-gray-400">Outside</div>
          </div>
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isPowerOn ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/70"}`}
            onClick={() => setIsPowerOn(!isPowerOn)}
          >
            <Power className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Dual temperature controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Driver temperature */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center shadow-lg shadow-black/20 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium">Driver</span>
          </div>
          <div className="text-7xl font-light mb-4">{driverTemp}°</div>
          <div className="flex items-center gap-6">
            <button
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() =>
                updateTemperature(true, Math.max(16, driverTemp - 0.5))
              }
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() =>
                updateTemperature(true, Math.min(30, driverTemp + 0.5))
              }
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Passenger temperature */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center shadow-lg shadow-black/20 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium">Passenger</span>
          </div>
          <div className="text-7xl font-light mb-4">{passengerTemp}°</div>
          <div className="flex items-center gap-6">
            <button
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() =>
                updateTemperature(false, Math.max(16, passengerTemp - 0.5))
              }
              disabled={tempSynced}
            >
              <ArrowDown className="h-5 w-5" opacity={tempSynced ? 0.5 : 1} />
            </button>
            <button
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() =>
                updateTemperature(false, Math.min(30, passengerTemp + 0.5))
              }
              disabled={tempSynced}
            >
              <ArrowUp className="h-5 w-5" opacity={tempSynced ? 0.5 : 1} />
            </button>
          </div>
        </div>
      </div>

      {/* Temperature sync control */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${tempSynced ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}
          onClick={() => setTempSynced(!tempSynced)}
        >
          <Thermometer className="h-4 w-4" />
          <span className="text-sm font-medium">
            {tempSynced ? "Temperatures Synced" : "Sync Temperatures"}
          </span>
        </button>
      </div>

      {/* Climate controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Fan speed control */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-black/20 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Fan className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Fan Speed</span>
            </div>
            <span className="text-xl font-light">{fanSpeed}</span>
          </div>
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(fanSpeed / 5) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => setFanSpeed(Math.max(0, fanSpeed - 1))}
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => setFanSpeed(Math.min(5, fanSpeed + 1))}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Air direction */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-black/20 border border-white/5">
          <h3 className="text-sm font-medium mb-3">Air Direction</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${airDirection === "face" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              onClick={() => setAirDirection("face")}
            >
              <Wind className="h-6 w-6" />
              <span className="text-xs">Face</span>
            </button>
            <button
              className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${airDirection === "mix" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              onClick={() => setAirDirection("mix")}
            >
              <Wind className="h-6 w-6" />
              <span className="text-xs">Mix</span>
            </button>
            <button
              className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${airDirection === "feet" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              onClick={() => setAirDirection("feet")}
            >
              <Wind className="h-6 w-6" />
              <span className="text-xs">Feet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors shadow-lg shadow-black/20 border border-white/5 ${isAcOn ? "bg-blue-500/20" : "hover:bg-black/60"}`}
          onClick={() => setIsAcOn(!isAcOn)}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isAcOn ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}
          >
            <Snowflake className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">A/C</div>
            <div className="text-xs text-gray-400">Air conditioning</div>
          </div>
        </button>

        <button
          className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors shadow-lg shadow-black/20 border border-white/5 ${isRecirculateOn ? "bg-blue-500/20" : "hover:bg-black/60"}`}
          onClick={() => setIsRecirculateOn(!isRecirculateOn)}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isRecirculateOn ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}
          >
            <RotateCcw className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">Recirculate</div>
            <div className="text-xs text-gray-400">
              Internal air circulation
            </div>
          </div>
        </button>

        <button
          className={`bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-colors shadow-lg shadow-black/20 border border-white/5 ${isAutoOn ? "bg-blue-500/20" : "hover:bg-black/60"}`}
          onClick={() => setIsAutoOn(!isAutoOn)}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isAutoOn ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}
          >
            <Thermometer className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium">Auto</div>
            <div className="text-xs text-gray-400">Automatic climate</div>
          </div>
        </button>
      </div>

      {/* Environmental info */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-black/20 border border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Thermometer className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Outside Temperature</div>
              <div className="text-2xl font-light">{outdoorTemp}°C</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Droplet className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Humidity</div>
              <div className="text-2xl font-light">{humidity}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

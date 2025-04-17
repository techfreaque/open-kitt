"use client";

import {
  AlertTriangle,
  Car,
  Droplet,
  GaugeIcon,
  Navigation,
  Thermometer,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useCanBus } from "@/hooks/useCanBus";

export function DashboardPage() {
  const { decodedData, status: canStatus } = useCanBus();
  // Load trip data from localStorage or use defaults
  const [tripDistance, setTripDistance] = useState(() => {
    const saved = localStorage.getItem("tripDistance");
    return saved ? parseFloat(saved) : 0;
  });

  const [tripTime, setTripTime] = useState(() => {
    const saved = localStorage.getItem("tripTime");
    return saved || "0:00";
  });

  const [avgSpeed, setAvgSpeed] = useState(() => {
    const saved = localStorage.getItem("avgSpeed");
    return saved ? parseFloat(saved) : 0;
  });

  const [range, setRange] = useState(() => {
    // Calculate based on fuel level
    return Math.round(decodedData.fuelLevel * 5.5);
  });

  const [efficiency, setEfficiency] = useState(() => {
    const saved = localStorage.getItem("efficiency");
    return saved ? parseFloat(saved) : 7.8;
  });

  const [odometer, setOdometer] = useState(() => {
    const saved = localStorage.getItem("odometer");
    return saved ? parseFloat(saved) : 0;
  });

  // Update vehicle data based on real CAN data
  useEffect(() => {
    // Only update when the vehicle is moving
    if (decodedData.speed > 0) {
      // Calculate distance traveled since last update (km)
      // Speed is in km/h, so we need to convert to km per interval
      // 5000ms = 5s = 5/3600 hour
      const hourFraction = 5 / 3600;
      const distanceDelta = decodedData.speed * hourFraction;

      // Update trip distance
      const newTripDistance = +(tripDistance + distanceDelta).toFixed(1);
      setTripDistance(newTripDistance);
      localStorage.setItem("tripDistance", newTripDistance.toString());

      // Update trip time (format: h:mm)
      const [hours, minutes] = tripTime.split(":").map(Number);
      let newMinutes = minutes + 1;
      let newHours = hours;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours++;
      }
      const newTripTime = `${newHours}:${newMinutes.toString().padStart(2, "0")}`;
      setTripTime(newTripTime);
      localStorage.setItem("tripTime", newTripTime);

      // Calculate average speed
      const newAvgSpeed = Math.round(
        newTripDistance / (newHours + newMinutes / 60 || 1),
      );
      setAvgSpeed(newAvgSpeed);
      localStorage.setItem("avgSpeed", newAvgSpeed.toString());

      // Update odometer
      const newOdometer = +(odometer + distanceDelta).toFixed(1);
      setOdometer(newOdometer);
      localStorage.setItem("odometer", newOdometer.toString());

      // Calculate efficiency (L/100km) based on RPM and speed
      // This is a simplified model - in a real car this would come from actual fuel consumption data
      if (decodedData.speed > 0) {
        // Higher RPM relative to speed means worse efficiency
        const rpmSpeedRatio = decodedData.rpm / decodedData.speed;
        const calculatedEfficiency = +(5 + rpmSpeedRatio / 20).toFixed(1);
        setEfficiency(calculatedEfficiency);
        localStorage.setItem("efficiency", calculatedEfficiency.toString());
      }
    }

    // Always update range based on fuel level
    // Assuming 5.5km per 1% of fuel (550km range on full tank)
    setRange(Math.round(decodedData.fuelLevel * 5.5));
  }, [
    decodedData.speed,
    decodedData.rpm,
    decodedData.fuelLevel,
    tripDistance,
    tripTime,
    odometer,
  ]);

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="h-full w-full">
      {/* Modern header with vehicle status */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-medium mb-1">Dashboard</h1>
          <p className="text-gray-400">Vehicle status and performance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-tesla-card rounded-full">
          <Car className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium">Ready to drive</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6 flex items-center gap-2 px-3 py-1.5 bg-tesla-card rounded-full w-fit">
        <div
          className={`w-3 h-3 rounded-full ${canStatus?.connected ? "bg-green-400" : "bg-amber-400"}`}
        />
        <span className="text-sm">
          {canStatus?.connected
            ? `Connected to ${canStatus.interface} (${(canStatus.bitrate / 1000).toFixed(0)} Kbps)`
            : canStatus?.error || "Waiting for connection..."}
        </span>
      </div>

      {/* Main dashboard display with circular gauges */}
      <div className="grid grid-cols-2 gap-4 mb-6 h-48">
        {/* Speed gauge */}
        <div className="bg-tesla-card rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full max-w-[200px] max-h-[200px] rounded-full border-8 border-blue-500/10" />
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/30 to-transparent rounded-b-full transition-all duration-500"
              style={{
                height: `${Math.min(100, decodedData.speed / 2)}%`,
                transform: `translateY(${100 - Math.min(100, decodedData.speed / 2)}%)`,
              }}
            />
          </div>
          <div className="z-10 flex flex-col items-center justify-center">
            <div className="text-6xl font-light mb-1 transition-all duration-500">
              {Math.round(decodedData.speed)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              km/h
            </div>
          </div>
        </div>

        {/* RPM gauge */}
        <div className="bg-tesla-card rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full max-w-[200px] max-h-[200px] rounded-full border-8 border-red-500/10" />
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500/30 to-transparent rounded-b-full transition-all duration-500"
              style={{
                height: `${Math.min(100, decodedData.rpm / 60)}%`,
                transform: `translateY(${100 - Math.min(100, decodedData.rpm / 60)}%)`,
              }}
            />
          </div>
          <div className="z-10 flex flex-col items-center justify-center">
            <div className="text-6xl font-light mb-1 transition-all duration-500">
              {Math.round(decodedData.rpm)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              RPM
            </div>
          </div>
        </div>
      </div>

      {/* Fuel and range card with animated gradient */}
      <div className="mb-6 bg-tesla-card rounded-xl p-4 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transition-all duration-1000"
          style={{ opacity: decodedData.fuelLevel / 100 }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-400" />
              <span className="text-lg font-medium">Fuel Level</span>
            </div>
            <div className="text-2xl font-light">{decodedData.fuelLevel}%</div>
          </div>

          <div className="mt-2 bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${decodedData.fuelLevel}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Estimated Range</span>
            </div>
            <div className="text-xl font-light">{range} km</div>
          </div>
        </div>
      </div>

      {/* Trip information with animated counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Trip data */}
        <div className="bg-tesla-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-400" />
              Trip Data
            </h3>
            <button className="text-xs text-blue-400 px-2 py-1 rounded-full bg-blue-400/10 hover:bg-blue-400/20 transition-colors">
              Reset
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-light">{tripDistance}</div>
              <div className="text-xs text-gray-400">KM</div>
            </div>

            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-light">{tripTime}</div>
              <div className="text-xs text-gray-400">TIME</div>
            </div>

            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-light">{avgSpeed}</div>
              <div className="text-xs text-gray-400">KM/H</div>
            </div>
          </div>
        </div>

        {/* Efficiency data */}
        <div className="bg-tesla-card rounded-xl p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-purple-400" />
            Efficiency
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-light">{efficiency}</div>
              <div className="text-xs text-gray-400">L/100KM</div>
            </div>

            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-light">
                {formatNumber(odometer)}
              </div>
              <div className="text-xs text-gray-400">TOTAL KM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle data with temperature visualization */}
      <div className="bg-tesla-card rounded-xl p-4 mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <GaugeIcon className="h-5 w-5 text-amber-400" />
          Vehicle Data
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Coolant Temperature */}
          <div className="bg-black/20 rounded-lg p-3 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500/30 to-transparent transition-all duration-500"
              style={{
                height: `${Math.min(100, decodedData.coolantTemp)}%`,
                opacity: decodedData.coolantTemp > 90 ? "0.6" : "0.3",
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-4 w-4 text-red-400" />
                <span className="text-sm">Coolant</span>
              </div>
              <div className="text-2xl font-light">
                {decodedData.coolantTemp}°C
              </div>
            </div>
          </div>

          {/* Outdoor Temperature */}
          <div className="bg-black/20 rounded-lg p-3 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/30 to-transparent transition-all duration-500"
              style={{
                height: `${Math.max(0, Math.min(100, (decodedData.outdoorTemp + 20) * 2))}%`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Outdoor</span>
              </div>
              <div className="text-2xl font-light">
                {decodedData.outdoorTemp}°C
              </div>
            </div>
          </div>

          {/* Oil Pressure */}
          <div className="bg-black/20 rounded-lg p-3 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500/30 to-transparent transition-all duration-500"
              style={{
                height: `${Math.min(100, decodedData.oilPressure * 20)}%`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <GaugeIcon className="h-4 w-4 text-amber-400" />
                <span className="text-sm">Oil Pressure</span>
              </div>
              <div className="text-2xl font-light">
                {decodedData.oilPressure} bar
              </div>
            </div>
          </div>

          {/* Transmission Temperature */}
          <div className="bg-black/20 rounded-lg p-3 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500/30 to-transparent transition-all duration-500"
              style={{
                height: `${Math.min(100, decodedData.transmissionTemp)}%`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-4 w-4 text-orange-400" />
                <span className="text-sm">Transmission</span>
              </div>
              <div className="text-2xl font-light">
                {decodedData.transmissionTemp}°C
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts section - only shown when there are alerts */}
      {decodedData.coolantTemp > 90 && (
        <div className="mt-6 bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-400">
                High Engine Temperature
              </h3>
              <p className="text-sm text-red-300/80">
                Engine coolant temperature is above normal range
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

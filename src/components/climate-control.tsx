"use client";

import {
  ArrowDown,
  ArrowUp,
  Droplets,
  Flame,
  RotateCw,
  Snowflake,
  Thermometer,
  Wind,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ClimateControlProps {
  className?: string;
}

export function ClimateControl({ className }: ClimateControlProps) {
  const [driverTemp, setDriverTemp] = useState(22);
  const [passengerTemp, setPassengerTemp] = useState(22);
  const [fanSpeed, setFanSpeed] = useState(2);
  const [acEnabled, setAcEnabled] = useState(false);
  const [heatEnabled, setHeatEnabled] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [recirculation, setRecirculation] = useState(false);
  const [driverSeatHeat, setDriverSeatHeat] = useState(0);
  const [passengerSeatHeat, setPassengerSeatHeat] = useState(0);
  const [defrost, setDefrost] = useState(false);

  // Fan speed levels
  const fanLevels = [0, 1, 2, 3, 4, 5];

  // Seat heat levels
  const seatHeatLevels = [0, 1, 2, 3];

  // Toggle auto mode
  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
    if (!autoMode) {
      // When enabling auto mode, set reasonable defaults
      setFanSpeed(2);
      setAcEnabled(true);
    }
  };

  // Increase driver temperature
  const increaseDriverTemp = () => {
    setDriverTemp((prev) => Math.min(prev + 0.5, 30));
  };

  // Decrease driver temperature
  const decreaseDriverTemp = () => {
    setDriverTemp((prev) => Math.max(prev - 0.5, 16));
  };

  // Increase passenger temperature
  const increasePassengerTemp = () => {
    setPassengerTemp((prev) => Math.min(prev + 0.5, 30));
  };

  // Decrease passenger temperature
  const decreasePassengerTemp = () => {
    setPassengerTemp((prev) => Math.max(prev - 0.5, 16));
  };

  // Toggle driver seat heat
  const toggleDriverSeatHeat = () => {
    setDriverSeatHeat((prev) => (prev + 1) % 4);
  };

  // Toggle passenger seat heat
  const togglePassengerSeatHeat = () => {
    setPassengerSeatHeat((prev) => (prev + 1) % 4);
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Climate Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Driver</div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseDriverTemp}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <div className="text-2xl font-bold">{driverTemp}°C</div>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseDriverTemp}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">Seat Heat</div>
              <div className="flex">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "w-3 h-6 mx-0.5 rounded-sm cursor-pointer",
                      driverSeatHeat >= level ? "bg-red-500" : "bg-muted",
                    )}
                    onClick={() => setDriverSeatHeat(level)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Passenger</div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={decreasePassengerTemp}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <div className="text-2xl font-bold">{passengerTemp}°C</div>
              <Button
                variant="outline"
                size="icon"
                onClick={increasePassengerTemp}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">Seat Heat</div>
              <div className="flex">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "w-3 h-6 mx-0.5 rounded-sm cursor-pointer",
                      passengerSeatHeat >= level ? "bg-red-500" : "bg-muted",
                    )}
                    onClick={() => setPassengerSeatHeat(level)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fan speed control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Fan Speed</div>
            <div className="flex items-center gap-1">
              {fanLevels.map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-2 h-4 mx-0.5 rounded-sm cursor-pointer",
                    level === 0
                      ? "bg-transparent"
                      : level <= fanSpeed
                        ? "bg-blue-500"
                        : "bg-muted",
                  )}
                  onClick={() => setFanSpeed(level)}
                />
              ))}
            </div>
          </div>
          <Slider
            value={[fanSpeed]}
            min={0}
            max={5}
            step={1}
            onValueChange={(vals) => setFanSpeed(vals[0])}
          />
        </div>

        {/* Control buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant={acEnabled ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setAcEnabled(!acEnabled)}
          >
            <Snowflake
              className={cn(
                "h-4 w-4",
                acEnabled ? "text-white" : "text-muted-foreground",
              )}
            />
            <span className="text-xs mt-1">A/C</span>
          </Button>

          <Button
            variant={heatEnabled ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setHeatEnabled(!heatEnabled)}
          >
            <Flame
              className={cn(
                "h-4 w-4",
                heatEnabled ? "text-white" : "text-muted-foreground",
              )}
            />
            <span className="text-xs mt-1">Heat</span>
          </Button>

          <Button
            variant={autoMode ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={toggleAutoMode}
          >
            <RotateCw
              className={cn(
                "h-4 w-4",
                autoMode ? "text-white" : "text-muted-foreground",
              )}
            />
            <span className="text-xs mt-1">Auto</span>
          </Button>

          <Button
            variant={recirculation ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setRecirculation(!recirculation)}
          >
            <Wind
              className={cn(
                "h-4 w-4",
                recirculation ? "text-white" : "text-muted-foreground",
              )}
            />
            <span className="text-xs mt-1">Recirc</span>
          </Button>

          <Button
            variant={defrost ? "default" : "outline"}
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setDefrost(!defrost)}
          >
            <Droplets
              className={cn(
                "h-4 w-4",
                defrost ? "text-white" : "text-muted-foreground",
              )}
            />
            <span className="text-xs mt-1">Defrost</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

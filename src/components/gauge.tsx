"use client";

import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}

export function Gauge({ value, max, label, unit, color, icon }: GaugeProps) {
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
        <div className="relative w-40 h-40 flex flex-col items-center justify-center">
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
        <p className="text-sm text-muted-foreground">
          {Math.round(percentage)}% of max
        </p>
      </CardFooter>
    </Card>
  );
}

"use client";

// Temperature thresholds for auto seat heating
export interface SeatHeatingThresholds {
  off: number;    // Temperature above which heating is off
  low: number;    // Temperature below which heating is low
  medium: number; // Temperature below which heating is medium
  high: number;   // Temperature below which heating is high
}

// Default thresholds for auto seat heating
export const DEFAULT_SEAT_HEATING_THRESHOLDS: SeatHeatingThresholds = {
  off: 20,    // Above 20°C, heating is off
  low: 15,    // Between 15-20°C, heating is low
  medium: 10, // Between 10-15°C, heating is medium
  high: 5,    // Below 5°C, heating is high
};

// Get the appropriate heating level based on temperature and thresholds
export function getAutoHeatingLevel(
  temperature: number,
  thresholds: SeatHeatingThresholds = DEFAULT_SEAT_HEATING_THRESHOLDS
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

// Check if passenger is present based on weight sensor
// In a real implementation, this would come from the CAN bus
export function isPassengerPresent(weight: number): boolean {
  // Typical threshold for passenger detection is around 30kg
  return weight > 30;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light" | "auto";

interface ThemeContextType {
  theme: ThemeMode;
  appliedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage or default to auto
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeMode;
      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "auto"
      ) {
        return savedTheme;
      }
    }
    return "auto";
  });

  // Track the actual applied theme (dark or light)
  const [appliedTheme, setAppliedTheme] = useState<"dark" | "light">("dark");

  // Toggle theme function - cycles through dark, light, auto
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "dark") {
        return "light";
      }
      if (prevTheme === "light") {
        return "auto";
      }
      return "dark";
    });
  };

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle auto theme detection based on car's light sensor
  useEffect(() => {
    if (theme !== "auto") {
      // If not in auto mode, apply the selected theme directly
      setAppliedTheme(theme);
      return;
    }

    // Simulate car's light sensor data
    // In a real implementation, this would come from the CAN bus
    const checkLightSensor = () => {
      // For simulation: use time of day as a proxy for light sensor
      // In a real car, this would be actual light sensor data
      const hour = new Date().getHours();
      const isDaytime = hour >= 7 && hour < 19;

      // Set theme based on light sensor
      setAppliedTheme(isDaytime ? "light" : "dark");
    };

    // Check immediately and then every minute
    checkLightSensor();
    const interval = setInterval(checkLightSensor, 60000);

    return () => clearInterval(interval);
  }, [theme]);

  // Apply the actual theme classes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Apply classes to html element
    if (appliedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [appliedTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        appliedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

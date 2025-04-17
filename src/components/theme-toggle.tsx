"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, appliedTheme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/5">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-8 w-8 p-0 rounded-full"
        aria-label={`Current theme: ${theme}. Click to toggle.`}
      >
        {theme === "dark" && (
          <Moon className="h-4 w-4 text-blue-400" />
        )}
        {theme === "light" && (
          <Sun className="h-4 w-4 text-yellow-400" />
        )}
        {theme === "auto" && (
          <div className="relative">
            <SunMoon className="h-4 w-4 text-green-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
          </div>
        )}
      </Button>
      <span className="text-xs font-medium">
        {theme === "dark" ? "Dark" :
         theme === "light" ? "Light" :
         `Auto (${appliedTheme === "dark" ? "Dark" : "Light"})`}
      </span>
    </div>
  );
}

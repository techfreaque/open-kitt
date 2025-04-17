"use client";

import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { loadConfig, updateConfig } from "@/lib/config";

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize fullscreen state from config
  useEffect(() => {
    const config = loadConfig();
    if (config.display.fullscreen) {
      requestFullscreen();
    }
  }, []);

  // Update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Request fullscreen
  const requestFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  };

  // Exit fullscreen
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const config = loadConfig();

    if (isFullscreen) {
      exitFullscreen();
      updateConfig({
        display: {
          ...config.display,
          fullscreen: false,
        },
      });
      return;
    }

    requestFullscreen();
    updateConfig({
      display: {
        ...config.display,
        fullscreen: true,
      },
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullscreen}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      className="min-h-[44px] min-w-[44px]"
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </Button>
  );
}

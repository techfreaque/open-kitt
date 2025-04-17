"use client";

import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";

interface SwipeablePagesProps {
  children: ReactNode[];
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function SwipeablePages({
  children,
  initialPage = 0,
  onPageChange,
}: SwipeablePagesProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle external page change (from NavBar)
  useEffect(() => {
    const handleExternalPageChange = (e: CustomEvent) => {
      if (e.detail !== currentPage) {
        // Use requestAnimationFrame to ensure smooth transitions
        requestAnimationFrame(() => {
          setIsAnimating(true);
          setCurrentPage(e.detail);
          // Use a slightly longer timeout to ensure animation completes
          setTimeout(() => setIsAnimating(false), 350);
        });
      }
    };

    window.addEventListener(
      "pageChange" as any,
      handleExternalPageChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "pageChange" as any,
        handleExternalPageChange as EventListener,
      );
    };
  }, [currentPage]);

  // Handle page change
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  // Swipe handlers are disabled as per request
  // We're keeping the empty handlers object to maintain compatibility
  const handlers = {};

  // Touch event handlers are disabled
  // These are empty functions to maintain the component structure
  const handleTouchStart = () => {};
  const handleTouchMove = () => {};
  const handleTouchEnd = () => {};

  return (
    <div className="relative w-full h-full overflow-hidden" {...handlers}>
      <div
        className="flex h-full transition-transform duration-350 ease-out"
        style={{
          transform: `translateX(-${currentPage * 100}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full h-full overflow-hidden"
            style={{ opacity: isAnimating ? 0.8 : 1 }}
          >
            <div className="w-full h-full overflow-auto p-4 pb-24">{child}</div>
          </div>
        ))}
      </div>

      {/* Tesla-style page indicators */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-3 z-10">
        {children.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              currentPage === index ? "bg-white w-6" : "bg-white/40"
            }`}
            onClick={() => {
              setIsAnimating(true);
              setCurrentPage(index);
              setTimeout(() => setIsAnimating(false), 350);
            }}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

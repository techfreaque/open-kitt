"use client";

import {
  Heart,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useState } from "react";

export function MediaPage() {
  const [volume, setVolume] = useState(75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="h-full w-full">
      {/* Tesla-style header */}
      <div className="mb-6">
        <h1 className="text-3xl font-medium mb-1">Media</h1>
        <p className="text-gray-400">Music and entertainment</p>
      </div>

      {/* Now Playing */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-32 h-32 bg-black/60 rounded-xl flex items-center justify-center">
            <Music className="h-16 w-16 text-white/70" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-light mb-1">Song Title</h2>
            <p className="text-lg text-gray-300 mb-1">Artist Name</p>
            <p className="text-sm text-gray-400">Album Name</p>
          </div>
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isFavorite ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white/70 hover:text-white"}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-8">
          <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-white h-1.5 rounded-full"
              style={{ width: "33%" }}
            ></div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">1:23</span>
            <span className="text-sm text-gray-400">3:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-8">
          <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10 text-black" />
            ) : (
              <Play className="h-10 w-10 text-black ml-1" />
            )}
          </button>
          <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Volume2 className="h-6 w-6 text-white/70" />
          <div className="flex-1">
            <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-1.5 rounded-full"
                style={{ width: `${volume}%` }}
              ></div>
            </div>
          </div>
          <span className="text-sm font-medium">{volume}%</span>
        </div>
      </div>

      {/* Source Selection */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Audio Sources</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 hover:bg-black/60 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Music className="h-5 w-5 text-blue-400" />
            </div>
            <span>Bluetooth</span>
          </button>
          <button className="bg-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 hover:bg-black/60 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Music className="h-5 w-5 text-green-400" />
            </div>
            <span>USB</span>
          </button>
        </div>
      </div>
    </div>
  );
}

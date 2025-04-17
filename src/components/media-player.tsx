"use client";

import {
  Bluetooth,
  List,
  Music,
  Pause,
  Play,
  Radio,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MediaPlayerProps {
  className?: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
}

export function MediaPlayer({ className }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [androidAutoConnected, setAndroidAutoConnected] = useState(false);

  // Mock tracks
  const mockTracks: Track[] = [
    {
      id: "1",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      duration: 354,
      coverUrl: "https://via.placeholder.com/80",
    },
    {
      id: "2",
      title: "Hotel California",
      artist: "Eagles",
      album: "Hotel California",
      duration: 390,
      coverUrl: "https://via.placeholder.com/80",
    },
    {
      id: "3",
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: "Appetite for Destruction",
      duration: 356,
      coverUrl: "https://via.placeholder.com/80",
    },
    {
      id: "4",
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      duration: 482,
      coverUrl: "https://via.placeholder.com/80",
    },
    {
      id: "5",
      title: "Imagine",
      artist: "John Lennon",
      album: "Imagine",
      duration: 183,
      coverUrl: "https://via.placeholder.com/80",
    },
  ];

  // Initialize with mock data
  useEffect(() => {
    setPlaylist(mockTracks);
    setCurrentTrack(mockTracks[0]);
  }, []);

  // Simulate progress updates when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= currentTrack.duration) {
            if (repeat) {
              return 0; // Restart the same track
            } else {
              playNextTrack();
              return 0;
            }
          }
          return newProgress;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentTrack, repeat]);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Play next track
  const playNextTrack = () => {
    if (!currentTrack || playlist.length === 0) {
      return;
    }

    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack.id,
    );
    let nextIndex;

    if (shuffle) {
      // Random track (but not the current one)
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      // Next track in order
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    setCurrentTrack(playlist[nextIndex]);
    setProgress(0);
  };

  // Play previous track
  const playPrevTrack = () => {
    if (!currentTrack || playlist.length === 0) {
      return;
    }

    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack.id,
    );
    let prevIndex;

    if (progress > 3) {
      // If we're more than 3 seconds into the song, restart it
      setProgress(0);
      return;
    }

    if (shuffle) {
      // Random track (but not the current one)
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (prevIndex === currentIndex && playlist.length > 1);
    } else {
      // Previous track in order
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }

    setCurrentTrack(playlist[prevIndex]);
    setProgress(0);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Play a specific track
  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
  };

  // Toggle Android Auto connection
  const toggleAndroidAuto = () => {
    setAndroidAutoConnected(!androidAutoConnected);
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Media Player
        </CardTitle>
        {androidAutoConnected && (
          <CardDescription className="flex items-center gap-1 text-green-500">
            <Smartphone className="h-3.5 w-3.5" />
            Android Auto Connected
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="now-playing">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="now-playing">Now Playing</TabsTrigger>
            <TabsTrigger value="playlist">Playlist</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="now-playing" className="space-y-4">
            {currentTrack ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {currentTrack.coverUrl ? (
                      <img
                        src={currentTrack.coverUrl}
                        alt={`${currentTrack.album} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {currentTrack.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {currentTrack.artist}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentTrack.album}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                  <Slider
                    value={[progress]}
                    max={currentTrack.duration}
                    step={1}
                    onValueChange={(vals) => setProgress(vals[0])}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(shuffle && "bg-primary/10")}
                    onClick={() => setShuffle(!shuffle)}
                  >
                    <Shuffle
                      className={cn("h-4 w-4", shuffle && "text-primary")}
                    />
                  </Button>

                  <Button variant="outline" size="icon" onClick={playPrevTrack}>
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    className="rounded-full h-12 w-12"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button variant="outline" size="icon" onClick={playNextTrack}>
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(repeat && "bg-primary/10")}
                    onClick={() => setRepeat(!repeat)}
                  >
                    <Repeat
                      className={cn("h-4 w-4", repeat && "text-primary")}
                    />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(vals) => {
                      setVolume(vals[0]);
                      if (vals[0] > 0 && isMuted) {
                        setIsMuted(false);
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mb-4" />
                <p>No track selected</p>
                <p className="text-sm">Select a track from the playlist</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlist" className="h-[300px] overflow-y-auto">
            <div className="space-y-1">
              {playlist.map((track) => (
                <div
                  key={track.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted",
                    currentTrack?.id === track.id && "bg-muted",
                  )}
                  onClick={() => playTrack(track)}
                >
                  <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={`${track.album} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Audio Sources</div>

              <div
                className={cn(
                  "flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer",
                  androidAutoConnected && "bg-primary/10",
                )}
                onClick={toggleAndroidAuto}
              >
                <div className="flex items-center gap-2">
                  <Smartphone
                    className={cn(
                      "h-5 w-5",
                      androidAutoConnected && "text-primary",
                    )}
                  />
                  <div>
                    <div className="font-medium">Android Auto</div>
                    <div className="text-xs text-muted-foreground">
                      {androidAutoConnected ? "Connected" : "Available"}
                    </div>
                  </div>
                </div>
                <Button
                  variant={androidAutoConnected ? "default" : "outline"}
                  size="sm"
                >
                  {androidAutoConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bluetooth className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Bluetooth Audio</div>
                    <div className="text-xs text-muted-foreground">
                      Connected: My Phone
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  <div>
                    <div className="font-medium">FM Radio</div>
                    <div className="text-xs text-muted-foreground">
                      Not active
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Local Media</div>
                    <div className="text-xs text-muted-foreground">
                      USB Drive, SD Card
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Browse
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

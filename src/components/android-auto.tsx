"use client";

import {
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Music,
  Navigation,
  Phone,
  RefreshCw,
  Smartphone,
  Wifi,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AndroidAutoProps {
  className?: string;
}

interface AndroidAutoStatus {
  connected: boolean;
  deviceName: string;
  connectionType: "wireless" | "usb" | "none";
  batteryLevel: number;
  apps: {
    navigation: boolean;
    media: boolean;
    phone: boolean;
    messaging: boolean;
  };
}

export function AndroidAuto({ className }: AndroidAutoProps) {
  const [status, setStatus] = useState<AndroidAutoStatus>({
    connected: false,
    deviceName: "",
    connectionType: "none",
    batteryLevel: 0,
    apps: {
      navigation: false,
      media: false,
      phone: false,
      messaging: false,
    },
  });

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate connection to Android Auto
  const connectToAndroidAuto = (type: "wireless" | "usb") => {
    setConnecting(true);
    setError(null);

    // Simulate connection delay
    setTimeout(() => {
      if (Math.random() > 0.2) {
        // 80% success rate
        setStatus({
          connected: true,
          deviceName: "Google Pixel 7",
          connectionType: type,
          batteryLevel: 78,
          apps: {
            navigation: true,
            media: true,
            phone: true,
            messaging: true,
          },
        });
        setConnecting(false);
      } else {
        setError(`Failed to connect via ${type}. Please try again.`);
        setConnecting(false);
      }
    }, 2000);
  };

  // Disconnect from Android Auto
  const disconnectFromAndroidAuto = () => {
    setStatus({
      connected: false,
      deviceName: "",
      connectionType: "none",
      batteryLevel: 0,
      apps: {
        navigation: false,
        media: false,
        phone: false,
        messaging: false,
      },
    });
  };

  // Launch an app
  const launchApp = (app: keyof AndroidAutoStatus["apps"]) => {
    // In a real implementation, this would communicate with the Android Auto service
    console.log(`Launching ${app} app`);
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Android Auto
        </CardTitle>
        {status.connected && (
          <CardDescription className="flex items-center gap-1">
            Connected to {status.deviceName} ({status.batteryLevel}%)
            {status.connectionType === "wireless" ? (
              <Wifi className="h-3.5 w-3.5 ml-1" />
            ) : (
              <Smartphone className="h-3.5 w-3.5 ml-1" />
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {status.connected ? (
          <Tabs defaultValue="apps">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="apps">Apps</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 py-2"
                  onClick={() => launchApp("navigation")}
                >
                  <Navigation className="h-8 w-8 mb-2 text-primary" />
                  <span>Navigation</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 py-2"
                  onClick={() => launchApp("media")}
                >
                  <Music className="h-8 w-8 mb-2 text-primary" />
                  <span>Media</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 py-2"
                  onClick={() => launchApp("phone")}
                >
                  <Phone className="h-8 w-8 mb-2 text-primary" />
                  <span>Phone</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 py-2"
                  onClick={() => launchApp("messaging")}
                >
                  <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                  <span>Messages</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{status.deviceName}</div>
                      <div className="text-xs text-muted-foreground">
                        Battery: {status.batteryLevel}%
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={disconnectFromAndroidAuto}
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Connection Type</div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    {status.connectionType === "wireless" ? (
                      <>
                        <Wifi className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Wireless</div>
                          <div className="text-xs text-muted-foreground">
                            Connected via WiFi
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">USB</div>
                          <div className="text-xs text-muted-foreground">
                            Connected via USB cable
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Available Apps</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2">
                      <Navigation className="h-4 w-4" />
                      <span>Navigation</span>
                      {status.apps.navigation ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-2">
                      <Music className="h-4 w-4" />
                      <span>Media</span>
                      {status.apps.media ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                      {status.apps.phone ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Messaging</span>
                      {status.apps.messaging ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-4">
              <Smartphone className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">
                Connect to Android Auto
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Connect your Android device to access navigation, media, and
                more
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 py-2"
                  onClick={() => connectToAndroidAuto("usb")}
                  disabled={connecting}
                >
                  <Smartphone className="h-8 w-8 mb-2" />
                  <span>USB</span>
                  {connecting && (
                    <RefreshCw className="h-4 w-4 animate-spin mt-1" />
                  )}
                </Button>

                <Button
                  className="flex flex-col items-center justify-center h-24 py-2"
                  onClick={() => connectToAndroidAuto("wireless")}
                  disabled={connecting}
                >
                  <Wifi className="h-8 w-8 mb-2" />
                  <span>Wireless</span>
                  {connecting && (
                    <RefreshCw className="h-4 w-4 animate-spin mt-1" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="mb-1">To use Android Auto wirelessly:</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Make sure your phone supports wireless Android Auto</li>
                <li>Enable Bluetooth and WiFi on your phone</li>
                <li>Open the Android Auto app on your phone</li>
                <li>Click "Wireless" above to connect</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket<T extends Record<string, any>>(
  options: UseWebSocketOptions,
) {
  const {
    url,
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 5000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<T>({} as T);
  const socketRef = useRef<Socket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    try {
      socketRef.current = io(url, {
        reconnection: false, // We'll handle reconnection manually
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onConnect?.();
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        onDisconnect?.();

        // Handle reconnection
        if (reconnectCountRef.current < reconnectionAttempts) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectCountRef.current += 1;
            socketRef.current?.close();
            socketRef.current = null;
            connect();
          }, reconnectionDelay);
        }
      });

      socketRef.current.on("connect_error", (error) => {
        onError?.(error);

        // Handle reconnection
        if (reconnectCountRef.current < reconnectionAttempts) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectCountRef.current += 1;
            socketRef.current?.close();
            socketRef.current = null;
            connect();
          }, reconnectionDelay);
        }
      });
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [
    url,
    reconnectionAttempts,
    reconnectionDelay,
    onConnect,
    onDisconnect,
    onError,
  ]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Subscribe to an event
  const subscribe = useCallback(
    <K extends keyof T>(event: K, callback: (data: T[K]) => void) => {
      if (!socketRef.current) {
        return () => {};
      }

      socketRef.current.on(event as string, callback as any);

      return () => {
        socketRef.current?.off(event as string, callback as any);
      };
    },
    [],
  );

  // Emit an event
  const emit = useCallback(<K extends string>(event: K, data?: any) => {
    if (!socketRef.current) {
      return false;
    }
    socketRef.current.emit(event, data);
    return true;
  }, []);

  // Update events state when receiving data
  const updateEvents = useCallback(
    <K extends keyof T>(event: K, data: T[K]) => {
      setEvents((prev) => ({
        ...prev,
        [event]: data,
      }));
    },
    [],
  );

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    events,
    connect,
    disconnect,
    subscribe,
    emit,
    updateEvents,
    socket: socketRef.current,
  };
}

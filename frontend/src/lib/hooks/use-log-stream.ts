"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLogWebSocketUrl } from "@/lib/api";

interface UseLogStreamOptions {
  namespace: string;
  podName: string;
  enabled?: boolean;
}

interface UseLogStreamReturn {
  logs: string[];
  isConnected: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  clear: () => void;
}

export function useLogStream({
  namespace,
  podName,
  enabled = true,
}: UseLogStreamOptions): UseLogStreamReturn {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled || !podName || !namespace) return;

    const wsUrl = getLogWebSocketUrl(namespace, podName);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event: MessageEvent) => {
      const line = event.data as string;
      bufferRef.current.push(line);

      // Batch updates to avoid excessive re-renders
      if (bufferRef.current.length >= 5) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        setLogs((prev) => [...prev, ...batch].slice(-1000)); // Keep last 1000 lines
      }
    };

    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    // Flush remaining buffer periodically
    const flushInterval = setInterval(() => {
      if (bufferRef.current.length > 0) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        setLogs((prev) => [...prev, ...batch].slice(-1000));
      }
    }, 200);

    return () => {
      clearInterval(flushInterval);
      ws.close();
      wsRef.current = null;
    };
  }, [namespace, podName, enabled]);

  const pause = useCallback(() => {
    setIsPaused(true);
    wsRef.current?.close();
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    // Reconnection happens via the effect re-running
  }, []);

  const clear = useCallback(() => {
    setLogs([]);
    bufferRef.current = [];
  }, []);

  return { logs, isConnected, isPaused, pause, resume, clear };
}

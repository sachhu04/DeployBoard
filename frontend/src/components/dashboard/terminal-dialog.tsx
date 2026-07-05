"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getExecWebSocketUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { Pod } from "@/lib/types";

interface TerminalDialogProps {
  pod: Pod | null;
  onClose: () => void;
}

export function TerminalDialog({ pod, onClose }: TerminalDialogProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!pod || !terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#09090b", // match bg-card
        foreground: "#fafafa",
        cursor: "#06b6d4", // cyan-500
        selectionBackground: "rgba(16, 185, 129, 0.3)",
        black: "#000000",
        red: "#ef4444",
        green: "#06b6d4",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#d946ef",
        cyan: "#06b6d4",
        white: "#fafafa",
      },
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 13,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    // Mount terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect WebSocket
    const wsUrl = getExecWebSocketUrl(pod.namespace, pod.name);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      term.write("\r\n\x1b[1;31m[Disconnected]\x1b[0m\r\n");
    };

    // Forward keystrokes to WebSocket
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        
        // Local echo for simple mock mode typing
        if (data === '\r') {
           // enter key is handled by backend in mock
        } else if (data === '\x7f') {
          // simple backspace for visual feedback
          term.write('\b \b');
        } else {
          term.write(data);
        }
      }
    });

    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ws.close();
      term.dispose();
    };
  }, [pod]);

  if (!pod) return null;

  return (
    <Dialog open={!!pod} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col bg-card border-white/[0.08] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-white/[0.08] shrink-0">
          <DialogTitle className="flex items-center justify-between font-mono text-sm">
            <span>root@{pod.name}</span>
            <div className="flex items-center gap-2 text-xs font-sans font-normal">
              <span className="text-muted-foreground">Status:</span>
              {isConnected ? (
                <span className="text-cyan-500 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Connecting...
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] relative bg-[#09090b] p-4">
          {!isConnected && (
            <Skeleton className="absolute inset-4 rounded-none opacity-20" />
          )}
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

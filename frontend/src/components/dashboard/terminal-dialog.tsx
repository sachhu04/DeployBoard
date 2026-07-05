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
        cursor: "#06b6d4", // yellow-500
        selectionBackground: "rgba(16, 185, 129, 0.3)",
        black: "#000000",
        red: "#ef4444",
        green: "#06b6d4",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#d946ef",
        yellow: "#06b6d4",
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
      <DialogContent className="max-w-[1000px] w-[95vw] h-[80vh] p-0 bg-transparent border-0 overflow-hidden shadow-2xl">
        <div className="flex flex-col h-full w-full glass-strong rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
          {/* macOS Style Header */}
          <div className="h-12 border-b border-white/[0.08] bg-black/40 flex items-center px-4 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500 transition-colors" onClick={onClose} />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:bg-yellow-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer hover:bg-green-500 transition-colors" />
            </div>
            <div className="flex-1 text-center font-mono text-xs text-muted-foreground font-medium flex items-center justify-center gap-2">
              root@{pod.name}
              {isConnected ? (
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse ml-2" title="Connected" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 ml-2" title="Disconnected" />
              )}
            </div>
            <div className="w-16" /> {/* Spacer for balance */}
          </div>
          
          {/* Terminal Body */}
          <div className="flex-1 p-2 bg-[#09090b]/90 relative">
            {!isConnected && (
              <Skeleton className="absolute inset-4 rounded-none opacity-20" />
            )}
            <div ref={terminalRef} className="w-full h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

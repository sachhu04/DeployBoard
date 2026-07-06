"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Pause, Play, Trash2, Search, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KubectlHint } from "./kubectl-hint";
import { useLogStream } from "@/lib/hooks/use-log-stream";
import { usePods } from "@/lib/hooks/use-pods";
import { useNamespaceContext } from "./namespace-context";

export function LogViewer() {
  const { namespace } = useNamespaceContext();
  const { data: pods } = usePods(namespace);
  const [selectedPod, setSelectedPod] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { logs, isConnected, isPaused, pause, resume, clear } = useLogStream({
    namespace,
    podName: selectedPod,
    enabled: !!selectedPod,
  });

  // Auto-select first pod or reset if not in list
  useEffect(() => {
    if (pods && pods.length > 0) {
      if (!selectedPod || !pods.find((p) => p.name === selectedPod)) {
        setSelectedPod(pods[0].name);
      }
    } else if (pods && pods.length === 0) {
      setSelectedPod("");
    }
  }, [pods, selectedPod]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((line) => line.toLowerCase().includes(q));
  }, [logs, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={selectedPod} onValueChange={(v) => v && setSelectedPod(v)}>
          <SelectTrigger className="w-[280px] h-9 text-sm bg-white/[0.04] border-white/[0.08]">
            <SelectValue placeholder="Select a pod" />
          </SelectTrigger>
          <SelectContent>
            {pods?.map((pod) => (
              <SelectItem key={pod.name} value={pod.name}>
                <span className="font-mono text-xs">{pod.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-white/[0.04] border-white/[0.08]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isPaused ? resume : pause}
            className="h-9 border-white/[0.08] gap-1.5"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            className="h-9 border-white/[0.08] gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs ${
              isConnected
                ? "text-yellow bg-yellow/10"
                : "text-muted-foreground bg-white/[0.04]"
            }`}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* kubectl hint */}
      {selectedPod && (
        <KubectlHint
          command={`kubectl logs -f ${selectedPod} -n ${namespace}`}
          explanation="Streams the stdout/stderr output from the selected pod container in real-time. The -f flag follows new log entries as they appear."
        />
      )}

      {/* Log output window */}
      <div className="flex flex-col h-[calc(100vh-360px)] w-full glass-strong rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
        {/* macOS Style Header */}
        <div className="h-10 border-b border-white/[0.08] bg-black/40 flex items-center px-4 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:bg-yellow-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer hover:bg-green-500 transition-colors" />
          </div>
          <div className="flex-1 text-center font-mono text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center justify-center gap-2">
            kubectl logs -f {selectedPod || "none"}
          </div>
          <div className="w-16" /> {/* Spacer for balance */}
        </div>

        <div className="flex-1 overflow-y-auto bg-[#09090b]/90">
          <div className="p-4 font-mono text-xs leading-relaxed text-[#00ff00]">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              {selectedPod
                ? "Waiting for log output..."
                : "Select a pod to start streaming logs"}
            </div>
          ) : (
            filteredLogs.map((line, i) => (
              <div
                key={i}
                className="py-0.5 hover:bg-white/[0.02] px-2 -mx-2 rounded transition-colors"
              >
                <span className="text-muted-foreground/40 mr-3 select-none">
                  {String(i + 1).padStart(4, " ")}
                </span>
                <span
                  className={
                    line.includes("ERROR")
                      ? "text-red-400"
                      : line.includes("WARN")
                        ? "text-yellow-400"
                        : line.includes("DEBUG")
                          ? "text-muted-foreground"
                          : "text-foreground/80"
                  }
                >
                  {line}
                </span>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
        </div>
      </div>

      {/* Auto-scroll toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {filteredLogs.length} lines
          {searchQuery && ` (filtered from ${logs.length})`}
        </span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            autoScroll
              ? "bg-yellow/10 text-yellow"
              : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
          }`}
        >
          Auto-scroll {autoScroll ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClusterEvent } from "@/lib/types";

interface EventFeedProps {
  events: ClusterEvent[] | undefined;
  isLoading: boolean;
}

export function EventFeed({ events, isLoading }: EventFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-2 pr-4">
        {events?.map((event, i) => (
          <motion.div
            key={`${event.involved_object}-${event.reason}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                  event.type === "Warning"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {event.type === "Warning" ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Info className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{event.reason}</span>
                  <span className="text-xs text-muted-foreground">
                    {event.age} ago
                  </span>
                  {event.count > 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                      ×{event.count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed truncate">
                  {event.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground/60">
                    {event.namespace}/{event.involved_object}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {(!events || events.length === 0) && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No events found.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

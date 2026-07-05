"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface YamlViewerProps {
  yaml: string;
  title?: string;
}

export function YamlViewer({ yaml, title }: YamlViewerProps) {
  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <ScrollArea className="h-[400px] rounded-lg border border-white/[0.06] bg-black/30">
        <pre className="p-4 text-sm font-mono text-foreground/80 leading-relaxed">
          {yaml}
        </pre>
      </ScrollArea>
    </div>
  );
}

"use client";

import { Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";

interface KubectlHintProps {
  command: string;
  explanation: string;
}

export function KubectlHint({ command, explanation }: KubectlHintProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-cyan/20 bg-cyan/[0.04] p-4 space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-cyan">
        <Terminal className="h-3.5 w-3.5" />
        kubectl equivalent
      </div>
      <div className="relative group">
        <div className="bg-black/40 rounded-md px-4 py-3 font-mono text-sm text-foreground/90 overflow-x-auto pr-10">
          <span className="text-cyan/50">$ </span>
          {command}
        </div>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          aria-label="Copy kubectl command"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-cyan" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}

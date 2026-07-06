"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalDialog } from "./terminal-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { useDeletePod } from "@/lib/hooks/use-pods";
import type { Pod } from "@/lib/types";

interface PodTableProps {
  pods: Pod[] | undefined;
  isLoading: boolean;
}

export function PodTable({ pods, isLoading }: PodTableProps) {
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const deletePod = useDeletePod();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl glass overflow-hidden shadow-2xl border-white/[0.08]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-xs text-muted-foreground font-medium">
              Name
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Namespace
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Status
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Restarts
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Node
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              IP
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Age
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground font-medium w-[80px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pods?.map((pod, i) => (
            <motion.tr
              key={`${pod.namespace}-${pod.name}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="border-white/[0.04] hover:bg-white/[0.04] transition-all group hover:shadow-lg cursor-pointer"
            >
              <TableCell className="font-mono text-xs max-w-[260px] truncate">
                {pod.name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {pod.namespace}
              </TableCell>
              <TableCell>
                <StatusBadge status={pod.status} />
              </TableCell>
              <TableCell className="font-mono text-sm">
                <span
                  className={
                    pod.restarts > 0
                      ? "text-yellow-400"
                      : "text-muted-foreground"
                  }
                >
                  {pod.restarts}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {pod.node}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {pod.ip}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {pod.age}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => setSelectedPod(pod)}
                    title="Exec Shell"
                  >
                    <Terminal className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete pod ${pod.name}?`)) {
                        deletePod.mutate({ name: pod.name, namespace: pod.namespace });
                      }
                    }}
                    title="Delete Pod"
                    disabled={deletePod.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
      {(!pods || pods.length === 0) && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No pods found in this namespace.
        </div>
      )}
      <TerminalDialog
        pod={selectedPod}
        onClose={() => setSelectedPod(null)}
      />
    </div>
  );
}

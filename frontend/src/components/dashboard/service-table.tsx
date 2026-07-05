"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service } from "@/lib/types";

interface ServiceTableProps {
  services: Service[] | undefined;
  isLoading: boolean;
}

const typeColors: Record<string, string> = {
  ClusterIP: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  NodePort: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  LoadBalancer: "bg-yellow/10 text-yellow border-yellow/20",
};

export function ServiceTable({ services, isLoading }: ServiceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
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
              Type
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Cluster IP
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Port
            </TableHead>
            <TableHead className="text-xs text-muted-foreground font-medium">
              Age
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services?.map((svc, i) => (
            <motion.tr
              key={`${svc.namespace}-${svc.name}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="border-white/[0.04] hover:bg-white/[0.04] transition-all group hover:shadow-lg"
            >
              <TableCell className="font-mono text-sm">{svc.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {svc.namespace}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${typeColors[svc.type] || "bg-white/5 text-muted-foreground"}`}
                >
                  {svc.type}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {svc.cluster_ip}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {svc.port}
                <span className="text-muted-foreground">→</span>
                {svc.target_port}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {svc.age}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
      {(!services || services.length === 0) && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No services found in this namespace.
        </div>
      )}
    </div>
  );
}

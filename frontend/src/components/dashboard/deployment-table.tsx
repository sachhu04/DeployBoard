"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Scale,
  RotateCcw,
  Undo2,
  FileCode,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { ScaleDialog } from "./scale-dialog";
import { ActionDialog } from "./action-dialog";
import { YamlDialog } from "./yaml-dialog";
import type { Deployment } from "@/lib/types";

interface DeploymentTableProps {
  deployments: Deployment[] | undefined;
  isLoading: boolean;
}

export function DeploymentTable({
  deployments,
  isLoading,
}: DeploymentTableProps) {
  const [scaleTarget, setScaleTarget] = useState<Deployment | null>(null);
  const [restartTarget, setRestartTarget] = useState<Deployment | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deployment | null>(null);
  const [yamlTarget, setYamlTarget] = useState<Deployment | null>(null);

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
    <>
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
                Ready
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">
                Image
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">
                Age
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium w-[50px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments?.map((dep, i) => (
              <motion.tr
                key={`${dep.namespace}-${dep.name}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="border-white/[0.04] hover:bg-white/[0.04] transition-all group hover:shadow-lg"
              >
                <TableCell className="font-mono text-sm">
                  {dep.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dep.namespace}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <span
                    className={
                      dep.ready_replicas === dep.desired_replicas
                        ? "text-yellow"
                        : "text-yellow-400"
                    }
                  >
                    {dep.ready_replicas}
                  </span>
                  <span className="text-muted-foreground">
                    /{dep.desired_replicas}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={dep.status} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                  {dep.image}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dep.age}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setScaleTarget(dep)}>
                        <Scale className="h-4 w-4 mr-2" />
                        Scale
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRestartTarget(dep)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRollbackTarget(dep)}>
                        <Undo2 className="h-4 w-4 mr-2" />
                        Rollback
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setYamlTarget(dep)}>
                        <FileCode className="h-4 w-4 mr-2" />
                        View YAML
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(dep)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {(!deployments || deployments.length === 0) && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No deployments found in this namespace.
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ScaleDialog
        deployment={scaleTarget}
        onClose={() => setScaleTarget(null)}
      />
      <ActionDialog
        type="restart"
        deployment={restartTarget}
        onClose={() => setRestartTarget(null)}
      />
      <ActionDialog
        type="rollback"
        deployment={rollbackTarget}
        onClose={() => setRollbackTarget(null)}
      />
      <ActionDialog
        type="delete"
        deployment={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
      <YamlDialog
        deployment={yamlTarget}
        onClose={() => setYamlTarget(null)}
      />
    </>
  );
}

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
import { Header } from "@/components/dashboard/header";
import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNamespaces } from "@/lib/hooks/use-namespaces";

export default function NamespacesPage() {
  const { data: namespaces, isLoading } = useNamespaces();

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Namespaces"
        description="Logical partitions of your cluster."
      />
      <div className="flex-1 p-6 space-y-6">
        <KubectlHint
          command="kubectl get namespaces"
          explanation="Lists all namespaces in the cluster."
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground font-medium">
                    Name
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium">
                    Age
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {namespaces?.map((ns, i) => (
                  <motion.tr
                    key={ns.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="font-mono text-sm">{ns.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={ns.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ns.age}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {(!namespaces || namespaces.length === 0) && (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No namespaces found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

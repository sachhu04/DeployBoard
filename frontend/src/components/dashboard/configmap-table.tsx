"use client";

import { useConfigMaps } from "@/lib/hooks/use-configmaps";
import { useNamespaceContext as useNamespace } from "./namespace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function ConfigMapTable() {
  const { namespace } = useNamespace();
  const { data: configmaps, isLoading, error } = useConfigMaps(namespace);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
        Failed to load configmaps: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!configmaps?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white/[0.02] border border-white/[0.06] rounded-xl border-dashed">
        <p>No ConfigMaps found in this namespace.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
      <div className="grid grid-cols-4 gap-4 px-6 py-4 text-xs font-medium text-muted-foreground border-b border-white/[0.06] bg-white/[0.02]">
        <div>Name</div>
        <div>Namespace</div>
        <div>Data Keys</div>
        <div>Age</div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {configmaps.map((cm, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={`${cm.namespace}-${cm.name}`}
            className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
          >
            <div className="font-mono text-sm">{cm.name}</div>
            <div className="text-sm text-muted-foreground">{cm.namespace}</div>
            <div className="text-sm">{cm.data_keys}</div>
            <div className="text-sm text-muted-foreground">{cm.age}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

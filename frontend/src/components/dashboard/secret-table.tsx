"use client";

import { useSecrets } from "@/lib/hooks/use-secrets";
import { useNamespaceContext as useNamespace } from "./namespace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function SecretTable() {
  const { namespace } = useNamespace();
  const { data: secrets, isLoading, error } = useSecrets(namespace);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
        Failed to load secrets: {error.message}
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

  if (!secrets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white/[0.02] border border-white/[0.06] rounded-xl border-dashed">
        <p>No Secrets found in this namespace.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
      <div className="grid grid-cols-5 gap-4 px-6 py-4 text-xs font-medium text-muted-foreground border-b border-white/[0.06] bg-white/[0.02]">
        <div>Name</div>
        <div>Namespace</div>
        <div>Type</div>
        <div>Data Keys</div>
        <div>Age</div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {secrets.map((secret, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={`${secret.namespace}-${secret.name}`}
            className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
          >
            <div className="font-mono text-sm">{secret.name}</div>
            <div className="text-sm text-muted-foreground">{secret.namespace}</div>
            <div className="text-sm font-mono text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md inline-block w-max">{secret.type}</div>
            <div className="text-sm">{secret.data_keys}</div>
            <div className="text-sm text-muted-foreground">{secret.age}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

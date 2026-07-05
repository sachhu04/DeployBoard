"use client";

import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { ConfigMapTable } from "@/components/dashboard/configmap-table";
import { useNamespaceContext as useNamespace } from "@/components/dashboard/namespace-context";

export default function ConfigMapsPage() {
  const { namespace } = useNamespace();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ConfigMaps</h1>
          <p className="text-muted-foreground mt-1">
            Manage configuration data and key-value pairs.
          </p>
        </div>
      </div>

      <KubectlHint
        command={`kubectl get configmaps${namespace && namespace !== "all" ? ` -n ${namespace}` : " -A"}`}
        explanation="Lists ConfigMaps. They are used to decouple configuration artifacts from image content to keep containerized applications portable."
      />

      <ConfigMapTable />
    </div>
  );
}

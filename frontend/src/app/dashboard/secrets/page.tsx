"use client";

import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { SecretTable } from "@/components/dashboard/secret-table";
import { useNamespaceContext as useNamespace } from "@/components/dashboard/namespace-context";

export default function SecretsPage() {
  const { namespace } = useNamespace();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secrets</h1>
          <p className="text-muted-foreground mt-1">
            Manage sensitive configuration like passwords and tokens.
          </p>
        </div>
      </div>

      <KubectlHint
        command={`kubectl get secrets${namespace && namespace !== "all" ? ` -n ${namespace}` : " -A"}`}
        explanation="Lists Secrets. Kubernetes stores Secrets similarly to ConfigMaps but provides additional safety measures for sensitive data."
      />

      <SecretTable />
    </div>
  );
}

"use client";

import { Header } from "@/components/dashboard/header";
import { PodTable } from "@/components/dashboard/pod-table";
import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { usePods } from "@/lib/hooks/use-pods";
import { useNamespaceContext } from "@/components/dashboard/namespace-context";

export default function PodsPage() {
  const { namespace } = useNamespaceContext();
  const { data: pods, isLoading } = usePods(namespace);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Pods"
        description="View individual pod instances and their scheduling status."
      />
      <div className="flex-1 p-6 space-y-6">
        <KubectlHint
          command={`kubectl get pods -n ${namespace}`}
          explanation="Lists all pods in the specified namespace, including their current status, restart count, and age."
        />
        <PodTable pods={pods} isLoading={isLoading} />
      </div>
    </div>
  );
}

"use client";

import { Header } from "@/components/dashboard/header";
import { DeploymentTable } from "@/components/dashboard/deployment-table";
import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { MetricsOverview } from "@/components/dashboard/metrics-chart";
import { useDeployments } from "@/lib/hooks/use-deployments";
import { useNamespaceContext } from "@/components/dashboard/namespace-context";
import { DeployDialog } from "@/components/dashboard/deploy-dialog";

export default function DeploymentsPage() {
  const { namespace } = useNamespaceContext();
  const { data: deployments, isLoading } = useDeployments(namespace);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Deployments"
        description="Manage stateless applications across your cluster."
        action={<DeployDialog />}
      />
      <div className="flex-1 p-6 space-y-6">
        <MetricsOverview />
        <KubectlHint
          command={`kubectl get deployments -n ${namespace}`}
          explanation="Lists all deployments in the specified namespace, showing ready replicas, up-to-date status, and age."
        />
        <DeploymentTable deployments={deployments} isLoading={isLoading} />
      </div>
    </div>
  );
}

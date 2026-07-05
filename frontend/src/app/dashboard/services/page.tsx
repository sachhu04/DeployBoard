"use client";

import { Header } from "@/components/dashboard/header";
import { ServiceTable } from "@/components/dashboard/service-table";
import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { useServices } from "@/lib/hooks/use-services";
import { useNamespaceContext } from "@/components/dashboard/namespace-context";

export default function ServicesPage() {
  const { namespace } = useNamespaceContext();
  const { data: services, isLoading } = useServices(namespace);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Services"
        description="Network endpoints exposing your pods."
      />
      <div className="flex-1 p-6 space-y-6">
        <KubectlHint
          command={`kubectl get svc -n ${namespace}`}
          explanation="Lists all services in the specified namespace, showing their type, cluster IP, and exposed ports."
        />
        <ServiceTable services={services} isLoading={isLoading} />
      </div>
    </div>
  );
}

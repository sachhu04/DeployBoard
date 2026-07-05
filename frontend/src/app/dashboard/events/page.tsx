"use client";

import { Header } from "@/components/dashboard/header";
import { EventFeed } from "@/components/dashboard/event-feed";
import { KubectlHint } from "@/components/dashboard/kubectl-hint";
import { useEvents } from "@/lib/hooks/use-events";
import { useNamespaceContext } from "@/components/dashboard/namespace-context";

export default function EventsPage() {
  const { namespace } = useNamespaceContext();
  const { data: events, isLoading } = useEvents(namespace);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Events"
        description="Cluster events and audit logs."
      />
      <div className="flex-1 p-6 space-y-6">
        <KubectlHint
          command={`kubectl get events -n ${namespace} --sort-by='.lastTimestamp'`}
          explanation="Fetches the stream of events for resources in the specified namespace, sorted chronologically. Useful for debugging scheduling and runtime issues."
        />
        <EventFeed events={events} isLoading={isLoading} />
      </div>
    </div>
  );
}

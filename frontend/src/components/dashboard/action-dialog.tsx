"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KubectlHint } from "./kubectl-hint";
import {
  useRestartDeployment,
  useRollbackDeployment,
  useDeleteDeployment,
} from "@/lib/hooks/use-deployments";
import type { Deployment } from "@/lib/types";

interface ActionDialogProps {
  type: "restart" | "rollback" | "delete";
  deployment: Deployment | null;
  onClose: () => void;
}

const config = {
  restart: {
    title: "Restart Deployment",
    description: "This will trigger a rolling restart of the deployment.",
    commandFn: (name: string, ns: string) =>
      `kubectl rollout restart deployment ${name} -n ${ns}`,
    explanationFn: (name: string) =>
      `Triggers a rolling restart of deployment '${name}'. Kubernetes will create new pods with a fresh start and gradually terminate old ones.`,
    buttonLabel: "Restart",
    buttonLabelPending: "Restarting...",
  },
  rollback: {
    title: "Rollback Deployment",
    description:
      "This will revert the deployment to its previous revision.",
    commandFn: (name: string, ns: string) =>
      `kubectl rollout undo deployment ${name} -n ${ns}`,
    explanationFn: (name: string) =>
      `Rolls back deployment '${name}' to the previous revision. Kubernetes will switch to the last known-good ReplicaSet.`,
    buttonLabel: "Rollback",
    buttonLabelPending: "Rolling back...",
  },
  delete: {
    title: "Delete Deployment",
    description:
      "This will permanently delete the deployment and all associated pods.",
    commandFn: (name: string, ns: string) =>
      `kubectl delete deployment ${name} -n ${ns}`,
    explanationFn: (name: string) =>
      `Deletes the deployment '${name}'. This action is destructive and cannot be undone.`,
    buttonLabel: "Delete",
    buttonLabelPending: "Deleting...",
  },
};

export function ActionDialog({ type, deployment, onClose }: ActionDialogProps) {
  const restartMutation = useRestartDeployment();
  const rollbackMutation = useRollbackDeployment();
  const deleteMutation = useDeleteDeployment();
  const mutation = type === "restart" ? restartMutation : type === "rollback" ? rollbackMutation : deleteMutation;
  const cfg = config[type];

  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    if (!deployment) return;
    setError(null);
    try {
      await mutation.mutateAsync({
        name: deployment.name,
        namespace: deployment.namespace,
      });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(msg);
    }
  };

  if (!deployment) return null;

  return (
    <Dialog open={!!deployment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-base">{cfg.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {cfg.description}{" "}
            <span className="font-mono text-foreground">
              {deployment.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <KubectlHint
            command={cfg.commandFn(deployment.name, deployment.namespace)}
            explanation={cfg.explanationFn(deployment.name)}
          />
        </div>

        {error && (
          <div className="px-6 pb-2 text-sm text-red-500 font-mono">
            Error: {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/[0.08]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant={type === "delete" ? "destructive" : "default"}
            disabled={mutation.isPending}
            className={
              type === "rollback"
                ? "bg-yellow-500 text-black hover:bg-yellow-500/90"
                : type === "delete"
                ? ""
                : "bg-yellow text-yellow-foreground hover:bg-yellow/90"
            }
          >
            {mutation.isPending ? cfg.buttonLabelPending : cfg.buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

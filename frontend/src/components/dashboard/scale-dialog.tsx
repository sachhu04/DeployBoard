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
import { Input } from "@/components/ui/input";
import { KubectlHint } from "./kubectl-hint";
import { useScaleDeployment } from "@/lib/hooks/use-deployments";
import type { Deployment } from "@/lib/types";

interface ScaleDialogProps {
  deployment: Deployment | null;
  onClose: () => void;
}

export function ScaleDialog({ deployment, onClose }: ScaleDialogProps) {
  const [replicas, setReplicas] = useState(1);
  const scaleMutation = useScaleDeployment();

  const handleOpen = (open: boolean) => {
    if (!open) onClose();
    else if (deployment) setReplicas(deployment.desired_replicas);
  };

  const handleScale = async () => {
    if (!deployment) return;
    await scaleMutation.mutateAsync({
      name: deployment.name,
      replicas,
      namespace: deployment.namespace,
    });
    onClose();
  };

  if (!deployment) return null;

  return (
    <Dialog open={!!deployment} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[480px] bg-card border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-base">Scale Deployment</DialogTitle>
          <DialogDescription className="text-sm">
            Adjust the number of replicas for{" "}
            <span className="font-mono text-foreground">
              {deployment.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="replica-count">
              Replica Count
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-white/[0.08]"
                onClick={() => setReplicas(Math.max(0, replicas - 1))}
              >
                −
              </Button>
              <Input
                id="replica-count"
                type="number"
                min={0}
                max={20}
                value={replicas}
                onChange={(e) => setReplicas(parseInt(e.target.value) || 0)}
                className="w-20 text-center bg-white/[0.04] border-white/[0.08]"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-white/[0.08]"
                onClick={() => setReplicas(Math.min(20, replicas + 1))}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">
                Currently: {deployment.desired_replicas}
              </span>
            </div>
          </div>

          <KubectlHint
            command={`kubectl scale deployment ${deployment.name} --replicas=${replicas} -n ${deployment.namespace}`}
            explanation={`Scales the deployment '${deployment.name}' to ${replicas} replica(s). Kubernetes will create or terminate pods to match the desired count.`}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/[0.08]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleScale}
            disabled={scaleMutation.isPending}
            className="bg-yellow text-yellow-foreground hover:bg-yellow/90"
          >
            {scaleMutation.isPending ? "Scaling..." : "Scale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

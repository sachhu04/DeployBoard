"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KubectlHint } from "./kubectl-hint";
import { useDeploymentYaml, useApplyDeploymentYaml } from "@/lib/hooks/use-deployments";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, AlertCircle } from "lucide-react";
import type { Deployment } from "@/lib/types";

interface YamlDialogProps {
  deployment: Deployment | null;
  onClose: () => void;
}

export function YamlDialog({ deployment, onClose }: YamlDialogProps) {
  const { data, isLoading } = useDeploymentYaml(
    deployment?.name ?? "",
    deployment?.namespace,
  );
  
  const applyYaml = useApplyDeploymentYaml();
  
  const [content, setContent] = useState("");
  const [isEdited, setIsEdited] = useState(false);

  // Sync initial data to local state
  useEffect(() => {
    if (data?.yaml) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(data.yaml);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEdited(false);
    }
  }, [data?.yaml, deployment]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsEdited(value !== data?.yaml);
    }
  };

  const handleSave = () => {
    if (!deployment) return;
    
    applyYaml.mutate(
      { name: deployment.name, yamlContent: content, namespace: deployment.namespace },
      {
        onSuccess: (res) => {
          alert(`YAML Applied Successfully\n\n${res.message}`);
          setIsEdited(false);
        },
        onError: (err: Error) => {
          alert(`Failed to Apply YAML\n\n${err.message || "An unexpected error occurred."}`);
        }
      }
    );
  };

  if (!deployment) return null;

  return (
    <Dialog open={!!deployment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col bg-card border-white/[0.08] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-base font-mono">
            {deployment.name}.yaml
            {isEdited && <span className="text-yellow-500 ml-2 text-sm">*</span>}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setContent(data?.yaml || "");
                setIsEdited(false);
              }}
              disabled={!isEdited || applyYaml.isPending}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="bg-yellow text-yellow-foreground hover:bg-yellow/90"
              onClick={handleSave}
              disabled={!isEdited || applyYaml.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {applyYaml.isPending ? "Applying..." : "Apply"}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <KubectlHint
            command={`kubectl apply -f ${deployment.name}.yaml`}
            explanation="Applies the configuration changes to the cluster."
          />
          
          {isEdited && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-500/10 text-yellow-500 rounded-md shrink-0">
              <AlertCircle className="h-4 w-4" />
              <span>You have unsaved changes. Apply to update the cluster.</span>
            </div>
          )}

          <div className="flex-1 relative rounded-md overflow-hidden border border-white/[0.08] min-h-[400px]">
            {isLoading ? (
              <Skeleton className="absolute inset-0" />
            ) : (
              <Editor
                height="100%"
                language="yaml"
                theme="vs-dark"
                value={content}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "JetBrains Mono, monospace",
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

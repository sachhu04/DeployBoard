"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { request } from "@/lib/api";
import { RocketIcon, RefreshCwIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

export function DeployDialog() {
  const [open, setOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "cloning" | "building" | "loading" | "deploying" | "completed" | "failed">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (["pending", "cloning", "building", "loading", "deploying"].includes(status)) {
      interval = setInterval(async () => {
        try {
          const res = await request<any>(`/api/ci/status/${appName}`);
          setStatus(res.status);
          setLogs(res.logs || []);
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, appName]);

  const handleDeploy = async () => {
    if (!repoUrl || !appName) return;
    setStatus("pending");
    setLogs([]);
    try {
      await request("/api/ci/deploy", {
        method: "POST",
        body: JSON.stringify({ app_name: appName, repo_url: repoUrl })
      });
    } catch (e) {
      setStatus("failed");
      setLogs(["Failed to trigger deployment pipeline"]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-yellow text-yellow-foreground hover:bg-yellow/90" />}>
        <RocketIcon className="mr-2 h-4 w-4" />
        Deploy New App
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy from GitHub</DialogTitle>
        </DialogHeader>

        {status === "idle" ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="appName" className="text-sm font-medium">Application Name</label>
              <Input
                id="appName"
                placeholder="e.g. my-awesome-app"
                value={appName}
                onChange={(e) => setAppName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="repoUrl" className="text-sm font-medium">GitHub Repository URL</label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleDeploy} disabled={!appName || !repoUrl}>
              Trigger CI/CD Pipeline
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-4">
              {status === "completed" ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : status === "failed" ? (
                <XCircleIcon className="h-6 w-6 text-red-500" />
              ) : (
                <RefreshCwIcon className="h-6 w-6 animate-spin text-yellow" />
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none capitalize">
                  {status}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status === "completed" 
                    ? "Deployment successful! Check the dashboard." 
                    : status === "failed"
                    ? "Deployment failed. Check logs."
                    : "Building and deploying your app..."}
                </p>
              </div>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs h-48 overflow-y-auto mt-4">
              {logs.length === 0 ? "Initializing pipeline..." : logs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>

            {(status === "completed" || status === "failed") && (
              <Button onClick={() => setOpen(false)} variant="outline">
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

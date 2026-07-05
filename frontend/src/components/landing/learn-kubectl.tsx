"use client";

import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const commands = [
  {
    action: "Scale Deployment",
    command: "kubectl scale deployment frontend --replicas=4 -n default",
    explanation:
      "Adjusts the number of running pod replicas for the specified deployment.",
  },
  {
    action: "Restart Deployment",
    command: "kubectl rollout restart deployment frontend -n default",
    explanation:
      "Triggers a rolling restart — new pods are created before old ones terminate.",
  },
  {
    action: "Rollback",
    command: "kubectl rollout undo deployment frontend -n default",
    explanation:
      "Reverts the deployment to its previous revision using the prior ReplicaSet.",
  },
  {
    action: "Stream Logs",
    command: "kubectl logs -f frontend-7d4b8c6f9-x2k4m -n default",
    explanation:
      "Follows (streams) the stdout/stderr output from a running container in real-time.",
  },
];

function CommandCard({
  action,
  command,
  explanation,
}: {
  action: string;
  command: string;
  explanation: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-cyan">{action}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Copy ${action} command`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-cyan" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className="bg-black/30 rounded-lg px-4 py-3 font-mono text-sm text-foreground/80 overflow-x-auto">
        <span className="text-cyan/60">$ </span>
        {command}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}

export function LearnKubectl() {
  return (
    <section id="learn" className="py-32 relative">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-cyan mb-3 tracking-wide uppercase">
            Learn as you go
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Every action teaches you kubectl
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stop memorizing commands. DeployBoard shows the exact kubectl
            equivalent for every operation you perform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {commands.map((cmd) => (
            <CommandCard key={cmd.action} {...cmd} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

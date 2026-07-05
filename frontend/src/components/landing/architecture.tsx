"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const layers = [
  {
    label: "Next.js 15 Frontend",
    tech: "TypeScript · Tailwind · shadcn/ui",
    color: "bg-cyan/10 text-cyan border-cyan/20",
  },
  {
    label: "FastAPI Backend",
    tech: "REST API · WebSocket Streaming",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    label: "Kubernetes Python Client",
    tech: "CoreV1Api · AppsV1Api",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    label: "Kind / Minikube Cluster",
    tech: "Local Development Cluster",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="py-32 relative">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-cyan mb-3 tracking-wide uppercase">
            Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Clean, composable, production-ready
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A straightforward four-layer architecture. Each layer communicates
            through well-defined APIs.
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div
                className={`rounded-xl border px-6 py-4 ${layer.color} transition-transform hover:scale-[1.02]`}
              >
                <div className="font-semibold text-sm">{layer.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{layer.tech}</div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

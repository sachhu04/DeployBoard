"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const layers = [
  {
    label: "Next.js 15 Frontend",
    tech: "TypeScript · Tailwind · shadcn/ui",
    colorBase: "yellow",
    colorBg: "bg-yellow-500/5",
    colorText: "text-yellow-400",
  },
  {
    label: "FastAPI Backend",
    tech: "REST API · WebSocket Streaming",
    colorBase: "blue",
    colorBg: "bg-blue-500/5",
    colorText: "text-blue-400",
  },
  {
    label: "Kubernetes Python Client",
    tech: "CoreV1Api · AppsV1Api",
    colorBase: "purple",
    colorBg: "bg-purple-500/5",
    colorText: "text-purple-400",
  },
  {
    label: "Kind / Minikube Cluster",
    tech: "Local Development Cluster",
    colorBase: "orange",
    colorBg: "bg-orange-500/5",
    colorText: "text-orange-400",
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
          <p className="text-sm font-medium text-yellow mb-3 tracking-wide uppercase">
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

        <div className="w-full max-w-2xl mx-auto relative group">
          {/* Animated Boundary Sweep */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-yellow-500/10 via-yellow-400/80 to-purple-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
             <motion.div 
               animate={{ x: ["-100%", "200%"] }}
               transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-300 to-transparent blur-[4px]"
             />
          </div>

          <div className="relative z-10 rounded-xl bg-black border border-white/[0.08] shadow-2xl overflow-hidden">
             {/* Single macOS Header */}
             <div className="h-10 border-b border-white/[0.06] bg-black/40 flex items-center px-4 shrink-0 rounded-t-xl">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                 <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
               </div>
               <div className="flex-1 text-center font-mono text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                 Architecture Pipeline
               </div>
               <div className="w-16" />
             </div>
             
             {/* Body */}
             <div className="p-8 relative bg-black">
               {/* Vertical Connecting Line */}
               <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-[2px] bg-white/[0.04] rounded-full" />

               <div className="flex flex-col gap-10 relative z-10">
                 {layers.map((layer, i) => (
                    <motion.div
                      key={layer.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      className={`relative rounded-xl border border-white/[0.04] bg-[#09090b] overflow-hidden transition-all hover:scale-[1.02] hover:border-white/[0.1] hover:shadow-xl`}
                    >
                      {/* Subtle color tint overlay */}
                      <div className={`absolute inset-0 ${layer.colorBg} opacity-50`} />
                      
                      <div className={`relative z-10 px-6 py-6 flex flex-col justify-center items-center text-center`}>
                        <div className={`font-mono text-sm font-medium ${layer.colorText}`}>{layer.label}</div>
                        <div className="text-xs text-muted-foreground mt-2">{layer.tech}</div>
                      </div>
                    </motion.div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

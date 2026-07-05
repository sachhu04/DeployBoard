"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
  </svg>
);

const TABS = ["Deployments", "Pods", "Services", "Logs", "Events"];
const TAB_DATA = {
  Deployments: {
    headers: ["Name", "Ready", "Status", "Age"],
    rows: [
      { col1: "frontend", col2: "3/3", col3: "Available", col4: "2d", color: "yellow" },
      { col1: "backend-api", col2: "2/2", col3: "Available", col4: "5h", color: "yellow" },
      { col1: "auth-service", col2: "1/2", col3: "Progressing", col4: "12m", color: "yellow" },
    ],
  },
  Pods: {
    headers: ["Name", "Phase", "Restarts", "Age"],
    rows: [
      { col1: "frontend-78xj", col2: "Running", col3: "0", col4: "12m", color: "green" },
      { col1: "backend-api-9kz", col2: "Running", col3: "0", col4: "5h", color: "green" },
      { col1: "auth-svc-4x", col2: "Pending", col3: "0", col4: "1m", color: "yellow" },
    ],
  },
  Services: {
    headers: ["Name", "Type", "Cluster-IP", "Ports"],
    rows: [
      { col1: "frontend", col2: "ClusterIP", col3: "10.96.1.4", col4: "80/TCP", color: "none" },
      { col1: "backend-api", col2: "ClusterIP", col3: "10.96.2.55", col4: "8000/TCP", color: "none" },
      { col1: "auth-service", col2: "NodePort", col3: "10.96.3.12", col4: "5000:3212", color: "none" },
    ],
  },
  Logs: {
    headers: ["Time", "Container", "Level", "Message"],
    rows: [
      { col1: "10:24", col2: "api", col3: "INFO", col4: "Server started", color: "yellow" },
      { col1: "10:24", col2: "api", col3: "INFO", col4: "DB connected", color: "yellow" },
      { col1: "10:25", col2: "api", col3: "WARN", col4: "High memory", color: "yellow" },
    ],
  },
  Events: {
    headers: ["Reason", "Object", "Type", "Message"],
    rows: [
      { col1: "Scheduled", col2: "pod/api", col3: "Normal", col4: "Assigned", color: "yellow" },
      { col1: "Pulling", col2: "pod/api", col3: "Normal", col4: "Pulling image", color: "yellow" },
      { col1: "BackOff", col2: "pod/api", col3: "Warning", col4: "Restarting", color: "yellow" },
    ],
  },
};

export function Hero() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTabIndex((prev) => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const activeTabName = TABS[activeTabIndex];
  const activeData = TAB_DATA[activeTabName as keyof typeof TAB_DATA];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-36 pb-20">
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-yellow/[0.04] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8"
          >
            <Terminal className="h-3.5 w-3.5 text-yellow" />
            <span>Cloud-Native Kubernetes Management</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Operate{" "}
            <span className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Kubernetes</span>
            <br />
            from your browser.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Inspect deployments, stream pod logs in real-time, scale workloads,
            perform rollbacks, and learn the equivalent kubectl commands — all
            from a single dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              size="lg"
              className="bg-yellow text-yellow-foreground hover:bg-yellow/90 glow-yellow px-8 h-12 text-base"
            >
              <GithubIcon className="mr-2 h-4 w-4" />
              Get Started with GitHub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              render={<a href="#features" />}
              variant="outline"
              size="lg"
              className="px-8 h-12 text-base border-white/10 hover:bg-white/5"
              nativeButton={false}
            >
              See Features
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-20 relative group mx-auto w-full max-w-4xl text-left"
        >
          {/* Animated Boundary Sweep */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-yellow-500/10 via-yellow-400/80 to-purple-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
             <motion.div 
               animate={{ x: ["-100%", "200%"] }}
               transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-300 to-transparent blur-[4px]"
             />
          </div>

          <div className="relative z-10 glass-strong rounded-xl bg-[#09090b] shadow-2xl overflow-hidden">
            <div className="bg-[#09090b]">
              {/* macOS browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-black/40">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/[0.04] rounded-md px-4 py-1 text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-yellow-500" />
                    deployboard.local/dashboard
                  </div>
                </div>
                <div className="w-16" /> {/* Spacer */}
              </div>
              {/* Dashboard mockup content */}
              <div className="p-6 space-y-4 min-h-[320px]">
                <div className="flex gap-4">
                  {/* Sidebar mock */}
                  <div className="w-48 space-y-2 hidden sm:block">
                    {["Deployments", "Pods", "Services", "Logs", "Events"].map(
                      (item) => (
                        <div
                          key={item}
                          className={`px-3 py-2 rounded-md text-sm transition-colors duration-300 ${
                            item === activeTabName
                              ? "bg-yellow/10 text-yellow"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                  {/* Table mock */}
                  <div className="flex-1 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{activeTabName}</div>
                      <div className="text-xs text-muted-foreground">
                        namespace: default
                      </div>
                    </div>
                    
                    {/* The table content wrapper handles the fade transitions */}
                    <div className="border border-white/[0.06] rounded-lg overflow-hidden relative h-[172px]">
                      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 px-4 py-2.5 text-xs text-muted-foreground border-b border-white/[0.06] bg-white/[0.02]">
                        {activeData.headers.map((h, i) => (
                          <span key={i} className="truncate">{h}</span>
                        ))}
                      </div>
                      
                      <motion.div
                        key={activeTabName}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {activeData.rows.map((row, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 px-4 py-2.5 text-sm border-b border-white/[0.04] last:border-0"
                          >
                            <span className="font-mono text-xs truncate">{row.col1}</span>
                            <span className="font-mono text-xs truncate">{row.col2}</span>
                            <span className="truncate">
                              {row.color === "none" ? (
                                <span className="font-mono text-xs text-muted-foreground">
                                  {row.col3}
                                </span>
                              ) : (
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                                    row.color === "yellow"
                                      ? "bg-yellow/10 text-yellow"
                                      : row.color === "green"
                                      ? "bg-green-500/10 text-green-400"
                                      : "bg-yellow-500/10 text-yellow-400"
                                  }`}
                                >
                                  {row.col3}
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono truncate">
                              {row.col4}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom glow under preview */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-yellow/[0.06] blur-[100px] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

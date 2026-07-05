"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-cyan/[0.04] blur-[120px]" />

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
            <Terminal className="h-3.5 w-3.5 text-cyan" />
            <span>Cloud-Native Kubernetes Management</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Operate{" "}
            <span className="text-gradient">Kubernetes</span>
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
              className="bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan px-8 h-12 text-base"
            >
              Get Started with GitHub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              render={<a href="#features" />}
              variant="outline"
              size="lg"
              className="px-8 h-12 text-base border-white/10 hover:bg-white/5"
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
          className="mt-20 relative"
        >
          <div className="glass-strong rounded-xl p-1">
            <div className="bg-[oklch(0.12_0_0)] rounded-lg overflow-hidden border border-white/[0.04]">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/[0.06] rounded-md px-4 py-1 text-xs text-muted-foreground font-mono">
                    localhost:3000/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard mockup content */}
              <div className="p-6 space-y-4 min-h-[320px]">
                <div className="flex gap-4">
                  {/* Sidebar mock */}
                  <div className="w-48 space-y-2 hidden sm:block">
                    {["Deployments", "Pods", "Services", "Logs", "Events"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={`px-3 py-2 rounded-md text-sm ${
                            i === 0
                              ? "bg-cyan/10 text-cyan"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                  {/* Table mock */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Deployments</div>
                      <div className="text-xs text-muted-foreground">
                        namespace: default
                      </div>
                    </div>
                    <div className="border border-white/[0.06] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 gap-4 px-4 py-2.5 text-xs text-muted-foreground border-b border-white/[0.06] bg-white/[0.02]">
                        <span>Name</span>
                        <span>Ready</span>
                        <span>Status</span>
                        <span>Age</span>
                      </div>
                      {[
                        { name: "frontend", ready: "3/3", status: "Available", age: "2d" },
                        { name: "backend-api", ready: "2/2", status: "Available", age: "5h" },
                        { name: "auth-service", ready: "1/2", status: "Progressing", age: "12m" },
                      ].map((row) => (
                        <div
                          key={row.name}
                          className="grid grid-cols-4 gap-4 px-4 py-2.5 text-sm border-b border-white/[0.04] last:border-0"
                        >
                          <span className="font-mono text-xs">{row.name}</span>
                          <span className="font-mono text-xs">{row.ready}</span>
                          <span>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                                row.status === "Available"
                                  ? "bg-cyan/10 text-cyan"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {row.status}
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {row.age}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom glow under preview */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-cyan/[0.06] blur-[100px] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

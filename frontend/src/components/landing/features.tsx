"use client";

import { motion } from "framer-motion";
import {
  Layers,
  ScrollText,
  Scale,
  RotateCcw,
  Terminal,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "One-Click Management",
    description:
      "Scale, restart, rollback, or delete deployments and pods instantly. No more typing long kubectl commands.",
  },
  {
    icon: ScrollText,
    title: "Real-Time Observability",
    description:
      "Stream pod logs and view live CPU/Memory utilization graphs powered by real cluster metrics.",
  },
  {
    icon: Terminal,
    title: "Interactive Web Terminal",
    description:
      "Pop open a native Web Socket terminal to exec directly into any pod's shell from your browser.",
  },
  {
    icon: Globe,
    title: "Live CI/CD Pipelines",
    description:
      "Trigger live deployments from GitHub. Watch the engine clone, build, and deploy your code in real-time.",
  },
  {
    icon: Scale,
    title: "Live YAML Editing",
    description:
      "View, edit, and apply Kubernetes YAML configurations live using an embedded VS Code-style Monaco editor.",
  },
  {
    icon: RotateCcw,
    title: "Learn kubectl",
    description:
      "Every action shows the exact kubectl command and explains what it does. Build real Kubernetes skills.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-yellow mb-3 tracking-wide uppercase">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything you need to manage Kubernetes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete toolkit for inspecting, managing, and learning Kubernetes
            — without leaving your browser.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10 text-yellow mb-4 group-hover:bg-yellow/15 transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

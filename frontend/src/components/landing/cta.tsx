"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-cyan/[0.02]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to simplify Kubernetes?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Start managing your cluster from the browser. No kubectl required —
            but you&apos;ll learn it anyway.
          </p>
          <Button render={<Link href="/dashboard" />} size="lg" className="w-full sm:w-auto h-12 px-8 bg-cyan text-cyan-foreground hover:bg-cyan/90 text-sm font-semibold rounded-full group">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow text-yellow-foreground">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            DeployBoard
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Architecture
          </a>
          <a
            href="#learn"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn kubectl
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button render={<a href="https://github.com/sachhu04/DeployBoard" target="_blank" rel="noopener noreferrer" />} variant="ghost" size="sm" nativeButton={false}>
            GitHub
          </Button>
          <Button
            render={<Link href="/dashboard" />}
            size="sm"
            className="bg-yellow text-yellow-foreground hover:bg-yellow/90"
            nativeButton={false}
          >
            Open Dashboard
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

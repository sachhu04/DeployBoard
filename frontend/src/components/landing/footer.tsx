import { Box } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Box className="h-4 w-4" />
          <span className="text-sm">DeployBoard</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Built with Next.js, FastAPI, and the Kubernetes Python Client.
        </p>
      </div>
    </footer>
  );
}

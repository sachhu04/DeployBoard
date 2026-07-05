import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  Available: "bg-cyan/10 text-cyan border-cyan/20 hover:bg-cyan/15",
  Running: "bg-cyan/10 text-cyan border-cyan/20 hover:bg-cyan/15",
  Active: "bg-cyan/10 text-cyan border-cyan/20 hover:bg-cyan/15",
  Progressing: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15",
  Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15",
  CrashLoopBackOff: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15",
  Error: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15",
  Failed: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15",
  Completed: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
  Succeeded: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
  Normal: "bg-cyan/10 text-cyan border-cyan/20 hover:bg-cyan/15",
  Warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-white/5 text-muted-foreground border-white/10";

  return (
    <Badge variant="outline" className={`text-xs font-medium ${style}`}>
      {status}
    </Badge>
  );
}

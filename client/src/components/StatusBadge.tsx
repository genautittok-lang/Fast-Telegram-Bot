import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline" | "maintenance";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    online: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_-3px_hsl(var(--primary))]",
    offline: "bg-destructive/10 text-destructive border-destructive/20",
    maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  const dots = {
    online: "bg-primary animate-pulse",
    offline: "bg-destructive",
    maintenance: "bg-yellow-500",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider",
      styles[status],
      className
    )}>
      <span className={cn("w-2 h-2 rounded-full", dots[status])} />
      {status === 'online' ? 'System Operational' : status}
    </div>
  );
}

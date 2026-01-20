import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  delay?: number;
  icon?: ReactNode;
}

export function StatCard({ label, value, prefix, delay = 0, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-white/5",
        "hover:border-primary/30 transition-all duration-300 hover:bg-card/80"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-primary">{icon}</span>}
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold font-display text-white text-glow flex items-baseline gap-1">
        {prefix && <span className="text-lg text-primary/50">{prefix}</span>}
        {value}
      </div>
    </motion.div>
  );
}

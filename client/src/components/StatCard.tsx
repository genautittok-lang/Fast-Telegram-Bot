import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  delay?: number;
}

export function StatCard({ label, value, prefix, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-white/5",
        "hover:border-primary/30 transition-all duration-300 hover:bg-card/80"
      )}
    >
      <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </span>
      <div className="text-4xl font-bold font-display text-white text-glow flex items-baseline gap-1">
        {prefix && <span className="text-2xl text-primary/50">{prefix}</span>}
        {value}
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: "brand" | "cyan" | "amber" | "red" | "green";
  delay?: number;
}

const accentStyles: Record<string, string> = {
  brand: "from-brand-500/20 to-brand-500/5 text-brand-300",
  cyan: "from-accent-500/20 to-accent-500/5 text-accent-400",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-400",
  red: "from-red-500/20 to-red-500/5 text-red-400",
  green: "from-green-500/20 to-green-500/5 text-green-400",
};

export default function StatCard({ label, value, icon: Icon, accent = "brand", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card flex items-center gap-4 p-5"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentStyles[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}

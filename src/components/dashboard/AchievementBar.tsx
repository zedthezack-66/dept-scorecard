import { motion } from 'framer-motion';
import { fmt, fmtK } from '@/lib/data';

interface AchievementBarProps {
  rate: number;
  collected: number;
  target: number;
}

const AchievementBar = ({ rate, collected, target }: AchievementBarProps) => {
  const ticks = [0, 1, 2, 3, 4].map(i => fmtK(target * (i / 4)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.4 }}
      className="mb-5 rounded-lg border border-border bg-card p-6 shadow-card"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[12px] font-bold tracking-[3px] uppercase text-muted-foreground">
            Target Achievement Progress
          </div>
          <div className="text-[14px] text-muted-foreground">
            K {fmt(collected)} collected of K {fmt(target)} target
          </div>
        </div>
        <div className="font-display text-[52px] leading-none text-foreground">
          {rate}<span className="text-[24px] text-muted-foreground">%</span>
        </div>
      </div>
      <div className="mb-2 h-5 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-navy-2 via-navy-3 to-[hsl(220,80%,55%)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(rate, 100)}%` }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex justify-between text-[12px] font-medium text-muted-foreground">
        {ticks.map((t, i) => <span key={i}>K {t}</span>)}
      </div>
    </motion.div>
  );
};

export default AchievementBar;

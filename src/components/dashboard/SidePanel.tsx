import { motion } from 'framer-motion';
import { fmtK, type AgentData } from '@/lib/data';

interface ProcessedAgent extends AgentData {
  variance: number;
  rate: number;
}

interface SidePanelProps {
  rate: number;
  collected: number;
  remaining: number;
  topPerformer: ProcessedAgent;
  needsAttention: ProcessedAgent[];
}

const SidePanel = ({ rate, collected, remaining, topPerformer, needsAttention }: SidePanelProps) => {
  const circumference = 2 * Math.PI * 50;
  const dashArray = (circumference * rate / 100).toFixed(1);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Donut */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.4 }}
        className="rounded-lg border border-border bg-card p-5 shadow-card"
      >
        <div className="mb-3 text-[9px] font-bold tracking-[3px] uppercase text-muted-foreground">Portfolio Breakdown</div>
        <div className="relative mb-3 flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="50" fill="none" stroke="hsl(var(--ivory-2))" strokeWidth="16" />
            <motion.circle
              cx="70" cy="70" r="50" fill="none"
              stroke="hsl(var(--emerald))"
              strokeWidth="16"
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dashArray} ${circumference}` }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute text-center">
            <span className="block font-display text-[28px] leading-none text-foreground">{rate}%</span>
            <span className="text-[8px] tracking-[2px] uppercase text-muted-foreground">Collected</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-border py-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald" /> Collected
          </div>
          <span className="font-display text-[15px] tracking-wider text-emerald">{fmtK(collected)}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-ivory-3" /> Remaining
          </div>
          <span className="font-display text-[15px] tracking-wider text-amber">{fmtK(remaining)}</span>
        </div>
      </motion.div>

      {/* Top Performer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="rounded-lg bg-gradient-to-br from-primary to-navy-3 p-5 text-primary-foreground shadow-card-lg"
      >
        <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold tracking-[3px] uppercase text-primary-foreground/35">
          🏆 Top Performer
        </div>
        <div className="font-display text-[22px] tracking-[2px] text-primary-foreground">{topPerformer.name}</div>
        <div className="font-display text-[44px] leading-none text-accent">{topPerformer.rate}%</div>
        <div className="mt-0.5 text-[10px] text-primary-foreground/40">
          K {fmtK(topPerformer.movement)} collected · Target K {fmtK(topPerformer.target)}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-primary-foreground/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-gold-light"
            initial={{ width: 0 }}
            animate={{ width: `${topPerformer.rate}%` }}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>

      {/* Needs Attention */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46, duration: 0.4 }}
        className="rounded-lg border border-border bg-card p-4 shadow-card"
      >
        <div className="mb-3 text-[9px] font-bold tracking-[3px] uppercase text-muted-foreground">⚠ Needs Attention</div>
        {needsAttention.map((r, i) => (
          <div key={i} className={`flex items-center justify-between py-1.5 ${i < needsAttention.length - 1 ? 'border-b border-border' : ''}`}>
            <span className="text-[11px] font-medium text-muted-foreground">{r.name}</span>
            <span className="font-display text-[15px] text-red">{r.rate}%</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SidePanel;

import { motion } from 'framer-motion';
import { fmtK } from '@/lib/data';

interface KPIItem {
  label: string;
  value: string;
  note: string;
  barPct: number;
  color: 'navy' | 'emerald' | 'amber' | 'gold';
}

const colorMap = {
  navy: { bar: 'bg-primary', text: 'text-foreground' },
  emerald: { bar: 'bg-emerald', text: 'text-emerald' },
  amber: { bar: 'bg-amber', text: 'text-amber' },
  gold: { bar: 'bg-accent', text: 'text-accent' },
};

const KPIStrip = ({ items }: { items: KPIItem[] }) => (
  <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {items.map((item, i) => {
      const c = colorMap[item.color];
      return (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-card"
        >
          <div className={`absolute top-0 left-0 right-0 h-[4px] ${c.bar}`} />
          <div className="mb-2 text-[13px] font-bold tracking-[3px] uppercase text-muted-foreground">
            {item.label}
          </div>
          <div className={`font-display text-[clamp(32px,4vw,48px)] leading-none tracking-wider ${c.text}`}>
            {item.value}
          </div>
          <div className="mt-2 h-[4px] overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={`h-full rounded-full ${c.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${item.barPct}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-2 text-[14px] text-muted-foreground">{item.note}</div>
        </motion.div>
      );
    })}
  </div>
);

export default KPIStrip;
export type { KPIItem };

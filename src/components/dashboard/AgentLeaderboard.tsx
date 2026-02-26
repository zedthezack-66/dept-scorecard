import { motion } from 'framer-motion';
import { fmt, fmtK, type AgentData } from '@/lib/data';

interface ProcessedAgent extends AgentData {
  variance: number;
  rate: number;
}

interface AgentLeaderboardProps {
  rows: ProcessedAgent[];
  totT: number;
  totM: number;
  totV: number;
  rate: number;
  maxM: number;
}

const medals = ['🥇', '🥈', '🥉'];

const rateClass = (r: number) => r >= 60 ? 'bg-emerald/15 text-emerald' : r >= 30 ? 'bg-amber/20 text-amber' : 'bg-red/15 text-red';
const barColor = (r: number) => r >= 60 ? 'bg-emerald' : r >= 30 ? 'bg-amber' : 'bg-red';

const AgentLeaderboard = ({ rows, totT, totM, totV, rate, maxM }: AgentLeaderboardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.28, duration: 0.4 }}
    className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
  >
    <div className="flex items-center justify-between bg-primary px-6 py-4">
      <span className="font-display text-[20px] tracking-[3px] text-primary-foreground">Agent Leaderboard</span>
      <span className="rounded border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold tracking-[2px] uppercase text-primary-foreground/50">
        {rows.length} Agents
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-border bg-secondary">
            <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">#</th>
            <th className="px-5 py-3 text-left text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Agent</th>
            <th className="hidden px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground md:table-cell">Target (K)</th>
            <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Movement (K)</th>
            <th className="hidden px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground md:table-cell">Variance (K)</th>
            <th className="px-5 py-3 text-right text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground">Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-border transition-colors hover:bg-primary/[0.03] ${i === 0 ? 'bg-accent/5' : ''}`}>
              <td className={`px-5 py-3.5 font-display text-[22px] ${i < 3 ? (i === 0 ? 'text-accent' : i === 1 ? 'text-muted-foreground' : 'text-amber') : 'text-border'}`}>
                {i < 3 ? medals[i] : i + 1}
              </td>
              <td className="px-5 py-3.5">
                <div className="text-[15px] font-semibold text-foreground">{r.name}</div>
                <div className="text-[12px] text-muted-foreground">{r.phone}</div>
              </td>
              <td className="hidden px-5 py-3.5 text-right text-[14px] md:table-cell">{fmt(r.target)}</td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[14px] font-semibold">{fmt(r.movement)}</span>
                  <div className="h-[4px] w-[80px] overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className={`h-full rounded-full ${barColor(r.rate)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.movement / maxM * 100).toFixed(1)}%` }}
                      transition={{ duration: 1.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </td>
              <td className="hidden px-5 py-3.5 text-right text-[14px] font-medium text-amber md:table-cell">{fmt(r.variance)}</td>
              <td className="px-5 py-3.5 text-right">
                <span className={`inline-flex min-w-[56px] items-center justify-center rounded-md px-3 py-1 font-display text-[17px] tracking-wider ${rateClass(r.rate)}`}>
                  {r.rate}%
                </span>
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="border-none bg-primary">
            <td className="px-5 py-3.5 font-display text-[22px] text-primary-foreground/20">Σ</td>
            <td className="px-5 py-3.5">
              <div className="text-[15px] font-semibold text-primary-foreground/90">Grand Total</div>
              <div className="text-[12px] text-primary-foreground/30">{rows.length} agents</div>
            </td>
            <td className="hidden px-5 py-3.5 text-right text-[14px] font-bold text-primary-foreground md:table-cell">{fmt(totT)}</td>
            <td className="px-5 py-3.5 text-right text-[14px] font-bold text-emerald">{fmt(totM)}</td>
            <td className="hidden px-5 py-3.5 text-right text-[14px] font-bold text-red md:table-cell">{fmt(totV)}</td>
            <td className="px-5 py-3.5 text-right">
              <span className="inline-flex min-w-[56px] items-center justify-center rounded-md bg-primary-foreground/10 px-3 py-1 font-display text-[17px] tracking-wider text-gold-light">
                {rate}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default AgentLeaderboard;

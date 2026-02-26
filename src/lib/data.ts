// Sample data for the collections dashboard
export interface AgentData {
  name: string;
  phone: string;
  target: number;
  movement: number;
  variance?: number;
  rate?: number;
}

export const SAMPLE_AGENTS: AgentData[] = [
  { name: 'Agent 1', phone: '097-XXX-XXX', target: 80000, movement: 58115 },
  { name: 'Agent 2', phone: '076-XXX-XXX', target: 100000, movement: 41986 },
  { name: 'Agent 3', phone: '076-XXX-XXX', target: 60000, movement: 38819 },
  { name: 'Agent 4', phone: '097-XXX-XXX', target: 80000, movement: 24022 },
  { name: 'Agent 5', phone: '097-XXX-XXX', target: 80000, movement: 21943 },
  { name: 'Agent 6', phone: '076-XXX-XXX', target: 60000, movement: 7838 },
  { name: 'Agent 7', phone: '097-XXX-XXX', target: 60000, movement: 3629 },
  { name: 'Agent 8', phone: '076-XXX-XXX', target: 60000, movement: 1160 },
];

export interface MetricData {
  key: string;
  name: string;
  target: number;
  unit: string;
  lowerIsBetter: boolean;
  type: string;
  actual: number | null;
  jan: number | null;
  feb: number | null;
  mar: number | null;
}

export const METRICS_CONFIG: MetricData[] = [
  { key: 'col_excl', name: 'Collection Efficiency — Exclusive Arrears', target: 98, unit: '%', lowerIsBetter: false, type: 'Monthly', actual: 92, jan: 90, feb: 92, mar: null },
  { key: 'col_incl', name: 'Collection Efficiency — Inclusive of Arrears', target: 70, unit: '%', lowerIsBetter: false, type: 'Monthly', actual: 65, jan: 62, feb: 65, mar: null },
  { key: 'npl', name: 'NPL Ratio', target: 4, unit: '%', lowerIsBetter: true, type: 'Monthly', actual: 4.8, jan: 5.1, feb: 4.8, mar: null },
  { key: 'fid', name: 'FID Collections', target: 90, unit: '%', lowerIsBetter: false, type: 'Quarterly', actual: 85, jan: 82, feb: 85, mar: null },
  { key: 'par30', name: 'Portfolio at Risk (PAR >30)', target: 5.5, unit: '%', lowerIsBetter: true, type: 'Monthly', actual: 6.2, jan: 6.8, feb: 6.2, mar: null },
  { key: 'days_arr', name: 'Avg Days in Arrears', target: 90, unit: 'Days', lowerIsBetter: true, type: 'Monthly', actual: 78, jan: 85, feb: 78, mar: null },
  { key: 'days_del', name: 'Avg Days Delinquent (PAR >90)', target: 365, unit: 'Days', lowerIsBetter: true, type: 'Monthly', actual: 310, jan: 340, feb: 310, mar: null },
  { key: 'ddacc', name: 'DDACC Collection Rate', target: 70, unit: '%', lowerIsBetter: false, type: 'Monthly', actual: 58, jan: 52, feb: 58, mar: null },
];

export interface WeeklyData {
  week: string;
  start: string;
  end: string;
  target: number;
  actual: number | null;
}

export const WEEKLY_CONFIG: WeeklyData[] = [
  { week: 'Week 1', start: '05 Jan', end: '11 Jan', target: 15000, actual: 14200 },
  { week: 'Week 2', start: '12 Jan', end: '18 Jan', target: 15000, actual: 16800 },
  { week: 'Week 3', start: '19 Jan', end: '25 Jan', target: 15000, actual: 12500 },
  { week: 'Week 4', start: '26 Jan', end: '01 Feb', target: 15000, actual: null },
];

export interface MonthlyCounter {
  month: string;
  target: number;
  actual: number | null;
}

export const MONTHLY_COUNTER: MonthlyCounter[] = [
  { month: 'Jan 2026', target: 60000, actual: 43500 },
  { month: 'Feb 2026', target: 60000, actual: null },
  { month: 'Mar 2026', target: 60000, actual: null },
];

// Utility functions
export const fmt = (n: number) => Number(n).toLocaleString('en-ZM');
export const fmtK = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(2) + 'M' : n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K' : String(n);

export function getStatus(actual: number | null, target: number, lowerIsBetter: boolean): string {
  if (actual === null || actual === undefined || isNaN(actual)) return 'pending';
  if (lowerIsBetter) {
    const pct = actual / target;
    if (pct <= 1) return 'on-track';
    if (pct <= 1.15) return 'at-risk';
    return 'off-track';
  } else {
    const pct = actual / target;
    if (pct >= 1) return 'on-track';
    if (pct >= 0.85) return 'at-risk';
    return 'off-track';
  }
}

export function processAgents(data: AgentData[]) {
  const rows = [...data].sort((a, b) => b.movement - a.movement).map(r => ({
    ...r,
    variance: r.target - r.movement,
    rate: Math.round((r.movement / r.target) * 100),
  }));
  const totT = data.reduce((s, r) => s + r.target, 0);
  const totM = data.reduce((s, r) => s + r.movement, 0);
  const totV = totT - totM;
  const rate = Math.round((totM / totT) * 100);
  const maxM = rows[0]?.movement || 1;
  return { rows, totT, totM, totV, rate, maxM };
}

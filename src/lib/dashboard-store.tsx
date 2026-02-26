import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  SAMPLE_AGENTS, METRICS_CONFIG, WEEKLY_CONFIG, MONTHLY_COUNTER,
  type AgentData, type MetricData, type WeeklyData, type MonthlyCounter,
} from './data';

const STORAGE_KEYS = {
  agents: 'dash_agents',
  metrics: 'dash_metrics',
  weekly: 'dash_weekly',
  monthly: 'dash_monthly',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

interface DashboardState {
  agents: AgentData[];
  metrics: MetricData[];
  weekly: WeeklyData[];
  monthly: MonthlyCounter[];
  setAgents: (agents: AgentData[]) => void;
  setMetrics: (metrics: MetricData[]) => void;
  setWeekly: (weekly: WeeklyData[]) => void;
  setMonthly: (monthly: MonthlyCounter[]) => void;
  updateAgentTarget: (index: number, target: number) => void;
  updateMetricTarget: (key: string, target: number) => void;
  updateWeeklyTarget: (index: number, target: number) => void;
  updateMonthlyTarget: (index: number, target: number) => void;
}

const DashboardContext = createContext<DashboardState | null>(null);

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgentsRaw] = useState<AgentData[]>(() => loadFromStorage(STORAGE_KEYS.agents, SAMPLE_AGENTS));
  const [metrics, setMetricsRaw] = useState<MetricData[]>(() => loadFromStorage(STORAGE_KEYS.metrics, METRICS_CONFIG));
  const [weekly, setWeeklyRaw] = useState<WeeklyData[]>(() => loadFromStorage(STORAGE_KEYS.weekly, WEEKLY_CONFIG));
  const [monthly, setMonthlyRaw] = useState<MonthlyCounter[]>(() => loadFromStorage(STORAGE_KEYS.monthly, MONTHLY_COUNTER));

  // Persist on change
  useEffect(() => { saveToStorage(STORAGE_KEYS.agents, agents); }, [agents]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.metrics, metrics); }, [metrics]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.weekly, weekly); }, [weekly]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.monthly, monthly); }, [monthly]);

  const setAgents = useCallback((a: AgentData[]) => setAgentsRaw(a), []);
  const setMetrics = useCallback((m: MetricData[]) => setMetricsRaw(m), []);
  const setWeekly = useCallback((w: WeeklyData[]) => setWeeklyRaw(w), []);
  const setMonthly = useCallback((m: MonthlyCounter[]) => setMonthlyRaw(m), []);

  const updateAgentTarget = useCallback((index: number, target: number) => {
    setAgentsRaw(prev => prev.map((a, i) => i === index ? { ...a, target } : a));
  }, []);

  const updateMetricTarget = useCallback((key: string, target: number) => {
    setMetricsRaw(prev => prev.map(m => m.key === key ? { ...m, target } : m));
  }, []);

  const updateWeeklyTarget = useCallback((index: number, target: number) => {
    setWeeklyRaw(prev => prev.map((w, i) => i === index ? { ...w, target } : w));
  }, []);

  const updateMonthlyTarget = useCallback((index: number, target: number) => {
    setMonthlyRaw(prev => prev.map((m, i) => i === index ? { ...m, target } : m));
  }, []);

  return (
    <DashboardContext.Provider value={{
      agents, metrics, weekly, monthly,
      setAgents, setMetrics, setWeekly, setMonthly,
      updateAgentTarget, updateMetricTarget, updateWeeklyTarget, updateMonthlyTarget,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

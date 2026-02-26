import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  SAMPLE_AGENTS, METRICS_CONFIG, WEEKLY_CONFIG, MONTHLY_COUNTER,
  type AgentData, type MetricData, type WeeklyData, type MonthlyCounter,
} from './data';

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
  const [agents, setAgents] = useState<AgentData[]>(SAMPLE_AGENTS);
  const [metrics, setMetrics] = useState<MetricData[]>(METRICS_CONFIG);
  const [weekly, setWeekly] = useState<WeeklyData[]>(WEEKLY_CONFIG);
  const [monthly, setMonthly] = useState<MonthlyCounter[]>(MONTHLY_COUNTER);

  const updateAgentTarget = useCallback((index: number, target: number) => {
    setAgents(prev => prev.map((a, i) => i === index ? { ...a, target } : a));
  }, []);

  const updateMetricTarget = useCallback((key: string, target: number) => {
    setMetrics(prev => prev.map(m => m.key === key ? { ...m, target } : m));
  }, []);

  const updateWeeklyTarget = useCallback((index: number, target: number) => {
    setWeekly(prev => prev.map((w, i) => i === index ? { ...w, target } : w));
  }, []);

  const updateMonthlyTarget = useCallback((index: number, target: number) => {
    setMonthly(prev => prev.map((m, i) => i === index ? { ...m, target } : m));
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

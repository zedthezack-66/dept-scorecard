import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  SAMPLE_AGENTS, METRICS_CONFIG, WEEKLY_CONFIG, MONTHLY_COUNTER,
  type AgentData, type MetricData, type WeeklyData, type MonthlyCounter,
} from './data';
import { supabase } from '@/integrations/supabase/client';

interface DashboardState {
  agents: AgentData[];
  metrics: MetricData[];
  weekly: WeeklyData[];
  monthly: MonthlyCounter[];
  loading: boolean;
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

// DB helpers
async function fetchAgents(): Promise<AgentData[] | null> {
  const { data } = await supabase.from('agents').select('*').order('id');
  if (!data || data.length === 0) return null;
  return data.map(r => ({
    name: r.name,
    phone: r.phone,
    target: Number(r.target),
    movement: Number(r.movement),
    avgDaysArrears: Number(r.avg_days_arrears),
    count: r.count,
  }));
}

async function fetchMetrics(): Promise<MetricData[] | null> {
  const { data } = await supabase.from('metrics').select('*').order('id');
  if (!data || data.length === 0) return null;
  return data.map(r => ({
    key: r.key,
    name: r.name,
    target: Number(r.target),
    unit: r.unit,
    lowerIsBetter: r.lower_is_better,
    type: r.type,
    actual: r.actual != null ? Number(r.actual) : null,
    jan: r.jan != null ? Number(r.jan) : null,
    feb: r.feb != null ? Number(r.feb) : null,
    mar: r.mar != null ? Number(r.mar) : null,
  }));
}

async function fetchWeekly(): Promise<WeeklyData[] | null> {
  const { data } = await supabase.from('weekly').select('*').order('id');
  if (!data || data.length === 0) return null;
  return data.map(r => ({
    week: r.week,
    start: r.start_date,
    end: r.end_date,
    target: Number(r.target),
    actual: r.actual != null ? Number(r.actual) : null,
  }));
}

async function fetchMonthly(): Promise<MonthlyCounter[] | null> {
  const { data } = await supabase.from('monthly').select('*').order('id');
  if (!data || data.length === 0) return null;
  return data.map(r => ({
    month: r.month,
    target: Number(r.target),
    actual: r.actual != null ? Number(r.actual) : null,
  }));
}

// Save helpers — replace all rows
async function saveAgents(agents: AgentData[]) {
  await supabase.from('agents').delete().neq('id', 0); // delete all
  if (agents.length > 0) {
    await supabase.from('agents').insert(
      agents.map(a => ({
        name: a.name,
        phone: a.phone,
        target: a.target,
        movement: a.movement,
        avg_days_arrears: a.avgDaysArrears,
        count: a.count,
      }))
    );
  }
}

async function saveMetrics(metrics: MetricData[]) {
  await supabase.from('metrics').delete().neq('id', 0);
  if (metrics.length > 0) {
    await supabase.from('metrics').insert(
      metrics.map(m => ({
        key: m.key,
        name: m.name,
        target: m.target,
        unit: m.unit,
        lower_is_better: m.lowerIsBetter,
        type: m.type,
        actual: m.actual,
        jan: m.jan,
        feb: m.feb,
        mar: m.mar,
      }))
    );
  }
}

async function saveWeekly(weekly: WeeklyData[]) {
  await supabase.from('weekly').delete().neq('id', 0);
  if (weekly.length > 0) {
    await supabase.from('weekly').insert(
      weekly.map(w => ({
        week: w.week,
        start_date: w.start,
        end_date: w.end,
        target: w.target,
        actual: w.actual,
      }))
    );
  }
}

async function saveMonthly(monthly: MonthlyCounter[]) {
  await supabase.from('monthly').delete().neq('id', 0);
  if (monthly.length > 0) {
    await supabase.from('monthly').insert(
      monthly.map(m => ({
        month: m.month,
        target: m.target,
        actual: m.actual,
      }))
    );
  }
}

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgentsRaw] = useState<AgentData[]>(SAMPLE_AGENTS);
  const [metrics, setMetricsRaw] = useState<MetricData[]>(METRICS_CONFIG);
  const [weekly, setWeeklyRaw] = useState<WeeklyData[]>(WEEKLY_CONFIG);
  const [monthly, setMonthlyRaw] = useState<MonthlyCounter[]>(MONTHLY_COUNTER);
  const [loading, setLoading] = useState(true);

  // Load from DB on mount
  useEffect(() => {
    async function load() {
      try {
        const [a, m, w, mo] = await Promise.all([
          fetchAgents(), fetchMetrics(), fetchWeekly(), fetchMonthly(),
        ]);
        if (a) setAgentsRaw(a);
        if (m) setMetricsRaw(m);
        if (w) setWeeklyRaw(w);
        if (mo) setMonthlyRaw(mo);
      } catch (err) {
        console.error('Failed to load from database, using defaults', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Subscribe to realtime changes so all browsers update
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        fetchAgents().then(a => { if (a) setAgentsRaw(a); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metrics' }, () => {
        fetchMetrics().then(m => { if (m) setMetricsRaw(m); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly' }, () => {
        fetchWeekly().then(w => { if (w) setWeeklyRaw(w); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly' }, () => {
        fetchMonthly().then(mo => { if (mo) setMonthlyRaw(mo); });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const setAgents = useCallback((a: AgentData[]) => {
    setAgentsRaw(a);
    saveAgents(a);
  }, []);

  const setMetrics = useCallback((m: MetricData[]) => {
    setMetricsRaw(m);
    saveMetrics(m);
  }, []);

  const setWeekly = useCallback((w: WeeklyData[]) => {
    setWeeklyRaw(w);
    saveWeekly(w);
  }, []);

  const setMonthly = useCallback((m: MonthlyCounter[]) => {
    setMonthlyRaw(m);
    saveMonthly(m);
  }, []);

  const updateAgentTarget = useCallback((index: number, target: number) => {
    setAgentsRaw(prev => {
      const updated = prev.map((a, i) => i === index ? { ...a, target } : a);
      saveAgents(updated);
      return updated;
    });
  }, []);

  const updateMetricTarget = useCallback((key: string, target: number) => {
    setMetricsRaw(prev => {
      const updated = prev.map(m => m.key === key ? { ...m, target } : m);
      saveMetrics(updated);
      return updated;
    });
  }, []);

  const updateWeeklyTarget = useCallback((index: number, target: number) => {
    setWeeklyRaw(prev => {
      const updated = prev.map((w, i) => i === index ? { ...w, target } : w);
      saveWeekly(updated);
      return updated;
    });
  }, []);

  const updateMonthlyTarget = useCallback((index: number, target: number) => {
    setMonthlyRaw(prev => {
      const updated = prev.map((m, i) => i === index ? { ...m, target } : m);
      saveMonthly(updated);
      return updated;
    });
  }, []);

  return (
    <DashboardContext.Provider value={{
      agents, metrics, weekly, monthly, loading,
      setAgents, setMetrics, setWeekly, setMonthly,
      updateAgentTarget, updateMetricTarget, updateWeeklyTarget, updateMonthlyTarget,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

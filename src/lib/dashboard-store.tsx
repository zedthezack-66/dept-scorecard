import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  SAMPLE_AGENTS, METRICS_CONFIG, WEEKLY_CONFIG, MONTHLY_COUNTER,
  type AgentData, type MetricData, type WeeklyData, type MonthlyCounter,
} from './data';

interface DashboardState {
  agents: AgentData[];
  metrics: MetricData[];
  weekly: WeeklyData[];
  monthly: MonthlyCounter[];
  loading: boolean;
  setAgents: (agents: AgentData[]) => Promise<void>;
  setMetrics: (metrics: MetricData[]) => Promise<void>;
  setWeekly: (weekly: WeeklyData[]) => Promise<void>;
  setMonthly: (monthly: MonthlyCounter[]) => Promise<void>;
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

// DB row → app type mappers
function dbAgentToApp(r: any): AgentData {
  return {
    name: r.name,
    phone: r.phone,
    target: Number(r.target),
    movement: Number(r.movement),
    avgDaysArrears: Number(r.avg_days_arrears),
    count: Number(r.count),
  };
}

function dbMetricToApp(r: any): MetricData {
  return {
    key: r.key,
    name: r.name,
    target: Number(r.target),
    unit: r.unit,
    lowerIsBetter: r.lower_is_better,
    type: r.type,
    actual: r.actual !== null ? Number(r.actual) : null,
    jan: r.jan !== null ? Number(r.jan) : null,
    feb: r.feb !== null ? Number(r.feb) : null,
    mar: r.mar !== null ? Number(r.mar) : null,
  };
}

function dbWeeklyToApp(r: any): WeeklyData {
  return {
    week: r.week,
    start: r.start_date,
    end: r.end_date,
    target: Number(r.target),
    actual: r.actual !== null ? Number(r.actual) : null,
  };
}

function dbMonthlyToApp(r: any): MonthlyCounter {
  return {
    month: r.month,
    target: Number(r.target),
    actual: r.actual !== null ? Number(r.actual) : null,
  };
}

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgentsLocal] = useState<AgentData[]>(SAMPLE_AGENTS);
  const [metrics, setMetricsLocal] = useState<MetricData[]>(METRICS_CONFIG);
  const [weekly, setWeeklyLocal] = useState<WeeklyData[]>(WEEKLY_CONFIG);
  const [monthly, setMonthlyLocal] = useState<MonthlyCounter[]>(MONTHLY_COUNTER);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchAll = async () => {
      const [agentsRes, metricsRes, weeklyRes, monthlyRes] = await Promise.all([
        supabase.from('agents').select('*').order('id'),
        supabase.from('metrics').select('*').order('id'),
        supabase.from('weekly').select('*').order('id'),
        supabase.from('monthly').select('*').order('id'),
      ]);
      if (agentsRes.data?.length) setAgentsLocal(agentsRes.data.map(dbAgentToApp));
      if (metricsRes.data?.length) setMetricsLocal(metricsRes.data.map(dbMetricToApp));
      if (weeklyRes.data?.length) setWeeklyLocal(weeklyRes.data.map(dbWeeklyToApp));
      if (monthlyRes.data?.length) setMonthlyLocal(monthlyRes.data.map(dbMonthlyToApp));
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, async () => {
        const { data } = await supabase.from('agents').select('*').order('id');
        if (data?.length) setAgentsLocal(data.map(dbAgentToApp));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metrics' }, async () => {
        const { data } = await supabase.from('metrics').select('*').order('id');
        if (data?.length) setMetricsLocal(data.map(dbMetricToApp));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly' }, async () => {
        const { data } = await supabase.from('weekly').select('*').order('id');
        if (data?.length) setWeeklyLocal(data.map(dbWeeklyToApp));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly' }, async () => {
        const { data } = await supabase.from('monthly').select('*').order('id');
        if (data?.length) setMonthlyLocal(data.map(dbMonthlyToApp));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Write agents to Supabase (delete all + insert)
  const setAgents = useCallback(async (newAgents: AgentData[]) => {
    setAgentsLocal(newAgents); // optimistic
    await supabase.from('agents').delete().neq('id', 0); // delete all
    const rows = newAgents.map(a => ({
      name: a.name,
      phone: a.phone,
      target: a.target,
      movement: a.movement,
      avg_days_arrears: a.avgDaysArrears,
      count: a.count,
    }));
    await supabase.from('agents').insert(rows);
  }, []);

  // Write metrics to Supabase
  const setMetrics = useCallback(async (newMetrics: MetricData[]) => {
    setMetricsLocal(newMetrics);
    await supabase.from('metrics').delete().neq('id', 0);
    const rows = newMetrics.map(m => ({
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
    }));
    await supabase.from('metrics').insert(rows);
  }, []);

  // Write weekly to Supabase
  const setWeekly = useCallback(async (newWeekly: WeeklyData[]) => {
    setWeeklyLocal(newWeekly);
    await supabase.from('weekly').delete().neq('id', 0);
    const rows = newWeekly.map(w => ({
      week: w.week,
      start_date: w.start,
      end_date: w.end,
      target: w.target,
      actual: w.actual,
    }));
    await supabase.from('weekly').insert(rows);
  }, []);

  // Write monthly to Supabase
  const setMonthly = useCallback(async (newMonthly: MonthlyCounter[]) => {
    setMonthlyLocal(newMonthly);
    await supabase.from('monthly').delete().neq('id', 0);
    const rows = newMonthly.map(m => ({
      month: m.month,
      target: m.target,
      actual: m.actual,
    }));
    await supabase.from('monthly').insert(rows);
  }, []);

  // Target update helpers - update in Supabase via re-fetching IDs
  const updateAgentTarget = useCallback((index: number, target: number) => {
    setAgentsLocal(prev => {
      const updated = prev.map((a, i) => i === index ? { ...a, target } : a);
      // fire and forget DB update
      (async () => {
        const { data } = await supabase.from('agents').select('id').order('id');
        if (data?.[index]) {
          await supabase.from('agents').update({ target }).eq('id', data[index].id);
        }
      })();
      return updated;
    });
  }, []);

  const updateMetricTarget = useCallback((key: string, target: number) => {
    setMetricsLocal(prev => {
      const updated = prev.map(m => m.key === key ? { ...m, target } : m);
      (async () => {
        await supabase.from('metrics').update({ target }).eq('key', key);
      })();
      return updated;
    });
  }, []);

  const updateWeeklyTarget = useCallback((index: number, target: number) => {
    setWeeklyLocal(prev => {
      const updated = prev.map((w, i) => i === index ? { ...w, target } : w);
      (async () => {
        const { data } = await supabase.from('weekly').select('id').order('id');
        if (data?.[index]) {
          await supabase.from('weekly').update({ target }).eq('id', data[index].id);
        }
      })();
      return updated;
    });
  }, []);

  const updateMonthlyTarget = useCallback((index: number, target: number) => {
    setMonthlyLocal(prev => {
      const updated = prev.map((m, i) => i === index ? { ...m, target } : m);
      (async () => {
        const { data } = await supabase.from('monthly').select('id').order('id');
        if (data?.[index]) {
          await supabase.from('monthly').update({ target }).eq('id', data[index].id);
        }
      })();
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

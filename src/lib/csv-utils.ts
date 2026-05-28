import type { AgentData, MetricData, WeeklyData, MonthlyCounter, AgentCollectionData, AgentSettlementData, MonthKey } from './data';
import { METRICS_CONFIG, WEEKLY_CONFIG, MONTHLY_COUNTER, SAMPLE_AGENT_COLLECTIONS, SAMPLE_AGENT_SETTLEMENTS, MONTH_KEYS, MONTH_LABELS } from './data';


// ── CSV Generation ──

export function generateCollectionsTemplate(agents?: AgentData[]): string {
  const header = 'Name,Phone,Target,Movement,AvgDaysArrears,Count';
  const data = agents && agents.length > 0 ? agents : [
    { name: 'Agent 1', phone: '097-XXX-XXX', target: 80000, movement: 58115, avgDaysArrears: 45, count: 120 },
    { name: 'Agent 2', phone: '076-XXX-XXX', target: 100000, movement: 41986, avgDaysArrears: 62, count: 98 },
  ];
  const rows = data.map(a => [a.name, a.phone, a.target, a.movement, a.avgDaysArrears, a.count].join(','));
  return [header, ...rows].join('\n');
}

export function generateScorecardTemplate(
  metricsData?: MetricData[],
  weeklyData?: WeeklyData[],
  monthlyData?: MonthlyCounter[],
  agentCollectionsData?: AgentCollectionData[],
  agentSettlementsData?: AgentSettlementData[],
): string {
  const sections: string[] = [];

  const metrics = metricsData && metricsData.length > 0 ? metricsData : METRICS_CONFIG;
  const weekly = weeklyData && weeklyData.length > 0 ? weeklyData : WEEKLY_CONFIG;
  const monthly = monthlyData && monthlyData.length > 0 ? monthlyData : MONTHLY_COUNTER;
  const ac = agentCollectionsData && agentCollectionsData.length > 0 ? agentCollectionsData : SAMPLE_AGENT_COLLECTIONS;
  const as_ = agentSettlementsData && agentSettlementsData.length > 0 ? agentSettlementsData : SAMPLE_AGENT_SETTLEMENTS;

  // METRICS section — supports all 12 months
  sections.push('## METRICS');
  const monthHeaders = MONTH_KEYS.map(k => MONTH_LABELS[k]).join(',');
  sections.push(`Key,Name,Target,Unit,LowerIsBetter,Type,Actual,${monthHeaders}`);
  for (const m of metrics) {
    sections.push([
      m.key,
      m.name,
      m.target,
      m.unit,
      m.lowerIsBetter,
      m.type,
      m.actual ?? '',
      ...MONTH_KEYS.map(k => m[k] ?? ''),
    ].join(','));
  }


  // WEEKLY section — match default weekly rows
  sections.push('');
  sections.push('## WEEKLY');
  sections.push('Week,Start,End,Target,Actual');
  for (const w of weekly) {
    sections.push([w.week, w.start, w.end, w.target, w.actual ?? ''].join(','));
  }

  // MONTHLY section — match default monthly rows
  sections.push('');
  sections.push('## MONTHLY');
  sections.push('Month,Target,Actual');
  for (const m of monthly) {
  // AGENT COLLECTIONS section — supports all 12 months
  sections.push('');
  sections.push('## AGENT_COLLECTIONS');
  const agentMonthHeaders = MONTH_KEYS.map(k => `${MONTH_LABELS[k]}Actual`).join(',');
  sections.push(`AgentName,CollectionTarget,${agentMonthHeaders}`);
  for (const a of ac) {
    sections.push([a.agentName, a.collectionTarget, ...MONTH_KEYS.map(k => (a as any)[`${k}Actual`] ?? '')].join(','));
  }

  // AGENT SETTLEMENTS section — supports all 12 months
  sections.push('');
  sections.push('## AGENT_SETTLEMENTS');
  sections.push(`AgentName,SettlementTarget,${agentMonthHeaders}`);
  for (const a of as_) {
    sections.push([a.agentName, a.settlementTarget, ...MONTH_KEYS.map(k => (a as any)[`${k}Actual`] ?? '')].join(','));
  }

  }

  return sections.join('\n');
}

// ── CSV Parsing ──

function parseCsvLines(text: string): string[][] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('##'))
    .map(line => line.split(',').map(cell => cell.trim()));
}

export function parseCollectionsCsv(text: string): AgentData[] {
  const lines = parseCsvLines(text);
  const header = lines[0];
  const nameIdx = header.findIndex(h => /name/i.test(h));
  const phoneIdx = header.findIndex(h => /phone/i.test(h));
  const targetIdx = header.findIndex(h => /target/i.test(h));
  const movementIdx = header.findIndex(h => /movement/i.test(h));
  const arrearsIdx = header.findIndex(h => /arr/i.test(h));
  const countIdx = header.findIndex(h => /count/i.test(h));

  if (nameIdx === -1 || targetIdx === -1 || movementIdx === -1) {
    throw new Error('CSV must have Name, Target, and Movement columns');
  }

  return lines.slice(1).map(cols => ({
    name: cols[nameIdx] || 'Unknown',
    phone: cols[phoneIdx] || '',
    target: Number(cols[targetIdx]) || 0,
    movement: Number(cols[movementIdx]) || 0,
    avgDaysArrears: arrearsIdx !== -1 ? Number(cols[arrearsIdx]) || 0 : 0,
    count: countIdx !== -1 ? Number(cols[countIdx]) || 0 : 0,
  }));
}

export function parseScorecardCsv(text: string): {
  metrics: MetricData[];
  weekly: WeeklyData[];
  monthly: MonthlyCounter[];
  agentCollections: AgentCollectionData[];
  agentSettlements: AgentSettlementData[];
} {
  const sections = text.split(/^##\s*/m).filter(Boolean);
  const metrics: MetricData[] = [];
    if (sectionName.includes('AGENT_SETTLEMENT')) {
      const dataLines = parseCsvLines(lines.slice(1).join('\n'));
      if (dataLines.length < 2) continue;
      const header = dataLines[0].map(h => h.toLowerCase().trim());
      const monthIdx: Record<MonthKey, number> = {} as any;
      for (const mk of MONTH_KEYS) {
        monthIdx[mk] = header.findIndex(h => h === `${mk}actual` || h === `${MONTH_LABELS[mk].toLowerCase()}actual` || h === mk || h === MONTH_LABELS[mk].toLowerCase());
      }
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        const row: any = {
          agentName: c[0] || `Agent ${i}`,
          settlementTarget: Number(c[1]) || 50000,
        };
        for (const mk of MONTH_KEYS) {
          const idx = monthIdx[mk];
          row[`${mk}Actual`] = (idx >= 0 && c[idx] !== undefined && c[idx] !== '') ? Number(c[idx]) : null;
        }
        agentSettlements.push(row);
      }
    } else if (sectionName.includes('AGENT_COLLECTION')) {
      const dataLines = parseCsvLines(lines.slice(1).join('\n'));
      if (dataLines.length < 2) continue;
      const header = dataLines[0].map(h => h.toLowerCase().trim());
      const monthIdx: Record<MonthKey, number> = {} as any;
      for (const mk of MONTH_KEYS) {
        monthIdx[mk] = header.findIndex(h => h === `${mk}actual` || h === `${MONTH_LABELS[mk].toLowerCase()}actual` || h === mk || h === MONTH_LABELS[mk].toLowerCase());
      }
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        const row: any = {
          agentName: c[0] || `Agent ${i}`,
          collectionTarget: Number(c[1]) || 0,
        };
        for (const mk of MONTH_KEYS) {
          const idx = monthIdx[mk];
          row[`${mk}Actual`] = (idx >= 0 && c[idx] !== undefined && c[idx] !== '') ? Number(c[idx]) : null;
        }
        agentCollections.push(row);
      }
    } else if (sectionName.includes('METRIC')) {

      if (dataLines.length < 2) continue;
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        agentCollections.push({
          agentName: c[0] || `Agent ${i}`,
          collectionTarget: Number(c[1]) || 0,
          janActual: c[2] ? Number(c[2]) : null,
          febActual: c[3] ? Number(c[3]) : null,
          marActual: c[4] ? Number(c[4]) : null,
        });
      }
    } else if (sectionName.includes('METRIC')) {
      const dataLines = parseCsvLines(lines.slice(1).join('\n'));
      if (dataLines.length < 2) continue;
      const header = dataLines[0].map(h => h.toLowerCase().trim());
      const idx = (re: RegExp) => header.findIndex(h => re.test(h));
      const iKey = idx(/^key$/);
      const iName = idx(/^name$/);
      const iTarget = idx(/^target$/);
      const iUnit = idx(/^unit$/);
      const iLow = idx(/lower/);
      const iType = idx(/^type$/);
      const iActual = idx(/^actual$/);
      // Map each month key to its column index (header-name based)
      const monthIdx: Record<MonthKey, number> = {} as any;
      for (const mk of MONTH_KEYS) {
        monthIdx[mk] = header.findIndex(h => h === mk || h === MONTH_LABELS[mk].toLowerCase());
      }
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        const num = (i: number) => (i >= 0 && c[i] !== undefined && c[i] !== '') ? Number(c[i]) : null;
        const months: any = {};
        for (const mk of MONTH_KEYS) months[mk] = num(monthIdx[mk]);
        metrics.push({
          key: (iKey >= 0 ? c[iKey] : '') || `metric_${i}`,
          name: (iName >= 0 ? c[iName] : '') || '',
          target: Number(iTarget >= 0 ? c[iTarget] : 0) || 0,
          unit: (iUnit >= 0 ? c[iUnit] : '') || '%',
          lowerIsBetter: (iLow >= 0 ? c[iLow] : '')?.toLowerCase() === 'true',
          type: (iType >= 0 ? c[iType] : '') || 'Monthly',
          actual: num(iActual),
          ...months,
        });
      }

    } else if (sectionName.includes('WEEKLY')) {
      const dataLines = parseCsvLines(lines.slice(1).join('\n'));
      if (dataLines.length < 2) continue;
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        weekly.push({
          week: c[0] || `Week ${i}`,
          start: c[1] || '',
          end: c[2] || '',
          target: Number(c[3]) || 0,
          actual: c[4] ? Number(c[4]) : null,
        });
      }
    } else if (sectionName.includes('MONTHLY')) {
      const dataLines = parseCsvLines(lines.slice(1).join('\n'));
      if (dataLines.length < 2) continue;
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        monthly.push({
          month: c[0] || '',
          target: Number(c[1]) || 0,
          actual: c[2] ? Number(c[2]) : null,
        });
      }
    }
  }

  return { metrics, weekly, monthly, agentCollections, agentSettlements };
}

// ── Download helper ──

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

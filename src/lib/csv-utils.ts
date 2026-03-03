import type { AgentData, MetricData, WeeklyData, MonthlyCounter } from './data';
import { METRICS_CONFIG, WEEKLY_CONFIG, MONTHLY_COUNTER } from './data';

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
): string {
  const sections: string[] = [];

  const metrics = metricsData && metricsData.length > 0 ? metricsData : METRICS_CONFIG;
  const weekly = weeklyData && weeklyData.length > 0 ? weeklyData : WEEKLY_CONFIG;
  const monthly = monthlyData && monthlyData.length > 0 ? monthlyData : MONTHLY_COUNTER;

  // METRICS section
  sections.push('## METRICS');
  sections.push('Key,Name,Target,Unit,LowerIsBetter,Type,Actual,Jan,Feb,Mar');
  for (const m of metrics) {
    sections.push([
      m.key,
      m.name,
      m.target,
      m.unit,
      m.lowerIsBetter,
      m.type,
      m.actual ?? '',
      m.jan ?? '',
      m.feb ?? '',
      m.mar ?? '',
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
    sections.push([m.month, m.target, m.actual ?? ''].join(','));
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
} {
  const sections = text.split(/^##\s*/m).filter(Boolean);
  const metrics: MetricData[] = [];
  const weekly: WeeklyData[] = [];
  const monthly: MonthlyCounter[] = [];

  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
    const sectionName = lines[0].toUpperCase();

    if (sectionName.includes('METRIC')) {
      const dataLines = parseCsvLines(lines.slice(1).join('\n'));
      if (dataLines.length < 2) continue;
      for (let i = 1; i < dataLines.length; i++) {
        const c = dataLines[i];
        metrics.push({
          key: c[0] || `metric_${i}`,
          name: c[1] || '',
          target: Number(c[2]) || 0,
          unit: c[3] || '%',
          lowerIsBetter: c[4]?.toLowerCase() === 'true',
          type: c[5] || 'Monthly',
          actual: c[6] ? Number(c[6]) : null,
          jan: c[7] ? Number(c[7]) : null,
          feb: c[8] ? Number(c[8]) : null,
          mar: c[9] ? Number(c[9]) : null,
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

  return { metrics, weekly, monthly };
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

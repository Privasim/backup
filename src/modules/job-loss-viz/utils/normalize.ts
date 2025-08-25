// File: src/modules/job-loss-viz/utils/normalize.ts

export function toMonthStart(dateIso: string): string {
  // Accepts YYYY-MM or YYYY-MM-DD
  const [y, m] = dateIso.split('T')[0].split('-');
  if (!y || !m) throw new Error('Invalid date string, expected YYYY-MM or YYYY-MM-DD');
  return `${y}-${m}-01`;
}

export function sortAscByTs<T extends { ts: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

export function buildSeriesFromYtd(points: Array<{ date: string; ytd_global_ai_job_losses: number }>) {
  const series = points.map((p) => ({ ts: toMonthStart(p.date), value: p.ytd_global_ai_job_losses }));
  return sortAscByTs(series);
}

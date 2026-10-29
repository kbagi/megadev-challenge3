// #4471 split by problem. causes.ts files a report by its tenant; this reads what the report says
// happened, so a report that moved one day is not counted as a flipped month.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'shift'];

// What each problem looks like to the person who reported it.
export const SYMPTOM: Record<Problem, string> = {
  parser: 'day and month swapped (12/05 read as 5 December)',
  hint: 'day and month swapped, typed month first because the form told them to',
  shift: 'one day early, or a different day per time zone',
};

// `shiftIds`: reports the desk read as a one-day move (desk-notes.json). A day/month swap can't
// move a date by one day: 12 May flips to 5 December, never 11 May.
export function problemOf(r: Report, t: Tenant | undefined, shiftIds: readonly string[]): Problem | null {
  if (shiftIds.includes(r.id)) return 'shift';
  return causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  shiftIds: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), shiftIds) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

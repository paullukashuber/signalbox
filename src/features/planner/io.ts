import { sanitizePlan } from './model';
import type { LinePlan } from './types';

export type Done = Record<string, boolean>;
export type PlanFile = { plan: LinePlan; done: Done };

/** Keeps only `true` ticks with short string keys (storage and imports are untrusted). */
export function cleanDone(raw: unknown): Done {
  const out: Done = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    Object.entries(raw).slice(0, 5000).forEach(([k, v]) => { if (v === true && k.length <= 120) out[k] = true; });
  }
  return out;
}

/** JSON file content: the plan plus its ticks. */
export const planToJson = (plan: LinePlan, done: Done) => JSON.stringify({ ...plan, done }, null, 2);

/** Parses an exported file; null if it is not a valid plan. */
export function planFromJson(text: string): PlanFile | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  const plan = sanitizePlan(raw);
  return plan ? { plan, done: cleanDone((raw as { done?: unknown }).done) } : null;
}

/** File name for the export, e.g. “streckenplan-meine-strecke.json”. */
export function fileName(plan: LinePlan): string {
  const slug = plan.name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `streckenplan${slug ? '-' + slug : ''}.json`;
}

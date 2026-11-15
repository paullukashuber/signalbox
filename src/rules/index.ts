import { DE } from './de';
import type { RuleProfile } from './types';

export type * from './types';
export { DE };

/** Active rule profile. Only Germany exists so far. */
export const R: RuleProfile = DE;

/* ---------- derived distances ---------- */
/** Overlap behind the home signal for the entry speed. */
export const overlapFor = (vein: number, p: RuleProfile = R) => p.overlap.v.find((s) => vein > s.above)!.m;
/** Clearance marker distance behind the switch centre for gradient 1 : n. */
export const clearanceFor = (n: number, p: RuleProfile = R) => p.clearance.perGradient * n;
/** Whether a block of length L is short enough to carry the next distant on the main signal mast. */
export const distantOnMast = (L: number, bw: number, p: RuleProfile = R) => L <= p.distant.onMastFactor.v * bw;
/** Ne 6 distance before the halt. */
export const ne6Before = (bw: number, p: RuleProfile = R) => (bw >= p.boards.ne6.v.mainFrom ? p.boards.ne6.v.main : p.boards.ne6.v.branch);

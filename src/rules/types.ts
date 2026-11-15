import type { Tx } from '../i18n';

/** Line class; decides the braking distance. */
export type LineClass = 'haupt' | 'neben' | 'langsam';

/** A value that is a common planning figure, not checked against the rulebook. */
export type Guide<T> = { v: T; guide: true; note: Tx };

/** Overlap behind a main signal for entry speeds above `above` km/h. */
export type OverlapStep = { above: number; m: number };

export type SwitchType = { name: string; div: number; len: number };

/**
 * All placement rules of one country. Distances are metres, speeds km/h.
 * “before” values are measured against the direction of travel from the reference element.
 */
export interface RuleProfile {
  id: string;
  name: Tx;
  /** Braking distance per line class. */
  brake: Record<LineClass, number>;
  distant: {
    /** Ne 3 beacons before the distant signal, outermost first. */
    beacons: readonly [number, number, number];
    /** Shortening beyond this share of the braking distance must be marked. */
    shortenTol: number;
    /** Main signals carry the next distant on their mast while block ≤ factor × braking distance. */
    onMastFactor: Guide<number>;
    /** A distant signal is required above this speed within the braking distance; below, Ne 2 suffices. */
    requiredAbove: number;
  };
  /** PZB track magnets, metres before the reference signal. */
  pzb: { hz1000BeforeDistant: number; hz500BeforeMain: number; hz2000BeforeMain: number };
  /** Overlap by entry speed, highest step first; the last step is the fallback. */
  overlap: Guide<readonly OverlapStep[]>;
  block: {
    /** Minimum block length as a multiple of the braking distance. */
    minFactor: number;
    /** Typical spacing of multi-section signals. */
    typicalMulti: Guide<readonly [number, number]>;
  };
  /** Distances of boards and signs. Factors are multiples of the braking distance. */
  boards: {
    lf6Factor: number;
    lf1Factor: number;
    el1vFactor: number;
    el45: number;
    el2After: Guide<number>;
    bue2BeforeMonitor: number;
    bue1Factor: Guide<number>;
    bue4Before: Guide<number>;
    bue5Before: Guide<number>;
    /** Ne 6 before the halt; main lines use `main` when the braking distance is at least `mainFrom`. */
    ne6: Guide<{ main: number; branch: number; mainFrom: number }>;
    ne5BeforeExit: Guide<number>;
    markedMastsBefore: Guide<number>;
    ra10BeforeSwitch: Guide<number>;
  };
  clearance: {
    /** Clearance marker ≈ factor × switch gradient n behind the switch centre (3.50 m track spacing). */
    perGradient: number;
    /** Gap between a signal and the clearance marker behind it. */
    signalGap: Guide<number>;
  };
  speed: {
    /** Speed of Hp 2 without Zs 3. */
    hp2Default: number;
    /** Steps Hl signals can show. */
    hlSteps: readonly number[];
    /** EBO § 40 limits. */
    limits: { pzb: number; lzb: number; branch: number; branchNoTp: number; tpRequired: number; freight: number; freightBranch: number };
    /** Facing switches on the open line above this speed need signal protection; passenger trains need flank protection. */
    switchProtection: number;
  };
  switches: readonly SwitchType[];
  /** Curve speed v = √(r / k · (u + uf)), rounded down to `round`; radii rounded up to `radiusStep`. */
  curve: { k: number; round: number; radiusStep: number; ufDefault: Guide<number> };
}

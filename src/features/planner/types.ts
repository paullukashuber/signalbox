import type { Tx } from '../../i18n';
import type { LineClass } from '../../rules';
import type { BuildSys } from '../build/shared';

export type TrainControl = 'pzb' | 'lzb' | 'etcs';

/** Elements the player places along the line. Positions are metres from km 0 in the direction of travel. */
export type Station = { id: string; kind: 'bf'; name: string; from: number; to: number; vein: number; sw: number | null };
export type Halt = { id: string; kind: 'hpt'; name: string; at: number };
export type Junction = { id: string; kind: 'abzw'; name: string; at: number; sw: number };
export type Curve = { id: string; kind: 'curve'; from: number; to: number; r: number; u: number };
export type Crossing = { id: string; kind: 'bue'; at: number; secured: boolean };
export type SectionBreak = { id: string; kind: 'el'; at: number; type: 'schutz' | 'buegel'; len: number };
export type SlowZone = { id: string; kind: 'lf'; from: number; to: number; v: number };
export type PlanEl = Station | Halt | Junction | Curve | Crossing | SectionBreak | SlowZone;
export type ElKind = PlanEl['kind'];

export type LinePlan = {
  version: 1;
  name: string;
  cls: LineClass;
  vmax: number;
  sys: BuildSys;
  /** Game scale factor (game metres per real metre). */
  f: number;
  tc: TrainControl;
  /** Target block length for automatic block division. */
  block: number;
  /** Cant deficiency for curve speeds (mm). */
  uf: number;
  /** Switch gradient 1 : n for clearance markers. */
  n: number;
  electric: boolean;
  elements: PlanEl[];
};

export type PlacedItem = {
  /** Stable id (source element + role) so ticks survive edits. */
  id: string;
  m: number;
  game: number;
  part: string;
  name: Tx;
  /** What the signal shows / which number the board carries. */
  aspect?: Tx;
  /** Number shown on Lf boards and Zs 3 (speed / 10). */
  num?: number;
  /** The rule that placed it. */
  rule: Tx;
  /** Placed by a guide value, not a checked rule. */
  guide: boolean;
  /** Id of the plan element that caused it ('line' for line-wide items). */
  src: string;
  /** Part not in “My parts”. */
  missing?: boolean;
  /** Suggested replacement if the part is missing. */
  alt?: { part: string; text: Tx; owned: boolean };
};

export type WarningCode =
  | 'block-short' | 'distant-before-main' | 'curve-no-lf' | 'curve-too-tight' | 'speed-cab' | 'speed-max'
  | 'branch-speed' | 'before-start' | 'station-short' | 'overlap' | 'junction-in-station' | 'hl-step'
  | 'lf-not-slower' | 'not-electric' | 'missing-part';
export type Warning = { code: WarningCode; m?: number; src?: string; text: Tx };

export type PlanResult = { items: PlacedItem[]; warnings: Warning[] };

import type { FrameType, Geometry, Pt } from "./frames";

export type OpeningKind = "roller" | "sliding" | "personnel";
/** front = +Z gable, back = −Z gable, left = −X sidewall, right = +X sidewall. */
export type WallId = "front" | "back" | "left" | "right";

export interface Opening {
  id: string;
  kind: OpeningKind;
  wall: WallId;
  /** Centre of the opening along the wall: world X on gables, world Z on sidewalls. */
  at: number;
  /** Requested clear size; defaults to the kind's standard size. */
  width?: number;
  height?: number;
}

export interface ResolvedOpening extends Opening {
  width: number;
  height: number;
}

interface KindSpec {
  label: string;
  width: number;
  height: number;
  /** Allowed clear-opening range, [min, max] in metres. */
  widthRange: [number, number];
  heightRange: [number, number];
}

export const OPENING_KINDS: Record<OpeningKind, KindSpec> = {
  roller: { label: "Roller Shutter", width: 4, height: 4.5, widthRange: [2, 8], heightRange: [2.1, 6] },
  sliding: { label: "Sliding Door", width: 5, height: 4.5, widthRange: [2, 10], heightRange: [2.1, 7] },
  personnel: { label: "Personnel Door", width: 1, height: 2.1, widthRange: [0.8, 2], heightRange: [2, 2.6] },
};

export const WALLS: { id: WallId; label: string }[] = [
  { id: "front", label: "Front End" },
  { id: "back", label: "Back End" },
  { id: "left", label: "Left Side" },
  { id: "right", label: "Right Side" },
];

export const isGable = (w: WallId) => w === "front" || w === "back";

/** Clear gap kept between an opening and a column, and between two openings. */
const COLUMN_CLEAR = 0.42;
const DOOR_GAP = 0.3;
/** Minimum wall left above a door head for the header girt. */
const HEADER_ROOM = 0.6;

/** Height of the frame's top line (column tops and rafters) at cross-section X. */
export function frameTopAt(g: Geometry, x: number): number {
  const pts: Pt[] = [g.columnTops[0], ...g.rafters.map(([, e]) => e)];
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    if (x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1 || 1);
  }
  return pts[pts.length - 1][1];
}

export function wallRange(g: Geometry, wall: WallId): [number, number] {
  const h = isGable(wall) ? g.width / 2 : g.length / 2;
  return [-h, h];
}

/** Lowest point of the frame over [a, b] on a wall — the limit for a door head. */
function clearHeight(g: Geometry, wall: WallId, a: number, b: number): number {
  // Underside of the mezzanine deck beams, where a door would pass beneath a mezzanine.
  const under = (pred: (d: Geometry["mezzanines"][number]) => boolean) =>
    Math.min(Infinity, ...g.mezzanines.filter(pred).map((d) => d.y - 0.1));
  if (wall === "left") return Math.min(g.columnTops[0][1], under((d) => d.x1 <= -g.width / 2 + 0.01));
  if (wall === "right")
    return Math.min(g.columnTops[g.columnTops.length - 1][1], under((d) => d.x2 >= g.width / 2 - 0.01));
  let h = Math.min(frameTopAt(g, a), frameTopAt(g, b));
  g.rafters.forEach(([, e]) => {
    if (e[0] > a && e[0] < b) h = Math.min(h, e[1]);
  });
  h = Math.min(h, under((d) => a < d.x2 && b > d.x1));
  return h;
}

/** Zones on a wall where no opening may go: columns, and the X-braced end bays on sidewalls. */
function blockedZones(g: Geometry, wall: WallId): [number, number][] {
  if (isGable(wall))
    return [...g.columnXs, ...g.mezzanines.flatMap((d) => d.posts)].map((x) => [x - COLUMN_CLEAR, x + COLUMN_CLEAR]);
  const z = g.frameZs;
  const zones: [number, number][] = z.map((v) => [v - COLUMN_CLEAR, v + COLUMN_CLEAR]);
  zones.push([z[0], z[1]], [z[z.length - 2], z[z.length - 1]]);
  return zones;
}

/** Tallest door head that still leaves room for the header at this spot. */
export function maxOpeningHeight(g: Geometry, wall: WallId, at: number, width: number): number {
  return clearHeight(g, wall, at - width / 2, at + width / 2) - HEADER_ROOM;
}

/**
 * Size and place an opening on a wall as close to `desired` as the frame allows.
 * The height is trimmed to fit under the eave/rafter; the width is not.
 * Returns null when there is no free gap wide and tall enough.
 */
export function fitOpening(
  g: Geometry,
  wall: WallId,
  kind: OpeningKind,
  desired: number,
  others: ResolvedOpening[],
  size?: { width?: number; height?: number }
): { at: number; width: number; height: number } | null {
  const k = OPENING_KINDS[kind];
  const spec = { width: size?.width ?? k.width, height: size?.height ?? k.height };
  const [lo, hi] = wallRange(g, wall);
  const zones = blockedZones(g, wall);
  others
    .filter((o) => o.wall === wall)
    .forEach((o) => zones.push([o.at - o.width / 2 - DOOR_GAP, o.at + o.width / 2 + DOOR_GAP]));
  zones.sort((p, q) => p[0] - q[0]);

  // Free gaps between the merged blocked zones.
  const gaps: [number, number][] = [];
  let cur = lo;
  for (const [a, b] of zones) {
    if (a > cur) gaps.push([cur, Math.min(a, hi)]);
    cur = Math.max(cur, b);
  }
  if (cur < hi) gaps.push([cur, hi]);

  const minH = Math.min(spec.height, k.heightRange[0]);
  let best: { at: number; width: number; height: number } | null = null;
  for (const [a, b] of gaps) {
    if (b - a < spec.width) continue;
    const half = spec.width / 2;
    const at = Math.min(Math.max(desired, a + half), b - half);
    const height = Math.min(spec.height, clearHeight(g, wall, at - half, at + half) - HEADER_ROOM);
    if (height < minH) continue;
    const d = Math.abs(at - desired);
    const bestD = best ? Math.abs(best.at - desired) : Infinity;
    // Nearest spot wins; on a tie (e.g. either side of a mezzanine edge) take the taller door.
    if (!best || d < bestD - 0.01 || (Math.abs(d - bestD) <= 0.01 && height > best.height))
      best = { at: +at.toFixed(2), width: spec.width, height: +height.toFixed(2) };
  }
  return best;
}

/** Fit every opening to the current geometry, in order. Ones that no longer fit are skipped. */
export function resolveOpenings(g: Geometry, openings: Opening[]): ResolvedOpening[] {
  const out: ResolvedOpening[] = [];
  openings.forEach((o) => {
    const f = fitOpening(g, o.wall, o.kind, o.at, out, o);
    if (f) out.push({ ...o, ...f });
  });
  return out;
}

export function defaultOpenings(t: FrameType): Opening[] {
  const firstSpanCentre = t.spans > 1 ? -t.width / 2 + t.width / t.spans / 2 : 0;
  return [
    {
      id: "d-main",
      kind: t.features.crane ? "sliding" : "roller",
      wall: "front",
      at: firstSpanCentre,
    },
    { id: "d-walk", kind: "personnel", wall: "right", at: 0 },
  ];
}

export type Roof = "pitched" | "mono";
/** Mezzanine coverage on a single span: one half, or the full width. */
export type MezzSide = "left" | "right" | "full";

export type FeatureId =
  | "crane"
  | "mezzanine"
  | "skylight"
  | "ventilator"
  | "valley"
  | "canopy"
  | "insulation"
  | "rcc";

export type Features = Record<FeatureId, boolean>;

export const DEF_FEATURES: Features = {
  crane: false,
  mezzanine: false,
  skylight: false,
  ventilator: false,
  valley: false,
  canopy: false,
  insulation: false,
  rcc: false,
};

export const FEATURES: { id: FeatureId; label: string; color: string }[] = [
  { id: "crane", label: "EOT Crane", color: "#C026D3" },
  { id: "mezzanine", label: "Mezzanine Floor", color: "#7C3AED" },
  { id: "skylight", label: "Skylight Strips", color: "#38BDF8" },
  { id: "ventilator", label: "Ridge Ventilator", color: "#EF4444" },
  { id: "valley", label: "Valley Gutter", color: "#0369A1" },
  { id: "canopy", label: "Eave Canopy", color: "#8B5CF6" },
  { id: "insulation", label: "Roof Insulation", color: "#10B981" },
  { id: "rcc", label: "RCC Columns", color: "#78716C" },
];

export interface FrameType {
  id: string;
  name: string;
  sub: string;
  practical: string;
  width: number;
  eave: number;
  pitch: number;
  spans: 1 | 2 | 3;
  bays: number;
  baySpacing: number;
  roof: Roof;
  features: Partial<Features>;
  desc: string;
}

export const FRAME_TYPES: FrameType[] = [
  {
    id: "cs-p",
    name: "Clear Span",
    sub: "Pitched Roof",
    practical: "6m – 70m",
    width: 30,
    eave: 7,
    pitch: 10,
    spans: 1,
    bays: 5,
    baySpacing: 6,
    roof: "pitched",
    features: {},
    desc: "Single bay with no intermediate columns. Symmetric pitched roof — the most common PEB frame for warehouses, hangars and sports halls.",
  },
  {
    id: "cs-m",
    name: "Clear Span",
    sub: "Mono Slope",
    practical: "3m – 18m",
    width: 15,
    eave: 6,
    pitch: 8,
    spans: 1,
    bays: 4,
    baySpacing: 6,
    roof: "mono",
    features: {},
    desc: "Single-slope roof draining to one side. Ideal for lean-to sheds, loading dock covers and small industrial buildings.",
  },
  {
    id: "ms2-p",
    name: "Multi Span MS-2",
    sub: "Pitched Roof",
    practical: "24m – 45m",
    width: 36,
    eave: 7,
    pitch: 10,
    spans: 2,
    bays: 5,
    baySpacing: 7.5,
    roof: "pitched",
    features: {},
    desc: "Two bays with one intermediate column line. Two mirrored pitched spans — efficient for medium to large warehouses.",
  },
  {
    id: "ms2-m",
    name: "Multi Span MS-2",
    sub: "Mono Slope",
    practical: "20m – 35m",
    width: 28,
    eave: 7,
    pitch: 6,
    spans: 2,
    bays: 5,
    baySpacing: 6,
    roof: "mono",
    features: {},
    desc: "Two mono-slope bays with one intermediate column. Used for loading yards, bus terminals and large industrial sheds.",
  },
  {
    id: "ms3-p",
    name: "Multi Span MS-3",
    sub: "Pitched Roof",
    practical: "36m – 72m",
    width: 48,
    eave: 7,
    pitch: 10,
    spans: 3,
    bays: 6,
    baySpacing: 7.5,
    roof: "pitched",
    features: {},
    desc: "Three bays with two intermediate column lines. The most economical frame for very wide industrial buildings up to 72m.",
  },
  {
    id: "ms3-m",
    name: "Multi Span MS-3",
    sub: "Mono + Valley Gutter",
    practical: "24m – 60m",
    width: 42,
    eave: 7,
    pitch: 5,
    spans: 3,
    bays: 5,
    baySpacing: 7.5,
    roof: "mono",
    features: { valley: true },
    desc: "Three mono-slope bays with valley gutters at the intermediate columns. Suited to large-footprint factories and process plants.",
  },
  {
    id: "ms2-cr",
    name: "MS-2 + Crane",
    sub: "EOT Crane & Mezzanine",
    practical: "24m – 45m",
    width: 36,
    eave: 10,
    pitch: 10,
    spans: 2,
    bays: 5,
    baySpacing: 7.5,
    roof: "pitched",
    features: { crane: true, mezzanine: true },
    desc: "Heavy industrial frame: EOT crane rail on corbels in the first bay, mezzanine floor in the second. Requires vibration-rated fasteners.",
  },
  {
    id: "ss-rcc",
    name: "Single Span",
    sub: "RCC Column System",
    practical: "5m – 25m",
    width: 18,
    eave: 5.5,
    pitch: 8,
    spans: 1,
    bays: 4,
    baySpacing: 6,
    roof: "pitched",
    features: { rcc: true },
    desc: "Steel rafter system seated on reinforced-concrete columns — common for roof replacement and extensions on existing RCC structures.",
  },
];

export type PartId =
  | "column"
  | "rafter"
  | "purlin"
  | "girt"
  | "roof-sheet"
  | "cladding"
  | "bracing"
  | "base"
  | "ridge"
  | "crane"
  | "mezzanine"
  | "skylight"
  | "ventilator"
  | "valley"
  | "canopy"
  | "insulation"
  | "rcc"
  | "door";

export interface PartInfo {
  title: string;
  cat: "Structural Member" | "Roofing Component" | "Accessory";
  detail: string;
  products: string[];
}

export const PART_INFO: Record<PartId, PartInfo> = {
  column: {
    title: "Primary Steel Column",
    cat: "Structural Member",
    detail:
      "Tapered built-up I-section column. Transfers roof, wind and crane loads down to the foundation through the base plate.",
    products: ["Column Base Plate Bolts", "Anchor Bolts", "Structural Fasteners"],
  },
  rafter: {
    title: "Steel Rafter",
    cat: "Structural Member",
    detail:
      "Haunched built-up I-section rafter — the primary inclined member running from column top to ridge, deepest at the knee joint.",
    products: ["Haunch Bolts", "Splice Plate Fasteners", "Structural Fasteners"],
  },
  purlin: {
    title: "Z-Purlin (Secondary)",
    cat: "Structural Member",
    detail:
      "Cold-formed Z or C purlins spanning between frames, supporting the roof sheeting and transferring loads into the rafters.",
    products: ["Purlin Cleat Bolts", "Self-Drilling Screws", "Sag Rod Sets"],
  },
  girt: {
    title: "Wall Girt (Secondary)",
    cat: "Structural Member",
    detail:
      "Horizontal cold-formed members on the side and end walls that support the wall cladding against wind pressure.",
    products: ["Girt Cleat Bolts", "Self-Drilling Screws"],
  },
  "roof-sheet": {
    title: "Roof Sheeting",
    cat: "Roofing Component",
    detail:
      "Trapezoidal or standing-seam (SSR) metal panels forming the primary weatherproofing layer over the purlins.",
    products: ["Fixed SSR Clips", "Sliding SSR Clips", "Ridge Foam Closers", "Eave Foam Closers"],
  },
  cladding: {
    title: "Wall Cladding",
    cat: "Roofing Component",
    detail:
      "Profiled metal wall sheeting fixed to the girts, running from eave level down to finished floor level.",
    products: ["Wall Cladding Screws", "Base Trim Closers", "Corner Flashing Fasteners"],
  },
  bracing: {
    title: "Roof & Wall Bracing",
    cat: "Structural Member",
    detail:
      "Cross-braced rods or angles in the end bays that carry longitudinal wind loads and stabilise the frame during erection.",
    products: ["Bracing Rod Assemblies", "Turnbuckles", "Hillside Washers"],
  },
  base: {
    title: "Base Plate & Foundation",
    cat: "Structural Member",
    detail:
      "Welded base plate grouted onto the RCC pedestal and held with cast-in anchor bolts to develop the column reaction.",
    products: ["Anchor Bolts", "Levelling Nuts", "Base Plate Grout Kit"],
  },
  ridge: {
    title: "Ridge Assembly",
    cat: "Roofing Component",
    detail:
      "Apex splice plate connection plus ridge cap and foam closers that seal the crown of the pitched roof.",
    products: ["Ridge Foam Closers", "Ridge Cap Fasteners", "Apex Bolts"],
  },
  crane: {
    title: "EOT Crane & Rail",
    cat: "Accessory",
    detail:
      "Electric overhead travelling crane running on rails carried by bracket corbels welded to the columns. Vibration-rated fixings are mandatory.",
    products: ["Vibration-Rated SSR Clips", "Crane Bracket Bolts", "Anti-Vibration Fasteners"],
  },
  mezzanine: {
    title: "Mezzanine Floor",
    cat: "Accessory",
    detail:
      "Free-standing steel floor over part of the building — main beams on its own post grid, with a guardrail and stair along the open edge. On a single span it typically covers one half, leaving the other half full-height.",
    products: [
      "Mezzanine Beam Anchor Bolts",
      "Grating Fasteners",
      "Deck Screws",
      "Handrail Base Plate Bolts",
      "Stair Stringer Bolts",
    ],
  },
  skylight: {
    title: "Skylight Strips",
    cat: "Roofing Component",
    detail:
      "Translucent polycarbonate or FRP panels laid in the same profile as the roof sheets for natural daylighting.",
    products: ["Skylight Foam Closers", "Skylight Fasteners", "Sealing Washers"],
  },
  ventilator: {
    title: "Ridge Ventilator",
    cat: "Accessory",
    detail:
      "Continuous or turbine ventilators at the ridge that exhaust hot air by stack effect without mechanical power.",
    products: ["Ridge Vent Foam Closers", "Ventilator Fasteners"],
  },
  valley: {
    title: "Valley Gutter",
    cat: "Roofing Component",
    detail:
      "Internal gutter at the junction of two roof slopes over the intermediate column line, draining to downpipes at each end.",
    products: ["Valley Gutter Brackets", "Valley Foam Closers", "Gutter Sealant Kit"],
  },
  canopy: {
    title: "Eave Canopy",
    cat: "Accessory",
    detail:
      "Cantilevered roof extension at the eave that shelters loading bays and personnel doors from rain and sun.",
    products: ["Canopy SSR Clips", "Eave Gutter Brackets", "Canopy Fasteners"],
  },
  insulation: {
    title: "Roof Insulation",
    cat: "Roofing Component",
    detail:
      "Glass-wool or PUF insulation laid between the purlins and the roof sheeting to cut heat gain and condensation.",
    products: ["Insulated Ridge Closers", "Insulation Valley Strips", "Extended Fasteners"],
  },
  rcc: {
    title: "R.C.C. Column",
    cat: "Structural Member",
    detail:
      "Reinforced concrete column supporting the steel rafter — used where an existing concrete structure is being re-roofed or extended.",
    products: ["Column Base Plate Bolts", "Chemical Anchors", "RCC Interface Fasteners"],
  },
  door: {
    title: "Framed Opening & Door",
    cat: "Accessory",
    detail:
      "Roller shutter, sliding or personnel door set in a framed opening — cold-formed jambs carry a header girt, and the wall girts are cut and cleated to the jambs.",
    products: ["Door Jamb Cleat Bolts", "Header Girt Fasteners", "Flashing & Trim Screws", "Anchor Bolts"],
  },
};

/** Pointer travel (px) beyond which a click is treated as an orbit drag, not a selection. */
export const DRAG_PX = 5;

export const COLORS = {
  primary: "#C62828",
  primaryDark: "#8E1414",
  secondary: "#64748B",
  roof: "#8FA6BC",
  cladding: "#DDE3EA",
  bracing: "#F59E0B",
  concrete: "#A8A29E",
  crane: "#C026D3",
  mezzanine: "#7C3AED",
  skylight: "#7DD3FC",
  vent: "#EF4444",
  valley: "#0369A1",
  canopy: "#8B5CF6",
  insulation: "#10B981",
};

export interface Config {
  width: number;
  eave: number;
  pitch: number;
  spans: 1 | 2 | 3;
  bays: number;
  baySpacing: number;
  roof: Roof;
  features: Features;
  /** Single span: which half (or full width) carries the mezzanine. */
  mezzSide?: MezzSide;
  /** Multi-span: indices of the spans (0 = left) that carry a mezzanine. Defaults to the last span. */
  mezzSpans?: number[];
  /** Multi-span: indices of the spans with an EOT crane. Defaults to the first span. */
  craneSpans?: number[];
}

/** An EOT crane running on its own runway between two column lines. */
export interface CraneBay {
  x1: number;
  x2: number;
  /** Hook position across the bay, and the deck it must stop above (if any). */
  hook: { x: number; deck: MezzDeck | null };
}

/** One continuous mezzanine deck. Adjacent selected spans merge into a single deck. */
export interface MezzDeck {
  x1: number;
  x2: number;
  /** Deck level. */
  y: number;
  /** X of each free-standing post line (main column lines excluded). */
  posts: number[];
  /** Edges facing open floor rather than an outer wall — these get guardrails and the stair. */
  openL: boolean;
  openR: boolean;
}

export type Pt = [number, number];

export interface Geometry {
  width: number;
  length: number;
  eave: number;
  spanWidth: number;
  columnXs: number[];
  /** Top-of-column point for each column line (cross-section). */
  columnTops: Pt[];
  /** Rafter segments as [start, end] pairs in the cross-section plane. */
  rafters: [Pt, Pt][];
  /** Apex points for pitched roofs. */
  apexes: Pt[];
  /** Full frame outline used to extrude gable end walls. */
  profile: Pt[];
  frameZs: number[];
  ridgeHeight: number;
  maxHeight: number;
  /** Mezzanine decks, left to right; empty when the mezzanine is off. */
  mezzanines: MezzDeck[];
  /** Crane bays, left to right; empty when the crane is off. */
  cranes: CraneBay[];
}

/** Crane rail level for a given eave height. */
export const craneRailY = (eave: number) => Math.max(2.5, eave - 2.2);

export function computeGeometry(c: Config): Geometry {
  const { width, eave, pitch, spans, roof } = c;
  const length = c.bays * c.baySpacing;
  const half = width / 2;
  const spanWidth = width / spans;
  const rad = (pitch * Math.PI) / 180;
  const columnXs = Array.from({ length: spans + 1 }, (_, i) => -half + spanWidth * i);

  const columnTops: Pt[] =
    roof === "pitched"
      ? columnXs.map((x) => [x, eave] as Pt)
      : columnXs.map((x, i) => [x, eave + spanWidth * Math.tan(rad) * (spans - i)] as Pt);

  const rafters: [Pt, Pt][] = [];
  const apexes: Pt[] = [];
  for (let i = 0; i < spans; i++) {
    const a = columnTops[i];
    const b = columnTops[i + 1];
    if (roof === "pitched") {
      const apex: Pt = [(a[0] + b[0]) / 2, eave + (spanWidth / 2) * Math.tan(rad)];
      apexes.push(apex);
      rafters.push([a, apex], [apex, b]);
    } else {
      rafters.push([a, b]);
    }
  }

  const profile: Pt[] = [[columnXs[0], 0]];
  profile.push(columnTops[0]);
  rafters.forEach(([, end]) => profile.push(end));
  profile.push([columnXs[spans], 0]);

  const frameZs = Array.from(
    { length: c.bays + 1 },
    (_, i) => -length / 2 + c.baySpacing * i
  );

  const maxHeight = Math.max(...profile.map((p) => p[1]));

  // Crane runways: one per selected span (a single span is always fully covered).
  const craneRanges: [number, number][] = c.features.crane
    ? craneSpansFor(spans, c.craneSpans).map((i) => [columnXs[i], columnXs[i + 1]])
    : [];

  const mezzanines: MezzDeck[] = [];
  if (c.features.mezzanine) {
    let ranges: [number, number][];
    if (spans === 1) {
      const side = c.mezzSide ?? "right";
      ranges = [side === "full" ? [-half, half] : side === "left" ? [-half, 0] : [0, half]];
    } else {
      const picked = mezzSpansFor(spans, c.mezzSpans);
      // Merge runs of adjacent spans into one deck.
      ranges = [];
      picked.forEach((i) => {
        const last = ranges[ranges.length - 1];
        if (last && Math.abs(last[1] - columnXs[i]) < 0.01) last[1] = columnXs[i + 1];
        else ranges.push([columnXs[i], columnXs[i + 1]]);
      });
    }
    const onColumn = (x: number) => columnXs.some((cx) => Math.abs(cx - x) < 0.3);
    ranges.forEach(([x1, x2]) => {
      // Keep the deck and its guardrail clear of the crane bridge when they share a crane bay.
      const underCrane = craneRanges.some(([a, b]) => x1 < b - 0.01 && x2 > a + 0.01);
      const y = Math.min(eave - 1.5, 4.2, underCrane ? Math.max(2.4, craneRailY(eave) - 1.9) : Infinity);
      // Free-standing posts at most 6 m apart within each span, skipping main column lines.
      const stops = [x1, ...columnXs.filter((cx) => cx > x1 + 0.3 && cx < x2 - 0.3), x2];
      const posts: number[] = [];
      for (let i = 0; i < stops.length - 1; i++) {
        const [a, b] = [stops[i], stops[i + 1]];
        const n = Math.max(1, Math.ceil((b - a) / 6));
        for (let k = 0; k <= n; k++) {
          const x = a + ((b - a) * k) / n;
          if (!onColumn(x) && !posts.some((p) => Math.abs(p - x) < 0.3)) posts.push(x);
        }
      }
      mezzanines.push({ x1, x2, y, posts, openL: x1 > -half + 0.01, openR: x2 < half - 0.01 });
    });
  }
  const ridgeHeight =
    roof === "pitched" ? (spanWidth / 2) * Math.tan(rad) : width * Math.tan(rad);

  return {
    width,
    length,
    eave,
    spanWidth,
    columnXs,
    columnTops,
    rafters,
    apexes,
    profile,
    frameZs,
    ridgeHeight: +ridgeHeight.toFixed(1),
    maxHeight,
    mezzanines,
    cranes: craneRanges.map(([x1, x2]) => ({ x1, x2, hook: craneHook(x1, x2, mezzanines) })),
  };
}

/** Selected spans: valid, unique, sorted, never empty (falls back to `fallback`). */
function spanPick(spans: number, picked: number[] | undefined, fallback: number): number[] {
  const list = Array.from(new Set((picked ?? []).filter((i) => i >= 0 && i < spans))).sort((a, b) => a - b);
  return list.length ? list : [fallback];
}

/** Toggle one span in a selection, keeping at least one span selected. */
function toggleSpan(cur: number[], i: number): number[] {
  if (cur.includes(i)) return cur.length > 1 ? cur.filter((x) => x !== i) : cur;
  return [...cur, i].sort((a, b) => a - b);
}

/** The spans carrying an EOT crane: valid, sorted, never empty (defaults to the first span). */
export const craneSpansFor = (spans: number, picked?: number[]) => spanPick(spans, picked, 0);

/** Toggle one span's crane, keeping at least one span selected. */
export const toggleCraneSpan = (spans: number, picked: number[] | undefined, i: number) =>
  toggleSpan(craneSpansFor(spans, picked), i);

/** Short name of the crane coverage, e.g. "Full Span", "Span 1 + 3", "All Spans". */
export function craneLabel(g: Geometry): string {
  const spans = g.columnXs.length - 1;
  if (spans === 1) return g.cranes.length ? "Full Span" : "";
  const idx = g.columnXs.slice(0, -1).flatMap((x, i) => (g.cranes.some((c) => Math.abs(c.x1 - x) < 0.01) ? [i] : []));
  return idx.length === spans ? "All Spans" : `Span ${idx.map((i) => i + 1).join(" + ")}`;
}

/** One-line summary of the cranes: rail level, how many runways and their spans. */
export function craneNote(g: Geometry): string {
  if (!g.cranes.length) return "";
  const n = g.cranes.length;
  let t = `Rail at ${craneRailY(g.eave).toFixed(1)} m · ${n} crane${n > 1 ? "s" : ""}, ${g.cranes
    .map((c) => `${(c.x2 - c.x1).toFixed(0)} m span`)
    .join(" + ")}`;
  if (g.cranes.some((c) => c.hook.deck)) t += " · hook stops above mezzanine";
  return t;
}

/** The spans carrying a mezzanine on a multi-span frame: valid, sorted, never empty (defaults to the last span). */
export const mezzSpansFor = (spans: number, picked?: number[]) => spanPick(spans, picked, spans - 1);

/** Toggle one span's mezzanine, keeping at least one span selected. */
export const toggleMezzSpan = (spans: number, picked: number[] | undefined, i: number) =>
  toggleSpan(mezzSpansFor(spans, picked), i);

/** One-line summary of the mezzanine: deck level(s), area and how it is reached. */
export function mezzNote(g: Geometry, spans: number, side?: MezzSide): string {
  if (!g.mezzanines.length) return "";
  const ys = Array.from(new Set(g.mezzanines.map((d) => d.y.toFixed(1))));
  let t = `Deck at ${ys.join(" / ")} m · ${mezzArea(g).toLocaleString()} m²`;
  if (g.mezzanines.length > 1) t += ` · ${g.mezzanines.length} separate decks`;
  if (spans === 1 && side !== "full") t += " · other half stays full-height";
  if (g.mezzanines.some((d) => !d.openL && !d.openR)) t += " · stairwell access";
  return t;
}

/** Short name of the mezzanine coverage, e.g. "Right Half", "Span 1 + 3", "All Spans". */
export function mezzLabel(g: Geometry): string {
  const spans = g.columnXs.length - 1;
  if (spans === 1) {
    const d = g.mezzanines[0];
    if (!d) return "";
    return !d.openL && !d.openR ? "Full Width" : d.openL ? "Right Half" : "Left Half";
  }
  const idx = Array.from({ length: spans }, (_, i) => i).filter((i) =>
    g.mezzanines.some((d) => g.columnXs[i] >= d.x1 - 0.01 && g.columnXs[i + 1] <= d.x2 + 0.01)
  );
  return idx.length === spans ? "All Spans" : `Span ${idx.map((i) => i + 1).join(" + ")}`;
}

/** Total mezzanine floor area (m²). */
export const mezzArea = (g: Geometry) =>
  Math.round(g.mezzanines.reduce((t, d) => t + (d.x2 - d.x1) * g.length, 0));

/**
 * Where a crane's hook hangs across its bay [cL, cR]: over the widest stretch of floor not
 * covered by a mezzanine, or mid-bay if the bay is covered (then it stops above that deck).
 */
function craneHook(cL: number, cR: number, decks: MezzDeck[]): CraneBay["hook"] {
  let free: [number, number][] = [[cL, cR]];
  decks.forEach((d) => {
    free = free.flatMap(([a, b]): [number, number][] =>
      d.x2 <= a || d.x1 >= b
        ? [[a, b]]
        : ([
            [a, Math.max(a, d.x1)],
            [Math.min(b, d.x2), b],
          ] as [number, number][]).filter(([p, q]) => q - p > 0.01)
    );
  });
  const widest = [...free].sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
  const x = widest && widest[1] - widest[0] > 2 ? (widest[0] + widest[1]) / 2 : (cL + cR) / 2;
  return { x, deck: decks.find((d) => x > d.x1 && x < d.x2) ?? null };
}

/** Evenly spaced points along a cross-section segment, excluding both ends. */
export function along(a: Pt, b: Pt, spacing: number): Pt[] {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.round(len / spacing));
  const out: Pt[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

export function productsFor(c: Config, openingCount = 0): string[] {
  const base =
    c.roof === "pitched"
      ? ["Fixed SSR Clips", "Sliding SSR Clips", "Ridge Foam Closers", "Eave Foam Closers"]
      : ["Sliding SSR Clips", "Eave Foam Closers", "Hip Closers"];
  if (c.spans > 1 && c.roof === "pitched") base.push("Valley Foam Closers");
  base.push("Purlin Cleat Bolts", "Structural Fasteners", "Self-Drilling Screws");
  FEATURES.forEach((f) => {
    if (c.features[f.id]) base.push(...PART_INFO[f.id as PartId].products);
  });
  if (openingCount > 0) base.push(...PART_INFO.door.products);
  return Array.from(new Set(base));
}

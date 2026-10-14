"use client";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  COLORS,
  DRAG_PX,
  along,
  computeGeometry,
  craneRailY,
  type MezzDeck,
  type Config,
  type PartId,
  type Pt,
} from "./frames";
import Entrance from "./Entrance";
import { isGable, type ResolvedOpening, type WallId } from "./openings";

export type ViewMode = "solid" | "xray" | "frame" | "wire";

interface ViewState {
  mode: ViewMode;
  selected: PartId | null;
  select: (p: PartId) => void;
  explode: number;
  shadows: boolean;
}
const ViewCtx = createContext<ViewState>({
  mode: "solid",
  selected: null,
  select: () => {},
  explode: 0,
  shadows: false,
});
const useView = () => useContext(ViewCtx);

const X_AXIS = new THREE.Vector3(1, 0, 0);
const MESH_RAYCAST = THREE.Mesh.prototype.raycast;
const NO_RAYCAST = () => null;
type V3 = [number, number, number];

/** Wall cladding sits outside the column flanges: inner face, thickness, outer face. */
const WALL_IN = 0.37;
const WALL_T = 0.12;
const WALL_OUT = WALL_IN + WALL_T;
/** Roof sheet centre-line above the rafter centre-line, and its overhang past the eave. */
const SHEET_LIFT = 0.66;
const EAVE_OVERHANG = 0.8;

/**
 * Profiled-sheet rib pattern, four ribs per metre. Used as both colour and bump map.
 * `across` puts the ribs across V instead of U.
 */
function ribTexture(across: boolean, repeatV = 1) {
  const n = 128;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  for (let i = 0; i < n; i++) {
    const t = (i % 32) / 32;
    // Trapezoidal profile: flat pan, sloped web, narrow raised rib.
    const v = t < 0.55 ? 0.35 : t < 0.68 ? 0.35 + ((t - 0.55) / 0.13) * 0.65 : t < 0.87 ? 1 : 1 - ((t - 0.87) / 0.13) * 0.65;
    const k = Math.round(196 + v * 59);
    ctx.fillStyle = `rgb(${k},${k},${k})`;
    if (across) ctx.fillRect(0, i, n, 1);
    else ctx.fillRect(i, 0, 1, n);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, repeatV);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Mat({
  color,
  opacity = 1,
  part,
  map,
  roughness = 0.5,
  metalness = 0.35,
}: {
  color: string;
  opacity?: number;
  part: PartId;
  map?: THREE.Texture;
  roughness?: number;
  metalness?: number;
}) {
  const { mode, selected } = useView();
  const on = selected === part;
  const o = mode === "wire" ? 1 : opacity;
  const tex = mode === "wire" ? undefined : map;
  return (
    <meshStandardMaterial
      key={tex ? "tex" : "plain"}
      color={on ? "#F97316" : color}
      emissive={on ? "#F97316" : "#000000"}
      emissiveIntensity={on ? 0.45 : 0}
      map={tex}
      bumpMap={tex}
      bumpScale={0.6}
      transparent={o < 1}
      opacity={o}
      roughness={roughness}
      metalness={metalness}
      wireframe={mode === "wire"}
      side={THREE.DoubleSide}
      depthWrite={o > 0.75}
    />
  );
}

/** Box stretched between two points. `h` runs across the beam, `w` through its thickness. */
function Beam({
  from,
  to,
  h = 0.5,
  w = 0.25,
  color,
  part,
  opacity = 1,
  noPick = false,
  map,
}: {
  from: V3;
  to: V3;
  h?: number;
  w?: number;
  color: string;
  part: PartId;
  opacity?: number;
  /** Let clicks pass through to members behind (see-through skin in X-ray). */
  noPick?: boolean;
  map?: THREE.Texture;
}) {
  const { select, shadows } = useView();
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const l = dir.length() || 0.001;
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(X_AXIS, dir.normalize()),
      len: l,
    };
  }, [from, to]);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > DRAG_PX) return;
    select(part);
  };
  return (
    <mesh
      position={pos}
      quaternion={quat}
      onClick={click}
      raycast={noPick ? NO_RAYCAST : MESH_RAYCAST}
      castShadow={shadows}
      receiveShadow={shadows}
    >
      <boxGeometry args={[len, h, w]} />
      <Mat color={color} opacity={opacity} part={part} map={map} />
    </mesh>
  );
}

function Slab({
  size,
  pos,
  color,
  part,
  opacity = 1,
}: {
  size: V3;
  pos: V3;
  color: string;
  part: PartId;
  opacity?: number;
}) {
  const { select, shadows } = useView();
  return (
    <mesh
      position={pos}
      castShadow={shadows}
      receiveShadow={shadows}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (e.delta > DRAG_PX) return;
        select(part);
      }}
    >
      <boxGeometry args={size} />
      <Mat color={color} opacity={opacity} part={part} />
    </mesh>
  );
}

/** Group that drifts toward `offset` as the exploded-view slider rises. */
function Layer({ offset, children }: { offset: V3; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { explode } = useView();
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.pow(0.002, Math.min(dt, 0.1));
    g.position.x = THREE.MathUtils.lerp(g.position.x, offset[0] * explode, k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, offset[1] * explode, k);
    g.position.z = THREE.MathUtils.lerp(g.position.z, offset[2] * explode, k);
  });
  return <group ref={ref}>{children}</group>;
}

function DimLabel({
  pos,
  text,
  color = "#0F172A",
  factor,
}: {
  pos: V3;
  text: string;
  color?: string;
  factor: number;
}) {
  return (
    <Html position={pos} center distanceFactor={factor} zIndexRange={[10, 0]}>
      <div
        className="whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-bold shadow-sm"
        style={{ background: "rgba(255,255,255,.94)", borderColor: color + "40", color }}
      >
        {text}
      </div>
    </Html>
  );
}

export default function BuildingModel({
  config,
  mode,
  explode,
  selected,
  onSelect,
  showDims,
  labelFactor,
  openings,
  selectedOpening,
  onSelectOpening,
}: {
  config: Config;
  mode: ViewMode;
  explode: number;
  selected: PartId | null;
  onSelect: (p: PartId) => void;
  showDims: boolean;
  labelFactor: number;
  openings: ResolvedOpening[];
  selectedOpening: string | null;
  onSelectOpening: (id: string) => void;
}) {
  const g = useMemo(() => computeGeometry(config), [config]);
  const ft = config.features;
  const { width, length, columnXs, columnTops, rafters, apexes, frameZs } = g;
  const spans = config.spans;
  const half = width / 2;
  const hz = length / 2;

  const skin = mode === "xray" ? 0.16 : 1;
  const showSkin = mode !== "frame";
  const skinPick = mode !== "xray";

  const view = useMemo<ViewState>(
    () => ({ mode, selected, select: onSelect, explode, shadows: mode === "solid" }),
    [mode, selected, onSelect, explode]
  );

  const tex = useMemo(
    () => ({ wall: ribTexture(false), roof: ribTexture(true, length + 0.9) }),
    [length]
  );
  useEffect(
    () => () => {
      tex.wall.dispose();
      tex.roof.dispose();
    },
    [tex]
  );

  // Walls run up into the roof sheet so there is no gap at the eaves or along the gables.
  const walls = useMemo(() => {
    const [a0, b0] = rafters[0];
    const [aN, bN] = rafters[rafters.length - 1];
    const slopeL = (b0[1] - a0[1]) / (b0[0] - a0[0]);
    const slopeR = (bN[1] - aN[1]) / (bN[0] - aN[0]);
    const topL = columnTops[0][1] + SHEET_LIFT;
    const topR = columnTops[spans][1] + SHEET_LIFT;
    const mid = (WALL_IN + WALL_OUT) / 2;
    const gableTop: Pt[] = [
      [-half - WALL_OUT, topL - WALL_OUT * slopeL],
      ...rafters.slice(0, -1).map(([, e]) => [e[0], e[1] + SHEET_LIFT] as Pt),
      [half + WALL_OUT, topR + WALL_OUT * slopeR],
    ];

    /** Outline along the wall (u) and up (y), with doorways notched out of the bottom edge. */
    const shape = (top: Pt[], cuts: [number, number, number][]) => {
      const sh = new THREE.Shape();
      sh.moveTo(top[0][0], 0);
      [...cuts]
        .sort((p, q) => p[0] - q[0])
        .forEach(([l, r, h]) => {
          sh.lineTo(l, 0);
          sh.lineTo(l, h);
          sh.lineTo(r, h);
          sh.lineTo(r, 0);
        });
      sh.lineTo(top[top.length - 1][0], 0);
      for (let i = top.length - 1; i >= 0; i--) sh.lineTo(top[i][0], top[i][1]);
      sh.closePath();
      return sh;
    };
    // `flip` mirrors world position to wall u for walls whose local X runs opposite to world.
    const cutsFor = (wall: WallId, flip: boolean) =>
      openings
        .filter((o) => o.wall === wall)
        .map((o) => {
          const c = flip ? -o.at : o.at;
          return [c - o.width / 2, c + o.width / 2, o.height] as [number, number, number];
        });
    const flipTop = (t: Pt[]) => t.map(([x, y]) => [-x, y] as Pt).reverse();
    const ez = hz + 0.2;
    const sideTop = (h: number): Pt[] => [
      [-ez, h],
      [ez, h],
    ];

    return {
      front: shape(gableTop, cutsFor("front", false)),
      back: shape(flipTop(gableTop), cutsFor("back", true)),
      left: shape(sideTop(topL - mid * slopeL), cutsFor("left", false)),
      right: shape(sideTop(topR + mid * slopeR), cutsFor("right", true)),
      cornerL: topL - WALL_OUT * slopeL,
      cornerR: topR + WALL_OUT * slopeR,
    };
  }, [rafters, columnTops, spans, half, hz, openings]);

  /** Where each wall sits, and the frame for doors on it (origin on the outer face). */
  const wallPlace: Record<WallId, { pos: V3; rotY: number; door: (at: number) => V3; offset: V3 }> = {
    front: { pos: [0, 0, hz + 0.2], rotY: 0, door: (at) => [at, 0, hz + 0.2 + WALL_T], offset: [0, 0, 6] },
    back: { pos: [0, 0, -hz - 0.2], rotY: Math.PI, door: (at) => [at, 0, -hz - 0.2 - WALL_T], offset: [0, 0, -6] },
    left: { pos: [-half - WALL_IN, 0, 0], rotY: -Math.PI / 2, door: (at) => [-half - WALL_OUT, 0, at], offset: [-6, 0, 0] },
    right: { pos: [half + WALL_IN, 0, 0], rotY: Math.PI / 2, door: (at) => [half + WALL_OUT, 0, at], offset: [6, 0, 0] },
  };

  /** Girt runs along a sidewall, cut back to the jambs wherever a doorway reaches that height. */
  const girtRuns = (wall: WallId, y: number): [number, number][] => {
    const cuts = openings
      .filter((o) => o.wall === wall && o.height + 0.1 > y)
      .map((o) => [o.at - o.width / 2 - 0.1, o.at + o.width / 2 + 0.1] as [number, number])
      .sort((p, q) => p[0] - q[0]);
    const runs: [number, number][] = [];
    let cur = -hz;
    cuts.forEach(([a, b]) => {
      if (a > cur) runs.push([cur, a]);
      cur = Math.max(cur, b);
    });
    if (cur < hz) runs.push([cur, hz]);
    return runs;
  };

  const purlinPts = useMemo(() => {
    const pts: Pt[] = [];
    rafters.forEach(([a, b]) => {
      pts.push(a, ...along(a, b, 1.7));
    });
    pts.push(rafters[rafters.length - 1][1]);
    return pts;
  }, [rafters]);

  const girtYs = useMemo(() => {
    const ys: number[] = [];
    for (let y = 1.6; y < config.eave - 0.6; y += 1.8) ys.push(y);
    return ys;
  }, [config.eave]);

  const craneY = craneRailY(config.eave);

  /**
   * Layout for one mezzanine deck: panels, beams, post grid, guardrail runs and a stair.
   * A deck with an open edge is reached by a stair alongside it; a deck spanning wall to
   * wall by a stair rising through a guarded stairwell cut in the deck.
   */
  const layoutDeck = (mz: MezzDeck) => {
    const onColumn = (x: number) => columnXs.some((c) => Math.abs(c - x) < 0.3);
    const inset = (x: number, toward: number) => (onColumn(x) ? x + toward * 0.35 : x);
    const dx1 = inset(mz.x1, 1);
    const dx2 = inset(mz.x2, -1);
    const top = mz.y + 0.1;
    const zA = -hz + 0.3;
    const zZ = hz - 0.3;
    const zIn = (z: number) => Math.min(hz - 0.4, Math.max(-hz + 0.4, z));
    const beamZs = frameZs.map(zIn);
    const postXs = mz.posts.map((x) => Math.min(dx2 - 0.15, Math.max(dx1 + 0.15, x)));

    // Straight stair rising toward +Z: ~180 mm risers, 270 mm treads, 1.1 m wide.
    const steps = Math.max(4, Math.ceil(top / 0.18));
    const riser = top / steps;
    const tread = 0.27;
    const zB = -hz + 1.2;
    const zT = zB + steps * tread;
    const by = mz.y - 0.35;

    type Rect = { x1: number; x2: number; z1: number; z2: number };
    type Seg = [number, number, number, number]; // x1, z1, x2, z2 on the deck plane
    const decks: Rect[] = [];
    const beams: { from: V3; to: V3; h: number; w: number }[] = [];
    const rails: Seg[] = [];
    let sx: number;
    /** Side of the stair carrying the sloped handrail. */
    let handX: number;
    let landing: { rect: Rect; posts: number[]; postX: number } | null = null;

    if (!mz.openL && !mz.openR) {
      // Stairwell beside the first column line, clear of the main column flanges.
      const hx1 = dx1 + 0.25;
      const hx2 = hx1 + 1.3;
      sx = (hx1 + hx2) / 2;
      handX = sx + 0.55;
      decks.push(
        { x1: dx1, x2: hx1, z1: zA, z2: zZ },
        { x1: hx2, x2: dx2, z1: zA, z2: zZ },
        { x1: hx1, x2: hx2, z1: zT, z2: zZ },
        { x1: hx1, x2: hx2, z1: zA, z2: zB }
      );
      beamZs.forEach((z) => {
        if (z > zB - 0.2 && z < zT + 0.2) {
          if (hx1 - dx1 > 0.5) beams.push({ from: [dx1, by, z], to: [hx1, by, z], h: 0.5, w: 0.22 });
          beams.push({ from: [hx2, by, z], to: [dx2, by, z], h: 0.5, w: 0.22 });
        } else beams.push({ from: [dx1, by, z], to: [dx2, by, z], h: 0.5, w: 0.22 });
      });
      // Trimmer beams framing the stairwell.
      [hx1, hx2].forEach((x) =>
        beams.push({ from: [x, mz.y - 0.3, zB], to: [x, mz.y - 0.3, zT], h: 0.4, w: 0.2 })
      );
      rails.push(
        [hx1 + 0.04, zB, hx1 + 0.04, zT],
        [hx2 - 0.04, zB, hx2 - 0.04, zT],
        [hx1, zB + 0.04, hx2, zB + 0.04]
      );
    } else {
      // The stair goes on the left open edge if there is one; `dir` points from it toward the open floor.
      const dir = mz.openL ? -1 : 1;
      const deckEdge = mz.openL ? dx1 : dx2;
      sx = deckEdge + dir * (0.45 + 0.55);
      handX = sx + dir * 0.55;
      decks.push({ x1: dx1, x2: dx2, z1: zA, z2: zZ });
      beamZs.forEach((z) => beams.push({ from: [dx1, by, z], to: [dx2, by, z], h: 0.5, w: 0.22 }));
      beams.push({ from: [deckEdge, mz.y - 0.3, zA], to: [deckEdge, mz.y - 0.3, zZ], h: 0.4, w: 0.2 });
      // Guardrail along the open edge, with a gap where the stair landing meets the deck.
      const railX = deckEdge - dir * 0.06;
      [
        [zA, zT - 0.1],
        [zT + 1.2, zZ],
      ]
        .filter(([p, q]) => q - p > 0.5)
        .forEach(([p, q]) => rails.push([railX, p, railX, q]));
      landing = {
        rect: {
          x1: Math.min(handX, deckEdge),
          x2: Math.max(handX, deckEdge),
          z1: zT,
          z2: zT + 1.2,
        },
        posts: [zT + 0.05, zT + 1.15],
        postX: handX,
      };
      rails.push([handX, zT, handX, zT + 1.2], [handX, zT + 1.2, deckEdge, zT + 1.2]);
      // A deck open on both sides (a middle span) is guarded along its other edge too.
      if (mz.openL && mz.openR) {
        beams.push({ from: [dx2, mz.y - 0.3, zA], to: [dx2, mz.y - 0.3, zZ], h: 0.4, w: 0.2 });
        rails.push([dx2 - 0.06, zA, dx2 - 0.06, zZ]);
      }
    }

    return { top, decks, beams, rails, beamZs, postXs, steps, riser, tread, zB, zT, sx, handX, landing };
  };
  const mezzDecks = useMemo(
    () => g.mezzanines.map((mz) => ({ mz, mezz: layoutDeck(mz) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g]
  );

  return (
    <ViewCtx.Provider value={view}>
      <group position={[0, 0, 0]}>
        {/* Concrete apron */}
        <mesh position={[0, -0.14, 0]} receiveShadow>
          <boxGeometry args={[width + 6, 0.28, length + 6]} />
          <meshStandardMaterial color="#E7E5E4" roughness={0.95} metalness={0} />
        </mesh>

        {/* ── Primary frame ── */}
        <Layer offset={[0, 0, 0]}>
          {frameZs.map((z, fi) => (
            <group key={`f${fi}`}>
              {columnXs.map((x, i) => {
                const top = columnTops[i][1];
                const outer = i === 0 || i === spans;
                if (ft.rcc && outer)
                  return (
                    <Slab
                      key={`c${i}`}
                      size={[0.55, top, 0.55]}
                      pos={[x, top / 2, z]}
                      color={COLORS.concrete}
                      part="rcc"
                    />
                  );
                return (
                  <group key={`c${i}`}>
                    <Beam
                      from={[x, 0.1, z]}
                      to={[x, top, z]}
                      h={0.62}
                      w={0.3}
                      color={COLORS.primary}
                      part="column"
                    />
                    <Slab
                      size={[0.95, 0.12, 0.56]}
                      pos={[x, 0.06, z]}
                      color={COLORS.primaryDark}
                      part="base"
                    />
                  </group>
                );
              })}
              {rafters.map(([a, b], i) => (
                <Beam
                  key={`r${i}`}
                  from={[a[0], a[1], z]}
                  to={[b[0], b[1], z]}
                  h={0.55}
                  w={0.26}
                  color={COLORS.primary}
                  part="rafter"
                />
              ))}
              {apexes.map(([ax, ay], i) => (
                <Slab
                  key={`a${i}`}
                  size={[0.5, 0.7, 0.36]}
                  pos={[ax, ay - 0.1, z]}
                  color={COLORS.primaryDark}
                  part="ridge"
                />
              ))}
            </group>
          ))}
        </Layer>

        {/* ── Secondary steel: purlins, girts, bracing ── */}
        <Layer offset={[0, 2.4, 0]}>
          {purlinPts.map(([px, py], i) => (
            <Beam
              key={`p${i}`}
              from={[px, py + 0.42, -hz]}
              to={[px, py + 0.42, hz]}
              h={0.24}
              w={0.09}
              color={COLORS.secondary}
              part="purlin"
            />
          ))}
          {[0, spans].map((ci) =>
            girtYs.map((y, i) =>
              girtRuns(ci === 0 ? "left" : "right", y).map(([z1, z2], k) => (
                <Beam
                  key={`g${ci}-${i}-${k}`}
                  from={[columnXs[ci], y, z1]}
                  to={[columnXs[ci], y, z2]}
                  h={0.22}
                  w={0.08}
                  color={COLORS.secondary}
                  part="girt"
                />
              ))
            )
          )}
          {[0, frameZs.length - 2].map((bi) => {
            const z1 = frameZs[bi];
            const z2 = frameZs[bi + 1];
            return [0, spans].map((ci) => {
              const x = columnXs[ci];
              const top = columnTops[ci][1];
              return (
                <group key={`br${bi}-${ci}`}>
                  <Beam
                    from={[x, 0.2, z1]}
                    to={[x, top, z2]}
                    h={0.09}
                    w={0.09}
                    color={COLORS.bracing}
                    part="bracing"
                  />
                  <Beam
                    from={[x, top, z1]}
                    to={[x, 0.2, z2]}
                    h={0.09}
                    w={0.09}
                    color={COLORS.bracing}
                    part="bracing"
                  />
                </group>
              );
            });
          })}
        </Layer>

        {/* ── Roof sheeting, skylights, insulation ── */}
        {showSkin && (
          <Layer offset={[0, 5.5, 0]}>
            {rafters.map(([a, b], i) => {
              const first = i === 0;
              const last = i === rafters.length - 1;
              const dx = b[0] - a[0];
              const dy = b[1] - a[1];
              const L = Math.hypot(dx, dy) || 1;
              const ox = (dx / L) * EAVE_OVERHANG;
              const oy = (dy / L) * EAVE_OVERHANG;
              const s: V3 = [a[0] - (first ? ox : 0), a[1] + 0.66 - (first ? oy : 0), 0];
              const e: V3 = [b[0] + (last ? ox : 0), b[1] + 0.66 + (last ? oy : 0), 0];
              return (
                <group key={`rs${i}`}>
                  <Beam
                    from={s}
                    to={e}
                    h={0.1}
                    w={length + 0.9}
                    color={COLORS.roof}
                    part="roof-sheet"
                    opacity={skin}
                    noPick={!skinPick}
                    map={tex.roof}
                  />
                  {/* Eave gutters on the two outer edges */}
                  {(first || last) && (
                    <Beam
                      from={[first ? s[0] : e[0], (first ? s[1] : e[1]) - 0.16, -hz - 0.45]}
                      to={[first ? s[0] : e[0], (first ? s[1] : e[1]) - 0.16, hz + 0.45]}
                      h={0.22}
                      w={0.26}
                      color="#94A3B8"
                      part="roof-sheet"
                      opacity={skin}
                      noPick={!skinPick}
                    />
                  )}
                  {ft.insulation && (
                    <Beam
                      from={[s[0], s[1] - 0.16, 0]}
                      to={[e[0], e[1] - 0.16, 0]}
                      h={0.16}
                      w={length + 0.4}
                      color={COLORS.insulation}
                      part="insulation"
                      opacity={0.4}
                    />
                  )}
                </group>
              );
            })}
            {ft.skylight &&
              rafters.map(([a, b], i) => {
                if (i % 2 !== 0) return null;
                const seg = 0.36;
                const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                const sPt: V3 = [
                  mid[0] - (b[0] - a[0]) * (seg / 2),
                  mid[1] - (b[1] - a[1]) * (seg / 2) + 0.74,
                  0,
                ];
                const ePt: V3 = [
                  mid[0] + (b[0] - a[0]) * (seg / 2),
                  mid[1] + (b[1] - a[1]) * (seg / 2) + 0.74,
                  0,
                ];
                return [-length * 0.26, length * 0.26].map((zc, j) => (
                  <group key={`sky${i}-${j}`} position={[0, 0, zc]}>
                    <Beam
                      from={sPt}
                      to={ePt}
                      h={0.12}
                      w={length * 0.26}
                      color={COLORS.skylight}
                      part="skylight"
                      opacity={0.7}
                    />
                  </group>
                ));
              })}
            {apexes.map(([ax, ay], i) => (
              <Beam
                key={`rc${i}`}
                from={[ax, ay + 0.78, -hz - 0.4]}
                to={[ax, ay + 0.78, hz + 0.4]}
                h={0.16}
                w={0.9}
                color={COLORS.roof}
                part="ridge"
                opacity={skin}
                noPick={!skinPick}
              />
            ))}
          </Layer>
        )}

        {/* ── Wall cladding with framed openings ── */}
        {showSkin &&
          (["front", "back", "left", "right"] as WallId[]).map((wall) => {
            const p = wallPlace[wall];
            const side = !isGable(wall);
            const cornerH = wall === "left" ? walls.cornerL : walls.cornerR;
            return (
              <Layer key={wall} offset={p.offset}>
                <mesh
                  position={p.pos}
                  rotation={[0, p.rotY, 0]}
                  castShadow={view.shadows}
                  receiveShadow={view.shadows}
                  raycast={skinPick ? MESH_RAYCAST : NO_RAYCAST}
                  onClick={(e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation();
                    if (e.delta > DRAG_PX) return;
                    onSelect("cladding");
                  }}
                >
                  <extrudeGeometry args={[walls[wall], { depth: WALL_T, bevelEnabled: false }]} />
                  <Mat
                    color={COLORS.cladding}
                    opacity={skin}
                    part="cladding"
                    map={tex.wall}
                    roughness={0.6}
                    metalness={0.15}
                  />
                </mesh>
                {/* Corner flashing where this sidewall meets the gables */}
                {side &&
                  [hz + 0.32, -hz - 0.32].map((z) => (
                    <Slab
                      key={z}
                      size={[0.22, cornerH - 0.05, 0.22]}
                      pos={[(wall === "left" ? -1 : 1) * (half + WALL_OUT), (cornerH - 0.05) / 2, z]}
                      color={COLORS.primaryDark}
                      part="cladding"
                      opacity={skin}
                    />
                  ))}
                {openings
                  .filter((o) => o.wall === wall)
                  .map((o) => (
                    <group key={o.id} position={p.door(o.at)} rotation={[0, p.rotY, 0]}>
                      <Entrance
                        o={o}
                        mode={mode}
                        shadows={view.shadows}
                        selected={selectedOpening === o.id}
                        onPick={(id) => {
                          onSelect("door");
                          onSelectOpening(id);
                        }}
                      />
                    </group>
                  ))}
              </Layer>
            );
          })}

        {/* ── Accessories ── */}
        <Layer offset={[0, 9, 0]}>
          {g.cranes.map((cr, ci) => {
            // Each crane runs on its own runway; the hook works over open floor where it can
            // and stops above a mezzanine deck otherwise. Neighbouring bridges are staggered.
            const hookX = cr.hook.x;
            const hookY = cr.hook.deck ? Math.max(craneY - 3.4, cr.hook.deck.y + 0.9) : craneY - 3.4;
            const bz = ci % 2 === 0 ? 0 : -hz * 0.4;
            return (
              <group key={`crane${ci}`}>
                {[cr.x1 + 0.55, cr.x2 - 0.55].map((x, i) => (
                  <Beam
                    key={`cr${i}`}
                    from={[x, craneY, -hz]}
                    to={[x, craneY, hz]}
                    h={0.45}
                    w={0.35}
                    color={COLORS.crane}
                    part="crane"
                  />
                ))}
                <Beam
                  from={[cr.x1 + 0.55, craneY + 0.75, bz]}
                  to={[cr.x2 - 0.55, craneY + 0.75, bz]}
                  h={0.9}
                  w={1.6}
                  color={COLORS.crane}
                  part="crane"
                />
                <Slab size={[2.2, 1.1, 2.2]} pos={[hookX, craneY + 0.4, bz]} color="#9333EA" part="crane" />
                <Beam
                  from={[hookX, craneY + 0.3, bz]}
                  to={[hookX, hookY + 0.2, bz]}
                  h={0.12}
                  w={0.12}
                  color="#7E22CE"
                  part="crane"
                />
                <Slab size={[1, 0.5, 0.5]} pos={[hookX, hookY, bz]} color="#7E22CE" part="crane" />
                {frameZs.map((z, i) =>
                  [cr.x1, cr.x2].map((x, j) => (
                    <Slab
                      key={`cb${i}-${j}`}
                      size={[1.2, 0.35, 0.5]}
                      pos={[x + (j === 0 ? 0.5 : -0.5), craneY - 0.35, z]}
                      color="#A21CAF"
                      part="crane"
                    />
                  ))
                )}
              </group>
            );
          })}

          {mezzDecks.map(({ mz, mezz }, di) => (
            <group key={`mz${di}`}>
              {/* Deck panels */}
              {mezz.decks.map((d, i) => (
                <Slab
                  key={`md${i}`}
                  size={[d.x2 - d.x1, 0.2, d.z2 - d.z1]}
                  pos={[(d.x1 + d.x2) / 2, mz.y, (d.z1 + d.z2) / 2]}
                  color={COLORS.mezzanine}
                  part="mezzanine"
                  opacity={0.92}
                />
              ))}
              {/* Main beams, edge and trimmer beams */}
              {mezz.beams.map((bm, i) => (
                <Beam key={`mb${i}`} {...bm} color="#5B21B6" part="mezzanine" />
              ))}
              {/* Free-standing posts with base plates */}
              {mezz.postXs.map((x) =>
                mezz.beamZs.map((z, i) => (
                  <group key={`mp${x}-${i}`}>
                    <Beam
                      from={[x, 0.08, z]}
                      to={[x, mz.y - 0.6, z]}
                      h={0.28}
                      w={0.28}
                      color="#6D28D9"
                      part="mezzanine"
                    />
                    <Slab size={[0.5, 0.06, 0.5]} pos={[x, 0.03, z]} color="#4C1D95" part="mezzanine" />
                  </group>
                ))
              )}
              {/* Guardrails: top rail at 1.07 m, mid-rail and kick-plate, posts at ≤ 1.8 m */}
              {mezz.rails.map(([x1, z1, x2, z2], r) => {
                const len = Math.hypot(x2 - x1, z2 - z1);
                const posts = Math.max(1, Math.ceil(len / 1.8));
                return (
                  <group key={`gr${r}`}>
                    {[1.07, 0.55].map((hgt) => (
                      <Beam
                        key={hgt}
                        from={[x1, mezz.top + hgt, z1]}
                        to={[x2, mezz.top + hgt, z2]}
                        h={0.06}
                        w={0.06}
                        color="#FACC15"
                        part="mezzanine"
                      />
                    ))}
                    <Beam
                      from={[x1, mezz.top + 0.08, z1]}
                      to={[x2, mezz.top + 0.08, z2]}
                      h={0.15}
                      w={0.03}
                      color="#FACC15"
                      part="mezzanine"
                    />
                    {Array.from({ length: posts + 1 }, (_, k) => k / posts).map((t) => (
                      <Beam
                        key={t}
                        from={[x1 + (x2 - x1) * t, mezz.top, z1 + (z2 - z1) * t]}
                        to={[x1 + (x2 - x1) * t, mezz.top + 1.07, z1 + (z2 - z1) * t]}
                        h={0.06}
                        w={0.06}
                        color="#FACC15"
                        part="mezzanine"
                      />
                    ))}
                  </group>
                );
              })}
              {/* Stair: stringers, treads and a sloped handrail */}
              {[-0.55, 0.55].map((o) => (
                <Beam
                  key={`st${o}`}
                  from={[mezz.sx + o, 0.1, mezz.zB]}
                  to={[mezz.sx + o, mezz.top - 0.1, mezz.zT]}
                  h={0.25}
                  w={0.08}
                  color="#6D28D9"
                  part="mezzanine"
                />
              ))}
              {Array.from({ length: mezz.steps }, (_, i) => (
                <Slab
                  key={`tr${i}`}
                  size={[1.1, 0.05, mezz.tread + 0.03]}
                  pos={[mezz.sx, (i + 1) * mezz.riser - 0.025, mezz.zB + (i + 0.5) * mezz.tread]}
                  color="#A78BFA"
                  part="mezzanine"
                />
              ))}
              <Beam
                from={[mezz.handX, 1.0, mezz.zB]}
                to={[mezz.handX, mezz.top + 1.0, mezz.zT]}
                h={0.06}
                w={0.06}
                color="#FACC15"
                part="mezzanine"
              />
              {/* Top landing (half/bay layouts) */}
              {mezz.landing && (
                <>
                  <Slab
                    size={[mezz.landing.rect.x2 - mezz.landing.rect.x1, 0.1, 1.2]}
                    pos={[
                      (mezz.landing.rect.x1 + mezz.landing.rect.x2) / 2,
                      mezz.top - 0.05,
                      (mezz.landing.rect.z1 + mezz.landing.rect.z2) / 2,
                    ]}
                    color={COLORS.mezzanine}
                    part="mezzanine"
                  />
                  {mezz.landing.posts.map((z) => (
                    <Beam
                      key={`lp${z}`}
                      from={[mezz.landing!.postX, 0.08, z]}
                      to={[mezz.landing!.postX, mezz.top, z]}
                      h={0.12}
                      w={0.12}
                      color="#6D28D9"
                      part="mezzanine"
                    />
                  ))}
                </>
              )}
            </group>
          ))}

          {ft.ventilator &&
            apexes.map(([ax, ay], i) =>
              [-length * 0.3, 0, length * 0.3].map((z, j) => (
                <group key={`v${i}-${j}`}>
                  <Slab
                    size={[1.8, 0.7, 2.2]}
                    pos={[ax, ay + 1.25, z]}
                    color={COLORS.vent}
                    part="ventilator"
                    opacity={0.9}
                  />
                  <Slab
                    size={[2.2, 0.12, 2.6]}
                    pos={[ax, ay + 1.66, z]}
                    color="#B91C1C"
                    part="ventilator"
                  />
                </group>
              ))
            )}

          {ft.valley &&
            columnXs.slice(1, -1).map((vx, i) => (
              <Beam
                key={`vg${i}`}
                from={[vx, columnTops[i + 1][1] + 0.55, -hz - 0.3]}
                to={[vx, columnTops[i + 1][1] + 0.55, hz + 0.3]}
                h={0.4}
                w={1.3}
                color={COLORS.valley}
                part="valley"
                opacity={0.92}
              />
            ))}

          {ft.canopy && (
            <group>
              <Beam
                from={[columnXs[0], columnTops[0][1] - 0.4, 0]}
                to={[columnXs[0] - 3.2, columnTops[0][1] - 1.3, 0]}
                h={0.12}
                w={length * 0.7}
                color={COLORS.canopy}
                part="canopy"
                opacity={0.85}
              />
              {[-length * 0.3, length * 0.3].map((z, i) => (
                <Beam
                  key={`cs${i}`}
                  from={[columnXs[0], columnTops[0][1] - 0.4, z]}
                  to={[columnXs[0] - 3.2, columnTops[0][1] - 1.3, z]}
                  h={0.2}
                  w={0.16}
                  color="#6D28D9"
                  part="canopy"
                />
              ))}
            </group>
          )}
        </Layer>

        {/* ── Dimensions ── */}
        {showDims && (
          <group>
            <Beam
              from={[-half, 0.02, hz + 3]}
              to={[half, 0.02, hz + 3]}
              h={0.07}
              w={0.07}
              color="#334155"
              part="base"
            />
            <DimLabel factor={labelFactor} pos={[0, 0.9, hz + 3]} text={`Width ${config.width} m`} />
            <Beam
              from={[half + 2.4, 0, hz]}
              to={[half + 2.4, config.eave, hz]}
              h={0.07}
              w={0.07}
              color="#334155"
              part="base"
            />
            <DimLabel factor={labelFactor} pos={[half + 2.4, config.eave / 2, hz]} text={`Eave ${config.eave} m`} />
            <DimLabel factor={labelFactor}
              pos={[
                apexes.length ? apexes[Math.floor(apexes.length / 2)][0] : 0,
                g.maxHeight + 2.4,
                0,
              ]}
              text={
                config.roof === "pitched"
                  ? `Ridge +${g.ridgeHeight} m`
                  : `Slope rise +${g.ridgeHeight} m`
              }
              color="#B91C1C"
            />
            <Beam
              from={[-half - 4, 0.02, -hz]}
              to={[-half - 4, 0.02, hz]}
              h={0.07}
              w={0.07}
              color="#334155"
              part="base"
            />
            <DimLabel factor={labelFactor}
              pos={[-half - 4, 1.4, 0]}
              text={`Length ${length} m — ${config.bays} bays @ ${config.baySpacing} m`}
            />
          </group>
        )}
      </group>
    </ViewCtx.Provider>
  );
}

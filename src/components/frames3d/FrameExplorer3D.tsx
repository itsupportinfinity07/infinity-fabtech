"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Box,
  Crosshair,
  DoorOpen,
  Layers,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCw,
  Ruler,
  Trash2,
} from "lucide-react";
import {
  COLORS,
  DEF_FEATURES,
  FEATURES,
  FRAME_TYPES,
  PART_INFO,
  computeGeometry,
  craneNote,
  craneSpansFor,
  mezzArea,
  mezzNote,
  mezzSpansFor,
  productsFor,
  toggleCraneSpan,
  toggleMezzSpan,
  type Config,
  type FeatureId,
  type Features,
  type FrameType,
  type MezzSide,
  type PartId,
  type Roof,
} from "./frames";
import {
  OPENING_KINDS,
  WALLS,
  defaultOpenings,
  fitOpening,
  maxOpeningHeight,
  resolveOpenings,
  wallRange,
  type Opening,
  type OpeningKind,
  type WallId,
} from "./openings";
import FrameThumb from "./FrameThumb";
import type { ViewMode } from "./BuildingModel";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-orange" />
        <span className="text-xs font-semibold text-stone-600">Loading 3D model…</span>
      </div>
    </div>
  ),
});

type FsElement = HTMLDivElement & { webkitRequestFullscreen?: () => void };
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "xray", label: "X-Ray" },
  { id: "frame", label: "Frame Only" },
  { id: "wire", label: "Wireframe" },
];

const LEGEND: [string, string][] = [
  [COLORS.primary, "Primary Steel"],
  [COLORS.secondary, "Purlins & Girts"],
  [COLORS.bracing, "Bracing"],
  [COLORS.roof, "Roof Sheeting"],
  [COLORS.cladding, "Wall Cladding"],
];

export default function FrameExplorer3D({ showHeader = true }: { showHeader?: boolean }) {
  const [typeId, setTypeId] = useState(FRAME_TYPES[0].id);
  const type = FRAME_TYPES.find((t) => t.id === typeId)!;
  const [width, setWidth] = useState(type.width);
  const [eave, setEave] = useState(type.eave);
  const [pitch, setPitch] = useState(type.pitch);
  const [spans, setSpans] = useState<1 | 2 | 3>(type.spans);
  const [bays, setBays] = useState(type.bays);
  const [roof, setRoof] = useState<Roof>(type.roof);
  const [features, setFeatures] = useState<Features>({ ...DEF_FEATURES, ...type.features });
  const [mezzSide, setMezzSide] = useState<MezzSide>("right");
  // undefined = default (the last span) until the user picks spans.
  const [mezzSpans, setMezzSpans] = useState<number[] | undefined>();
  const [craneSpans, setCraneSpans] = useState<number[] | undefined>();

  const [mode, setMode] = useState<ViewMode>("xray");
  const [explode, setExplode] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [selected, setSelected] = useState<PartId | null>(null);
  const [resetKey, setResetKey] = useState("cs-p-0");

  const [openings, setOpenings] = useState<Opening[]>(() => defaultOpenings(FRAME_TYPES[0]));
  const [selOpening, setSelOpening] = useState<string | null>(null);
  const [addWall, setAddWall] = useState<WallId>("front");
  const [notice, setNotice] = useState<string | null>(null);
  const nextId = useRef(1);

  const holder = useRef<HTMLDivElement>(null);
  const inView = useInView(holder, { once: true, margin: "300px" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsSupported, setFsSupported] = useState(true);

  useEffect(() => {
    const el = holder.current as FsElement | null;
    setFsSupported(
      Boolean(document.fullscreenEnabled ?? true) &&
        Boolean(el?.requestFullscreen || el?.webkitRequestFullscreen)
    );
    const sync = () => {
      const doc = document as FsDocument;
      const active = Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
      setIsFullscreen(active);
      // Re-fit the camera to the new viewport shape.
      setResetKey(`fs-${active}-${Date.now()}`);
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const doc = document as FsDocument;
    const el = holder.current as FsElement | null;
    if (doc.fullscreenElement ?? doc.webkitFullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(document);
    } else if (el) {
      (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
    }
  }, []);

  const config: Config = useMemo(
    () => ({
      width,
      eave,
      pitch,
      spans,
      bays,
      baySpacing: type.baySpacing,
      roof,
      features,
      mezzSide,
      mezzSpans,
      craneSpans,
    }),
    [width, eave, pitch, spans, bays, type.baySpacing, roof, features, mezzSide, mezzSpans, craneSpans]
  );
  const geo = useMemo(() => computeGeometry(config), [config]);
  const resolved = useMemo(() => resolveOpenings(geo, openings), [geo, openings]);
  const activeOpening = resolved.find((o) => o.id === selOpening) ?? null;

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const handleSelect = useCallback((p: PartId | null) => {
    setSelected(p);
    if (p !== "door") setSelOpening(null);
  }, []);

  const pickOpening = (id: string | null) => {
    setSelOpening(id);
    setSelected(id ? "door" : null);
  };

  const wallLabel = (w: WallId) => WALLS.find((x) => x.id === w)!.label;

  const addOpening = (kind: OpeningKind) => {
    const f = fitOpening(geo, addWall, kind, 0, resolved);
    if (!f) {
      setNotice(
        `No room for a ${OPENING_KINDS[kind].label.toLowerCase()} on the ${wallLabel(addWall).toLowerCase()} — try another wall or a larger building.`
      );
      return;
    }
    const id = `d${nextId.current++}`;
    setOpenings([...resolved, { id, kind, wall: addWall, at: f.at }]);
    pickOpening(id);
  };

  /** Re-fit one opening against the others; everything is committed at its resolved spot. */
  const updateOpening = (
    id: string,
    wall: WallId,
    at: number,
    size?: { width: number; height: number }
  ) => {
    const o = resolved.find((x) => x.id === id);
    if (!o) return;
    const want = size ?? { width: o.width, height: o.height };
    const f = fitOpening(geo, wall, o.kind, at, resolved.filter((x) => x.id !== id), want);
    if (!f) {
      setNotice(
        size
          ? `${OPENING_KINDS[o.kind].label} at ${want.width} m wide doesn't fit between the columns and other doors on the ${wallLabel(wall).toLowerCase()}.`
          : `No room for that ${OPENING_KINDS[o.kind].label.toLowerCase()} on the ${wallLabel(wall).toLowerCase()}.`
      );
      return;
    }
    setOpenings(resolved.map((x) => (x.id === id ? { ...x, wall, ...f } : x)));
  };

  const removeOpening = (id: string) => {
    setOpenings(resolved.filter((x) => x.id !== id));
    if (selOpening === id) pickOpening(null);
  };

  const applyType = (t: FrameType) => {
    setTypeId(t.id);
    setWidth(t.width);
    setEave(t.eave);
    setPitch(t.pitch);
    setSpans(t.spans);
    setBays(t.bays);
    setRoof(t.roof);
    setFeatures({ ...DEF_FEATURES, ...t.features });
    setMezzSide("right");
    setMezzSpans(undefined);
    setCraneSpans(undefined);
    setSelected(null);
    setOpenings(defaultOpenings(t));
    setSelOpening(null);
    setExplode(0);
    setResetKey(`${t.id}-${Date.now()}`);
  };

  const toggleFeature = (id: FeatureId) =>
    setFeatures((f) =>
      id === "crane" && !f.crane ? { ...f, crane: true, mezzanine: true } : { ...f, [id]: !f[id] }
    );

  const info = selected ? PART_INFO[selected] : null;
  const activeFeatures = FEATURES.filter((f) => features[f.id]);
  const pitchRatio = `1:${Math.round(1 / Math.tan((pitch * Math.PI) / 180))}`;

  return (
    <section className={showHeader ? "bg-brand-gray py-20" : "bg-brand-gray pb-16 pt-10"} id="peb-3d-models">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="mb-9 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-orange/15 px-4 py-1.5 text-sm font-semibold text-brand-orange"
            >
              <Box size={15} /> Interactive 3D Models
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-3 text-3xl font-bold text-stone-900 sm:text-4xl"
            >
              All 8 PEB Frame Types — In 3D
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-stone-600"
            >
              Orbit, zoom and explode the full building model. Switch between solid, x-ray and
              frame-only views, then click any member to see the Infinity Fabtech products it needs.
            </motion.p>
          </div>
        )}

        {/* Frame type selector */}
        <div className="mb-6">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-widest text-stone-600">
            Select Frame Type
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {FRAME_TYPES.map((t) => {
              const on = t.id === typeId;
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => applyType(t)}
                  className={`overflow-hidden rounded-xl border-2 text-left transition-all duration-200 ${
                    on
                      ? "border-brand-orange bg-white shadow-lg shadow-brand-orange/20"
                      : "border-stone-200 bg-white hover:border-stone-400"
                  }`}
                >
                  <div className={on ? "bg-white" : "bg-white"}>
                    <FrameThumb type={t} active={on} />
                  </div>
                  <div className="px-2 py-1.5">
                    <div
                      className={`truncate text-[10px] font-bold ${
                        on ? "text-brand-orange" : "text-stone-800"
                      }`}
                    >
                      {t.name}
                    </div>
                    <div
                      className={`truncate text-[9px] ${on ? "text-brand-orange/80" : "text-stone-600"}`}
                    >
                      {t.sub}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
          {/* Viewport */}
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div
              ref={holder}
              className={`relative w-full bg-slate-100 ${
                isFullscreen ? "h-screen" : "h-[380px] sm:h-[480px] lg:h-[540px]"
              }`}
            >
              {inView ? (
                <Scene
                  config={config}
                  mode={mode}
                  explode={explode}
                  selected={selected}
                  onSelect={handleSelect}
                  showDims={showDims}
                  autoRotate={autoRotate}
                  resetKey={resetKey}
                  openings={resolved}
                  selectedOpening={selOpening}
                  onSelectOpening={pickOpening}
                />
              ) : (
                <div className="h-full w-full bg-slate-200" />
              )}

              {/* Viewport toolbar */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
                <div className="pointer-events-auto flex rounded-lg border border-slate-200 bg-white/95 p-0.5 shadow-sm backdrop-blur">
                  {VIEW_MODES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setMode(v.id)}
                      className={`rounded-md px-2 py-1.5 text-[10px] font-bold transition-colors sm:px-2.5 sm:text-[11px] ${
                        mode === v.id
                          ? "bg-brand-orange text-white"
                          : "text-stone-600 hover:text-slate-800"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
                <div className="pointer-events-auto flex gap-1.5">
                  {[
                    {
                      icon: <RotateCw size={14} />,
                      on: autoRotate,
                      label: "Auto-rotate",
                      act: () => setAutoRotate((v) => !v),
                    },
                    {
                      icon: <Ruler size={14} />,
                      on: showDims,
                      label: "Dimensions",
                      act: () => setShowDims((v) => !v),
                    },
                    {
                      icon: <Crosshair size={14} />,
                      on: false,
                      label: "Reset view",
                      act: () => setResetKey(`${typeId}-${Date.now()}`),
                    },
                    ...(fsSupported
                      ? [
                          {
                            icon: isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />,
                            on: isFullscreen,
                            label: isFullscreen ? "Exit fullscreen" : "Fullscreen",
                            act: toggleFullscreen,
                          },
                        ]
                      : []),
                  ].map((b) => (
                    <button
                      key={b.label}
                      onClick={b.act}
                      title={b.label}
                      aria-label={b.label}
                      className={`rounded-lg border p-2 shadow-sm transition-colors ${
                        b.on
                          ? "border-brand-orange bg-brand-orange text-white"
                          : "border-slate-200 bg-white/95 text-stone-600 hover:text-slate-800"
                      }`}
                    >
                      {b.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explode slider */}
              <div className="pointer-events-auto absolute bottom-3 left-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                <Layers size={14} className="text-brand-orange" />
                <span className="text-[11px] font-bold text-slate-600">Exploded</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explode}
                  onChange={(e) => setExplode(parseFloat(e.target.value))}
                  className="h-1.5 w-28 cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(to right,#B91C1C 0%,#B91C1C ${explode * 100}%,#E2E8F0 ${
                      explode * 100
                    }%,#E2E8F0 100%)`,
                  }}
                  aria-label="Exploded view amount"
                />
              </div>

              <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-lg bg-slate-900/70 px-2.5 py-1 text-[10px] font-medium text-slate-300 sm:block">
                Drag to orbit · Scroll to zoom · Click a member
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200 px-4 py-3">
              {LEGEND.map(([c, t]) => (
                <div key={t} className="flex items-center gap-1.5 text-[11px] text-stone-600">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                  {t}
                </div>
              ))}
              {activeFeatures.map((f) => (
                <div key={f.id} className="flex items-center gap-1.5 text-[11px] text-stone-600">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: f.color }} />
                  {f.label}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="border-t border-stone-200 bg-stone-50 p-5">
              <div className="mb-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Slider label="Building Width" value={width} min={10} max={72} step={2} unit="m" onChange={setWidth} />
                <Slider label="Eave Height" value={eave} min={4} max={14} step={0.5} unit="m" onChange={setEave} />
                <Slider label="Roof Pitch" value={pitch} min={3} max={20} step={1} unit="°" onChange={setPitch} />
                <Slider label="Number of Bays" value={bays} min={2} max={10} step={1} unit="" onChange={setBays} />
              </div>
              <div className="mb-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Spans</span>
                  {([1, 2, 3] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setSpans(n)}
                      className={`h-8 w-9 rounded-lg border text-xs font-bold transition-all ${
                        spans === n
                          ? "border-brand-orange bg-brand-orange text-white"
                          : "border-stone-300 bg-white text-stone-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Roof</span>
                  {([["pitched", "Pitched ▲"], ["mono", "Mono ⟍"]] as [Roof, string][]).map(
                    ([r, l]) => (
                      <button
                        key={r}
                        onClick={() => setRoof(r)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                          roof === r
                            ? "border-brand-orange bg-brand-orange text-white"
                            : "border-stone-300 bg-white text-stone-700"
                        }`}
                      >
                        {l}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="border-t border-stone-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Add / Remove Components
                  </span>
                  <button
                    onClick={() => setFeatures(DEF_FEATURES)}
                    className="text-[10px] text-stone-600 underline hover:text-stone-900"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FEATURES.map((f) => {
                    const on = features[f.id];
                    return (
                      <motion.button
                        key={f.id}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleFeature(f.id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          on
                            ? "border-transparent text-white shadow-sm"
                            : "border-stone-300 bg-white text-stone-600 hover:text-stone-900"
                        }`}
                        style={on ? { background: f.color, borderColor: f.color } : undefined}
                      >
                        {on ? <Minus size={11} /> : <Plus size={11} />}
                        {f.label}
                      </motion.button>
                    );
                  })}
                </div>
                {features.crane && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <span className="text-xs font-semibold text-stone-600">EOT crane in</span>
                    {spans === 1 ? (
                      <span
                        className="rounded-md px-2.5 py-1 text-[11px] font-bold text-white"
                        style={{ background: COLORS.crane }}
                      >
                        Full Span
                      </span>
                    ) : (
                      <SpanToggles
                        spans={spans}
                        picked={craneSpansFor(spans, craneSpans)}
                        color={COLORS.crane}
                        onToggle={(i) => setCraneSpans(toggleCraneSpan(spans, craneSpans, i))}
                        onAll={() => setCraneSpans(Array.from({ length: spans }, (_, i) => i))}
                      />
                    )}
                    {geo.cranes.length > 0 && (
                      <span className="ml-auto text-[11px] text-stone-600">
                        {craneNote(geo)}
                        {spans === 1 && " · the bridge spans column to column"}
                      </span>
                    )}
                  </div>
                )}
                {features.mezzanine && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
                    <span className="text-xs font-semibold text-stone-600">
                      {spans === 1 ? "Mezzanine over the" : "Mezzanine in"}
                    </span>
                    {spans === 1
                      ? (["left", "right", "full"] as MezzSide[]).map((sd) => (
                          <button
                            key={sd}
                            onClick={() => setMezzSide(sd)}
                            aria-pressed={mezzSide === sd}
                            className={`rounded-md border px-2.5 py-1 text-[11px] font-bold transition-all ${
                              mezzSide === sd
                                ? "border-transparent text-white"
                                : "border-stone-300 text-stone-700 hover:text-stone-900"
                            }`}
                            style={mezzSide === sd ? { background: COLORS.mezzanine } : undefined}
                          >
                            {sd === "full" ? "Full Width" : `${sd === "left" ? "Left" : "Right"} Half`}
                          </button>
                        ))
                      : (
                          <SpanToggles
                            spans={spans}
                            picked={mezzSpansFor(spans, mezzSpans)}
                            color={COLORS.mezzanine}
                            onToggle={(i) => setMezzSpans(toggleMezzSpan(spans, mezzSpans, i))}
                            onAll={() => setMezzSpans(Array.from({ length: spans }, (_, i) => i))}
                          />
                        )}
                    {geo.mezzanines.length > 0 && (
                      <span className="ml-auto text-[11px] text-stone-600">
                        {mezzNote(geo, spans, mezzSide)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-stone-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
                    <DoorOpen size={13} /> Entrances
                  </span>
                  <span className="text-[10px] text-stone-600">
                    Kept clear of columns and braced bays
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Add to</span>
                  {WALLS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setAddWall(w.id)}
                      aria-pressed={addWall === w.id}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                        addWall === w.id
                          ? "border-brand-orange bg-brand-orange text-white"
                          : "border-stone-300 bg-white text-stone-700"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(OPENING_KINDS) as OpeningKind[]).map((k) => (
                    <motion.button
                      key={k}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => addOpening(k)}
                      className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 hover:text-stone-900"
                    >
                      <Plus size={11} />
                      {OPENING_KINDS[k].label}
                      <span className="text-[10px] font-normal text-stone-600">
                        {OPENING_KINDS[k].width}×{OPENING_KINDS[k].height} m
                      </span>
                    </motion.button>
                  ))}
                </div>
                {notice && (
                  <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-[11px] text-amber-800">
                    {notice}
                  </p>
                )}

                {resolved.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {resolved.map((o) => {
                      const on = o.id === selOpening;
                      const [lo, hi] = wallRange(geo, o.wall);
                      const spec = OPENING_KINDS[o.kind];
                      const maxH = Math.max(
                        spec.heightRange[0],
                        Math.min(
                          spec.heightRange[1],
                          Math.floor(maxOpeningHeight(geo, o.wall, o.at, o.width) * 10) / 10
                        )
                      );
                      return (
                        <li
                          key={o.id}
                          className={`rounded-lg border px-3 py-2 transition-colors ${
                            on ? "border-brand-orange bg-brand-orange/10" : "border-stone-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => pickOpening(on ? null : o.id)}
                              className="flex-1 text-left text-xs font-semibold text-stone-800"
                            >
                              {OPENING_KINDS[o.kind].label}
                              <span className="ml-2 font-normal text-stone-600">
                                {wallLabel(o.wall)} · {o.width}×{o.height} m
                              </span>
                            </button>
                            <button
                              onClick={() => removeOpening(o.id)}
                              title="Remove entrance"
                              aria-label={`Remove ${OPENING_KINDS[o.kind].label}`}
                              className="rounded-md p-1 text-stone-600 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          {on && (
                            <div className="mt-3 space-y-3">
                              <div className="flex flex-wrap gap-1.5">
                                {WALLS.map((w) => (
                                  <button
                                    key={w.id}
                                    onClick={() => updateOpening(o.id, w.id, o.wall === w.id ? o.at : 0)}
                                    aria-pressed={o.wall === w.id}
                                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                      o.wall === w.id
                                        ? "border-brand-orange bg-brand-orange text-white"
                                        : "border-stone-300 text-stone-600 hover:text-stone-900"
                                    }`}
                                  >
                                    {w.label}
                                  </button>
                                ))}
                              </div>
                              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                <Slider
                                  label="Door Width"
                                  value={o.width}
                                  min={spec.widthRange[0]}
                                  max={spec.widthRange[1]}
                                  step={0.1}
                                  unit="m"
                                  onChange={(v) =>
                                    updateOpening(o.id, o.wall, o.at, { width: +v.toFixed(1), height: o.height })
                                  }
                                />
                                <Slider
                                  label="Door Height"
                                  value={o.height}
                                  min={spec.heightRange[0]}
                                  max={maxH}
                                  step={0.1}
                                  unit="m"
                                  onChange={(v) =>
                                    updateOpening(o.id, o.wall, o.at, { width: o.width, height: +v.toFixed(1) })
                                  }
                                />
                              </div>
                              {maxH < spec.heightRange[1] && (
                                <p className="-mt-1 text-[10px] text-stone-600">
                                  Height limited to {maxH} m by the eave, rafter or mezzanine above this spot.
                                </p>
                              )}
                              <Slider
                                label="Position along wall"
                                value={o.at}
                                min={lo}
                                max={hi}
                                step={0.25}
                                unit="m"
                                onChange={(v) => updateOpening(o.id, o.wall, v)}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
                {type.name} — {type.sub}
              </div>
              <div className="mb-2 text-sm font-bold text-slate-800">
                Practical: {type.practical}
              </div>
              <p className="mb-3 text-xs leading-relaxed text-stone-600">{type.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Width", v: `${width} m` },
                  { l: "Length", v: `${geo.length} m` },
                  { l: "Eave Ht.", v: `${eave} m` },
                  { l: "Ridge Rise", v: `+${geo.ridgeHeight} m` },
                  { l: "Pitch", v: `${pitch}° (${pitchRatio})` },
                  { l: "Bay Spacing", v: `${type.baySpacing} m` },
                  { l: "Spans", v: `${spans} Bay${spans > 1 ? "s" : ""}` },
                  { l: "Roof", v: roof === "pitched" ? "Pitched" : "Mono Slope" },
                ].map(({ l, v }) => (
                  <div key={l} className="rounded-lg bg-slate-100 p-2">
                    <div className="text-[9px] uppercase tracking-wide text-stone-600">{l}</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-800">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-brand-orange/10 p-2.5">
                <div className="text-[9px] uppercase tracking-wide text-brand-orange">
                  Covered Floor Area
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-800">
                  {(width * geo.length).toLocaleString()} m²
                  {geo.mezzanines.length > 0 && (
                    <span className="ml-1.5 text-xs font-semibold text-violet-700">
                      + {mezzArea(geo).toLocaleString()} m² mezzanine
                    </span>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {info && (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-brand-orange/40 bg-amber-50 p-4"
                >
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                    ● {info.cat}
                  </div>
                  <div className="mb-1 text-sm font-bold text-slate-800">
                    {selected === "door" && activeOpening
                      ? `${OPENING_KINDS[activeOpening.kind].label} — ${activeOpening.width} × ${activeOpening.height} m`
                      : info.title}
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-600">{info.detail}</p>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    Products required
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {info.products.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="h-1.5 w-1.5 flex-none rounded-full bg-brand-orange" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-600">
                Products for This Config
              </h4>
              <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {productsFor(config, resolved.length).map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-stone-700">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-brand-orange" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="/contact"
              className="block rounded-xl bg-brand-orange py-3 text-center text-sm font-bold text-white shadow-md shadow-brand-orange/25 transition-colors duration-200 hover:bg-brand-orange-light"
            >
              Get Quote for This Config →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-600">{label}</label>
        <span className="text-sm font-bold tabular-nums text-brand-orange">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right,#EA580C 0%,#EA580C ${pct}%,#E7E5E4 ${pct}%,#E7E5E4 100%)`,
        }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-stone-600">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

/** Per-span on/off chips plus an "All Spans" shortcut; at least one span stays selected. */
function SpanToggles({
  spans,
  picked,
  color,
  onToggle,
  onAll,
}: {
  spans: number;
  picked: number[];
  color: string;
  onToggle: (i: number) => void;
  onAll: () => void;
}) {
  const all = picked.length === spans;
  const cls = (on: boolean) =>
    `rounded-md border px-2.5 py-1 text-[11px] font-bold transition-all ${
      on ? "border-transparent text-white" : "border-stone-300 text-stone-700 hover:text-stone-900"
    }`;
  return (
    <>
      {Array.from({ length: spans }, (_, i) => {
        const on = picked.includes(i);
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            aria-pressed={on}
            title={on && picked.length === 1 ? "At least one span stays selected" : undefined}
            className={cls(on)}
            style={on ? { background: color } : undefined}
          >
            {on ? "✓ " : "+ "}Span {i + 1}
          </button>
        );
      })}
      <button onClick={onAll} aria-pressed={all} className={cls(all)} style={all ? { background: color } : undefined}>
        All Spans
      </button>
    </>
  );
}

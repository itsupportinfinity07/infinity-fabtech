"use client";
import { motion } from "framer-motion";
import { DoorOpen, Plus, Trash2 } from "lucide-react";
import type { Geometry } from "@/components/frames3d/frames";
import {
  OPENING_KINDS,
  WALLS,
  maxOpeningHeight,
  wallRange,
  type OpeningKind,
} from "@/components/frames3d/openings";
import type { useEntrances } from "@/components/frames3d/useEntrances";

type Entrances = ReturnType<typeof useEntrances>;

const chip = (on: boolean) =>
  `rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
    on
      ? "border-brand-orange bg-brand-orange text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
  }`;

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <span className="text-sm font-bold tabular-nums text-brand-orange">{value}m</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right,#B91C1C 0%,#B91C1C ${pct}%,#E2E8F0 ${pct}%,#E2E8F0 100%)`,
        }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{min}m</span>
        <span>{max}m</span>
      </div>
    </div>
  );
}

/** Add, select, move, resize and remove building entrances. */
export default function EntranceControls({ geo, ent }: { geo: Geometry; ent: Entrances }) {
  const wallLabel = (id: string) => WALLS.find((w) => w.id === id)!.label;
  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          <DoorOpen size={13} /> Entrances
        </span>
        <span className="text-[10px] text-slate-400">Kept clear of columns and braced bays</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Add to</span>
        {WALLS.map((w) => (
          <button
            key={w.id}
            onClick={() => ent.setAddWall(w.id)}
            aria-pressed={ent.addWall === w.id}
            className={chip(ent.addWall === w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(OPENING_KINDS) as OpeningKind[]).map((k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.93 }}
            onClick={() => ent.add(k)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300"
          >
            <Plus size={11} />
            {OPENING_KINDS[k].label}
            <span className="text-[10px] font-normal text-slate-400">
              {OPENING_KINDS[k].width}×{OPENING_KINDS[k].height} m
            </span>
          </motion.button>
        ))}
      </div>

      {ent.notice && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">{ent.notice}</p>
      )}

      {ent.resolved.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {ent.resolved.map((o) => {
            const on = o.id === ent.selId;
            const spec = OPENING_KINDS[o.kind];
            const [lo, hi] = wallRange(geo, o.wall);
            const maxH = Math.max(
              spec.heightRange[0],
              Math.min(spec.heightRange[1], Math.floor(maxOpeningHeight(geo, o.wall, o.at, o.width) * 10) / 10)
            );
            return (
              <li
                key={o.id}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  on ? "border-brand-orange bg-brand-orange/5" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => ent.setSelId(on ? null : o.id)}
                    className="flex-1 text-left text-xs font-semibold text-slate-700"
                  >
                    {spec.label}
                    <span className="ml-2 font-normal text-slate-400">
                      {wallLabel(o.wall)} · {o.width}×{o.height} m
                    </span>
                  </button>
                  <button
                    onClick={() => ent.remove(o.id)}
                    title="Remove entrance"
                    aria-label={`Remove ${spec.label}`}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
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
                          onClick={() => ent.update(o.id, w.id, o.wall === w.id ? o.at : 0)}
                          aria-pressed={o.wall === w.id}
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            o.wall === w.id
                              ? "border-brand-orange bg-brand-orange text-white"
                              : "border-slate-200 text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      <Range
                        label="Door Width"
                        value={o.width}
                        min={spec.widthRange[0]}
                        max={spec.widthRange[1]}
                        step={0.1}
                        onChange={(v) => ent.update(o.id, o.wall, o.at, { width: +v.toFixed(1), height: o.height })}
                      />
                      <Range
                        label="Door Height"
                        value={o.height}
                        min={spec.heightRange[0]}
                        max={maxH}
                        step={0.1}
                        onChange={(v) => ent.update(o.id, o.wall, o.at, { width: o.width, height: +v.toFixed(1) })}
                      />
                    </div>
                    {maxH < spec.heightRange[1] && (
                      <p className="-mt-1 text-[10px] text-slate-400">
                        Height limited to {maxH} m by the eave, rafter or mezzanine above this spot.
                      </p>
                    )}
                    <Range
                      label="Position along wall"
                      value={o.at}
                      min={lo}
                      max={hi}
                      step={0.25}
                      onChange={(v) => ent.update(o.id, o.wall, v)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

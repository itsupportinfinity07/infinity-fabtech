"use client";
import type { Geometry, Pt } from "@/components/frames3d/frames";
import {
  OPENING_KINDS,
  WALLS,
  frameTopAt,
  isGable,
  wallRange,
  type ResolvedOpening,
  type WallId,
} from "@/components/frames3d/openings";

const VW = 920;
const VH = 420;
const JAMB = "#8E1414";
const SELECT = "#F97316";

/**
 * A wall seen from outside, to scale, with its framed openings. `u` is the opening's
 * position along the wall as stored on the opening: world X on the gables, world Z on the sidewalls.
 */
export default function WallElevation({
  g,
  wall,
  doors,
  selId,
  onPick,
}: {
  g: Geometry;
  wall: WallId;
  doors: ResolvedOpening[];
  selId: string | null;
  onPick: (id: string) => void;
}) {
  const gable = isGable(wall);
  const [lo, hi] = wallRange(g, wall);
  const span = hi - lo;
  // Seen from outside, +X runs right on the front gable and left on the back; +Z runs right on the left wall and left on the right.
  const mirror = wall === "back" || wall === "right";

  const sideH = wall === "left" ? g.columnTops[0][1] : g.columnTops[g.columnTops.length - 1][1];
  const top = (u: number) => (gable ? frameTopAt(g, u) : sideH);
  const topPts: Pt[] = gable
    ? [g.columnTops[0], ...g.rafters.map(([, e]) => e)]
    : [
        [lo, sideH],
        [hi, sideH],
      ];
  const maxH = Math.max(...topPts.map((p) => p[1]));

  const s = Math.min((VW - 150) / span, (VH - 140) / (maxH + 1.2));
  const X0 = (VW - span * s) / 2;
  const GY = VH - 78;
  const sx = (u: number) => X0 + (mirror ? hi - u : u - lo) * s;
  const sy = (y: number) => GY - y * s;

  const ordered = [...topPts].sort((a, b) => sx(a[0]) - sx(b[0]));
  const outline = [`${sx(lo) < sx(hi) ? sx(lo) : sx(hi)},${GY}`, ...ordered.map(([u, y]) => `${sx(u)},${sy(y)}`), `${Math.max(sx(lo), sx(hi))},${GY}`].join(" ");
  const roofLine = ordered.map(([u, y]) => `${sx(u)},${sy(y)}`).join(" ");

  const columns = gable ? g.columnXs : g.frameZs;
  const braced: [number, number][] = gable
    ? []
    : [
        [g.frameZs[0], g.frameZs[1]],
        [g.frameZs[g.frameZs.length - 2], g.frameZs[g.frameZs.length - 1]],
      ];

  // Mezzanine decks meeting this wall: their extent along it and deck level.
  const decks = g.mezzanines
    .filter(
      (d) =>
        gable ||
        (wall === "left" && d.x1 <= -g.width / 2 + 0.01) ||
        (wall === "right" && d.x2 >= g.width / 2 - 0.01)
    )
    .map((d) => ({ a: gable ? d.x1 : lo, b: gable ? d.x2 : hi, y: d.y }));

  const mine = doors.filter((d) => d.wall === wall);
  const ribs = Array.from({ length: Math.floor(span) + 1 }, (_, i) => lo + i);
  const wallLabel = WALLS.find((x) => x.id === wall)!.label;

  const dimY = GY + 30;
  const xl = Math.min(sx(lo), sx(hi));
  const xr = Math.max(sx(lo), sx(hi));

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ maxHeight: 420 }}>
      <defs>
        <pattern id="gh-el" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="12" x2="12" y2="0" stroke="#B0B0B0" strokeWidth=".8" />
        </pattern>
      </defs>
      <rect width={VW} height={VH} fill="#FFFFFF" />
      <rect x={0} y={GY} width={VW} height={VH - GY} fill="#F0F0F0" />
      <rect x={0} y={GY} width={VW} height={VH - GY} fill="url(#gh-el)" opacity=".6" />
      <line x1={0} y1={GY} x2={VW} y2={GY} stroke="#555" strokeWidth="1.5" />

      <text x={VW / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155" fontFamily="Arial">
        {wallLabel} elevation — {gable ? "gable wall" : "sidewall"}, seen from outside
      </text>

      {/* Cladding with rib lines */}
      <polygon points={outline} fill="#E6EBF1" stroke="#94A3B8" strokeWidth="1" />
      {ribs.map((u) => {
        const x = sx(u);
        return (
          <line key={u} x1={x} y1={GY} x2={x} y2={sy(Math.max(0, top(u) - 0.05))} stroke="#CBD5E1" strokeWidth=".6" opacity=".8" />
        );
      })}
      <polyline points={roofLine} fill="none" stroke="#00ACC1" strokeWidth="3" strokeDasharray="6,3" strokeLinejoin="round" />

      {/* Braced end bays on sidewalls */}
      {braced.map(([a, b], i) => {
        const x1 = Math.min(sx(a), sx(b));
        const x2 = Math.max(sx(a), sx(b));
        return (
          <g key={i} opacity=".55">
            <rect x={x1} y={sy(sideH)} width={x2 - x1} height={GY - sy(sideH)} fill="#FEF3C7" opacity=".6" />
            <line x1={x1} y1={GY} x2={x2} y2={sy(sideH)} stroke="#F59E0B" strokeWidth="1" />
            <line x1={x1} y1={sy(sideH)} x2={x2} y2={GY} stroke="#F59E0B" strokeWidth="1" />
            <text x={(x1 + x2) / 2} y={sy(sideH) + 14} textAnchor="middle" fontSize="8.5" fill="#B45309" fontFamily="Arial">
              Braced bay
            </text>
          </g>
        );
      })}

      {/* Mezzanine deck level behind the cladding */}
      {decks.map((m, i) => (
        <g key={i}>
          <line
            x1={sx(m.a)}
            y1={sy(m.y)}
            x2={sx(m.b)}
            y2={sy(m.y)}
            stroke="#7C3AED"
            strokeWidth="2"
            strokeDasharray="7,4"
            opacity=".7"
          />
          <text
            x={Math.min(sx(m.a), sx(m.b)) + 6}
            y={sy(m.y) - 5}
            textAnchor="start"
            fontSize="9"
            fill="#7C3AED"
            fontFamily="Arial"
            fontWeight="700"
          >
            Mezzanine deck {m.y.toFixed(1)} m
          </text>
        </g>
      ))}

      {/* Column lines (hidden behind the cladding) */}
      {columns.map((u, i) => {
        const x = sx(u);
        return (
          <line key={i} x1={x} y1={GY} x2={x} y2={sy(top(u))} stroke="#CC0000" strokeWidth="2" strokeDasharray="5,4" opacity=".45" />
        );
      })}

      {/* Doors */}
      {mine.map((d) => {
        const cx = sx(d.at);
        const wp = d.width * s;
        const hp = d.height * s;
        const x = cx - wp / 2;
        const y = GY - hp;
        const j = Math.max(3, 0.14 * s);
        const on = selId === d.id;
        const labelY = y - (d.kind === "roller" ? 0.55 * s : d.kind === "sliding" ? 0.3 * s : 0.1 * s) - (on ? 14 : 7);
        return (
          <g key={d.id} onClick={() => onPick(d.id)} style={{ cursor: "pointer" }} role="button">
            <title>{`${OPENING_KINDS[d.kind].label} — ${d.width} × ${d.height} m`}</title>
            {/* Dark interior seen through the opening */}
            <rect x={x} y={y} width={wp} height={hp} fill="#334155" />
            <rect x={x} y={GY - 3} width={wp} height={3} fill="#64748B" />

            {d.kind === "roller" && (
              <>
                <rect x={x} y={y} width={wp} height={hp * 0.16} fill="#CBD5E1" />
                {[0.04, 0.08, 0.12].map((f) => (
                  <line key={f} x1={x} y1={y + hp * f} x2={x + wp} y2={y + hp * f} stroke="#94A3B8" strokeWidth=".8" />
                ))}
                <rect x={x - 0.25 * s} y={y - 0.55 * s} width={wp + 0.5 * s} height={0.55 * s} fill="#475569" />
                <rect x={x} y={y} width={Math.max(3, 0.1 * s)} height={hp} fill="#64748B" />
                <rect x={x + wp - Math.max(3, 0.1 * s)} y={y} width={Math.max(3, 0.1 * s)} height={hp} fill="#64748B" />
              </>
            )}

            {d.kind === "sliding" && (
              <>
                <rect x={x + wp * 0.45} y={y} width={wp * 0.55} height={hp} fill="#94A3B8" stroke="#64748B" strokeWidth=".8" />
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1={x + wp * 0.45} y1={y + hp * f} x2={x + wp} y2={y + hp * f} stroke="#64748B" strokeWidth="1" />
                ))}
                <rect x={x + wp * 0.5 + 4} y={y + hp * 0.5} width={3} height={Math.min(hp * 0.12, 14)} fill="#1E293B" />
                <rect x={x - 0.5 * wp * 0.0} y={y - 0.3 * s} width={wp * 1.6} height={Math.max(3, 0.14 * s)} fill="#64748B" />
              </>
            )}

            {d.kind === "personnel" &&
              (d.width >= 1.5 ? [0, 1] : [0]).map((k) => {
                const w = d.width >= 1.5 ? wp / 2 : wp;
                const x0 = d.width >= 1.5 ? (k === 0 ? x : x + wp) : x;
                const dir = k === 0 ? 1 : -1;
                return (
                  <g key={k}>
                    <polygon
                      points={`${x0},${GY} ${x0},${y} ${x0 + dir * w * 0.36},${y + hp * 0.04} ${x0 + dir * w * 0.36},${GY - hp * 0.03}`}
                      fill="#475569"
                      stroke="#1E293B"
                      strokeWidth=".8"
                    />
                    <circle cx={x0 + dir * w * 0.3} cy={GY - hp * 0.47} r={1.8} fill="#E2E8F0" />
                  </g>
                );
              })}

            {/* Frame trim */}
            <rect x={x - j} y={y - j} width={j} height={hp + j} fill={JAMB} />
            <rect x={x + wp} y={y - j} width={j} height={hp + j} fill={JAMB} />
            <rect x={x - j} y={y - j} width={wp + 2 * j} height={j} fill={JAMB} />

            {on && (
              <>
                <rect
                  x={x - j - 5}
                  y={y - j - 5 - (d.kind === "roller" ? 0.55 * s : d.kind === "sliding" ? 0.3 * s : 0)}
                  width={wp + 2 * j + 10 + (d.kind === "sliding" ? wp * 0.6 : 0)}
                  height={hp + j + 5 + (d.kind === "roller" ? 0.55 * s : d.kind === "sliding" ? 0.3 * s : 0)}
                  fill="none"
                  stroke={SELECT}
                  strokeWidth="2.5"
                  rx="3"
                />
                <line x1={x} y1={GY + 12} x2={x + wp} y2={GY + 12} stroke={SELECT} strokeWidth="1.2" />
                <line x1={x} y1={GY + 7} x2={x} y2={GY + 17} stroke={SELECT} strokeWidth="1.2" />
                <line x1={x + wp} y1={GY + 7} x2={x + wp} y2={GY + 17} stroke={SELECT} strokeWidth="1.2" />
                <text x={cx} y={GY + 26} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SELECT} fontFamily="Arial">
                  {d.width} m
                </text>
                <line x1={x - j - 12} y1={GY} x2={x - j - 12} y2={y} stroke={SELECT} strokeWidth="1.2" />
                <line x1={x - j - 17} y1={y} x2={x - j - 7} y2={y} stroke={SELECT} strokeWidth="1.2" />
                <text
                  x={x - j - 18}
                  y={(GY + y) / 2}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill={SELECT}
                  fontFamily="Arial"
                  transform={`rotate(-90 ${x - j - 18} ${(GY + y) / 2})`}
                >
                  {d.height} m
                </text>
              </>
            )}
            <text x={cx} y={labelY} textAnchor="middle" fontSize="9" fontWeight="700" fill={on ? SELECT : "#334155"} fontFamily="Arial">
              {OPENING_KINDS[d.kind].label}
            </text>
          </g>
        );
      })}

      {mine.length === 0 && (
        <text x={VW / 2} y={GY - 14} textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="Arial">
          No entrances on this wall — add one below.
        </text>
      )}

      {/* Overall dimension */}
      <line x1={xl} y1={dimY + 22} x2={xr} y2={dimY + 22} stroke="#333" strokeWidth="1" />
      <line x1={xl} y1={dimY + 17} x2={xl} y2={dimY + 27} stroke="#333" strokeWidth="1" />
      <line x1={xr} y1={dimY + 17} x2={xr} y2={dimY + 27} stroke="#333" strokeWidth="1" />
      <text x={(xl + xr) / 2} y={dimY + 18} textAnchor="middle" fontSize="9.5" fill="#222" fontFamily="Arial">
        {gable ? "Building Width" : `Building Length — ${g.frameZs.length - 1} bays @ ${(g.length / (g.frameZs.length - 1)).toFixed(1)} m`}
        {` (${span} m)`}
      </text>

      {/* Wall height */}
      <line x1={xl - 26} y1={GY} x2={xl - 26} y2={sy(topPts[0][1])} stroke="#333" strokeWidth="1" />
      <line x1={xl - 31} y1={GY} x2={xl - 21} y2={GY} stroke="#333" strokeWidth="1" />
      <line x1={xl - 31} y1={sy(topPts[0][1])} x2={xl - 21} y2={sy(topPts[0][1])} stroke="#333" strokeWidth="1" />
      <text
        x={xl - 36}
        y={(GY + sy(topPts[0][1])) / 2}
        textAnchor="middle"
        fontSize="9"
        fill="#333"
        fontFamily="Arial"
        transform={`rotate(-90 ${xl - 36} ${(GY + sy(topPts[0][1])) / 2})`}
      >
        {topPts[0][1].toFixed(1)} m
      </text>

      <g fontFamily="Arial" fontSize="8.5" fill="#64748B">
        <line x1={VW - 168} y1={VH - 14} x2={VW - 148} y2={VH - 14} stroke="#CC0000" strokeWidth="2" strokeDasharray="5,4" opacity=".6" />
        <text x={VW - 143} y={VH - 11}>
          Column lines (behind cladding)
        </text>
      </g>
    </svg>
  );
}

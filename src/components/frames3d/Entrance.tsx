"use client";
import type { ThreeEvent } from "@react-three/fiber";
import type { ViewMode } from "./BuildingModel";
import { DRAG_PX } from "./frames";
import type { ResolvedOpening } from "./openings";

type V3 = [number, number, number];

const TRIM = "#8E1414";
const STEEL = "#64748B";
const LEAF = "#94A3B8";

/**
 * A door in a framed opening. Local axes: X runs along the wall, Y is up and +Z points
 * out of the building, with the origin on the wall's outer face at the opening's centre.
 */
export default function Entrance({
  o,
  mode,
  shadows,
  selected,
  onPick,
}: {
  o: ResolvedOpening;
  mode: ViewMode;
  shadows: boolean;
  selected: boolean;
  onPick: (id: string) => void;
}) {
  const { width: w, height: h, kind } = o;
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > DRAG_PX) return;
    onPick(o.id);
  };

  const part = (key: string, size: V3, pos: V3, color: string) => (
    <mesh key={key} position={pos} castShadow={shadows} receiveShadow={shadows} onClick={click}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={selected ? "#F97316" : color}
        emissive={selected ? "#F97316" : "#000000"}
        emissiveIntensity={selected ? 0.35 : 0}
        roughness={0.55}
        metalness={0.25}
        wireframe={mode === "wire"}
        transparent={mode === "xray"}
        opacity={mode === "xray" ? 0.35 : 1}
      />
    </mesh>
  );

  return (
    <group>
      {/* Invisible pick target filling the opening, so the doorway itself is clickable. */}
      <mesh position={[0, h / 2, -0.06]} onClick={click}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Framed opening: two jambs and a header, flashed over the cladding. */}
      {part("jl", [0.14, h + 0.14, 0.22], [-w / 2 - 0.07, (h + 0.14) / 2, 0.02], TRIM)}
      {part("jr", [0.14, h + 0.14, 0.22], [w / 2 + 0.07, (h + 0.14) / 2, 0.02], TRIM)}
      {part("hd", [w + 0.28, 0.14, 0.22], [0, h + 0.07, 0.02], TRIM)}

      {kind === "roller" && (
        <>
          {/* Coil hood and the shutter curtain, raised most of the way. */}
          {part("hood", [w + 0.5, 0.55, 0.42], [0, h + 0.42, 0.22], STEEL)}
          {part("curtain", [w - 0.04, h * 0.16, 0.05], [0, h * 0.92, -0.04], LEAF)}
          {part("bar", [w - 0.04, 0.08, 0.1], [0, h * 0.84, -0.04], STEEL)}
          {part("gl", [0.1, h, 0.12], [-w / 2 + 0.05, h / 2, -0.03], STEEL)}
          {part("gr", [0.1, h, 0.12], [w / 2 - 0.05, h / 2, -0.03], STEEL)}
        </>
      )}

      {kind === "sliding" && (
        <>
          {/* Top track running past one side, with the leaf slid part-way open. */}
          {part("track", [w * 1.6, 0.14, 0.16], [w * 0.3, h + 0.3, 0.2], STEEL)}
          {part("leaf", [w * 0.55, h - 0.05, 0.07], [w * 0.5 - w * 0.08, (h - 0.05) / 2 + 0.03, 0.2], LEAF)}
          {[0.25, 0.5, 0.75].map((f) =>
            part(`rib${f}`, [w * 0.55, 0.05, 0.03], [w * 0.42, h * f, 0.25], STEEL)
          )}
          {part("handle", [0.06, 0.5, 0.06], [w * 0.42 - w * 0.25, 1.1, 0.27], "#1E293B")}
        </>
      )}

      {kind === "personnel" && (
        <>
          {/* Leaf hinged on the jamb and swung open outward; double leaf from 1.5 m wide. */}
          {(w >= 1.5 ? [-1, 1] : [-1]).map((side) => {
            const lw = w >= 1.5 ? w / 2 : w;
            return (
              <group
                key={side}
                position={[(side * w) / 2, 0, 0.04]}
                rotation={[0, side * 1.15, 0]}
              >
                {part(`leaf${side}`, [lw - 0.04, h - 0.04, 0.05], [(-side * lw) / 2, h / 2, 0], "#475569")}
                {part(`knob${side}`, [0.05, 0.05, 0.14], [-side * (lw - 0.12), 1.05, 0], "#E2E8F0")}
              </group>
            );
          })}
          {part("hood", [w + 0.5, 0.08, 0.6], [0, h + 0.3, 0.3], STEEL)}
        </>
      )}
    </group>
  );
}

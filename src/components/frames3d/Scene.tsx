"use client";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import BuildingModel, { type ViewMode } from "./BuildingModel";
import { computeGeometry, type Config, type PartId } from "./frames";
import type { ResolvedOpening } from "./openings";

const VIEW_DIR = new THREE.Vector3(0.78, 0.5, 1).normalize();

function CameraRig({
  bounds,
  resetKey,
  autoRotate,
}: {
  bounds: { width: number; length: number; height: number };
  resetKey: string;
  autoRotate: boolean;
}) {
  const { camera, size } = useThree();
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { width, length, height } = bounds;
  const target = useMemo(() => new THREE.Vector3(0, height * 0.42, 0), [height]);

  // Tight fit: push the camera back until every bounding-box corner is inside both frustum angles.
  const dist = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const vFov = (cam.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(size.height, 1);
    const tanV = Math.tan(vFov / 2);
    const tanH = tanV * aspect;
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), VIEW_DIR).normalize();
    const up = new THREE.Vector3().crossVectors(VIEW_DIR, right).normalize();
    const hx = width / 2 + 2.5;
    const hz = length / 2 + 2.5;
    let d = 0;
    for (const x of [-hx, hx])
      for (const y of [0, height + 1])
        for (const z of [-hz, hz]) {
          const v = new THREE.Vector3(x, y, z).sub(target);
          const depth = v.dot(VIEW_DIR);
          d = Math.max(
            d,
            depth + Math.abs(v.dot(right)) / tanH,
            depth + Math.abs(v.dot(up)) / tanV
          );
        }
    return d * 1.04;
  }, [camera, width, length, height, size.width, size.height, target]);

  useEffect(() => {
    camera.position.copy(target).addScaledVector(VIEW_DIR, dist);
    camera.updateProjectionMatrix();
    const c = controls.current;
    if (c) {
      c.target.copy(target);
      c.update();
    }
  }, [camera, dist, target, resetKey]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
      minDistance={dist * 0.25}
      maxDistance={dist * 2.4}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.04}
      makeDefault
    />
  );
}

/** Key light that casts shadows, with its shadow camera fitted to the building. */
function Sun({ radius }: { radius: number }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const cam = ref.current?.shadow.camera;
    if (!cam) return;
    const e = radius * 1.5;
    cam.left = -e;
    cam.right = e;
    cam.top = e;
    cam.bottom = -e;
    cam.near = 0.5;
    cam.far = radius * 6;
    cam.updateProjectionMatrix();
  }, [radius]);
  return (
    <directionalLight
      ref={ref}
      position={[radius, radius * 1.4, radius * 0.7]}
      intensity={2.6}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.04}
    />
  );
}

export default function Scene({
  config,
  mode,
  explode,
  selected,
  onSelect,
  showDims,
  autoRotate,
  resetKey,
  openings,
  selectedOpening,
  onSelectOpening,
}: {
  config: Config;
  mode: ViewMode;
  explode: number;
  selected: PartId | null;
  onSelect: (p: PartId | null) => void;
  showDims: boolean;
  autoRotate: boolean;
  resetKey: string;
  openings: ResolvedOpening[];
  selectedOpening: string | null;
  onSelectOpening: (id: string) => void;
}) {
  const g = computeGeometry(config);
  const radius = Math.max(g.width, g.length) * 0.95;

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 38, near: 0.5, far: 900 }}
      onPointerMissed={() => onSelect(null)}
      style={{ background: "linear-gradient(180deg,#F8FAFC 0%,#E9EEF5 55%,#DCE3EC 100%)" }}
    >
      <Suspense fallback={null}>
        <hemisphereLight args={["#FFFFFF", "#B8C2CF", 0.9]} />
        <Sun radius={radius} />
        <directionalLight position={[-radius, radius * 0.8, -radius * 0.6]} intensity={0.7} />
        <ambientLight intensity={0.3} />

        <BuildingModel
          config={config}
          mode={mode}
          explode={explode}
          selected={selected}
          onSelect={onSelect}
          showDims={showDims}
          labelFactor={Math.max(g.width, g.length) * 1.7}
          openings={openings}
          selectedOpening={selectedOpening}
          onSelectOpening={onSelectOpening}
        />

        <Grid
          position={[0, -0.29, 0]}
          args={[10, 10]}
          cellSize={2}
          cellThickness={0.6}
          cellColor="#CBD5E1"
          sectionSize={10}
          sectionThickness={1.1}
          sectionColor="#94A3B8"
          fadeDistance={radius * 4.2}
          fadeStrength={1.4}
          infiniteGrid
          followCamera={false}
        />
        <ContactShadows
          position={[0, 0.02, 0]}
          scale={radius * 2.6}
          opacity={0.35}
          blur={2.4}
          far={g.maxHeight + 6}
          resolution={512}
        />
        <CameraRig
          bounds={{ width: g.width, length: g.length, height: g.maxHeight }}
          resetKey={resetKey}
          autoRotate={autoRotate}
        />
      </Suspense>
    </Canvas>
  );
}

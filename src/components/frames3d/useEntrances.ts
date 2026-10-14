"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Geometry } from "./frames";
import {
  OPENING_KINDS,
  WALLS,
  fitOpening,
  resolveOpenings,
  type Opening,
  type OpeningKind,
  type ResolvedOpening,
  type WallId,
} from "./openings";

const wallLabel = (w: WallId) => WALLS.find((x) => x.id === w)!.label;

/**
 * Entrance state for a building: the user's openings, the ones that fit the current
 * geometry, and add / move / resize / remove actions that enforce the placement rules.
 */
export function useEntrances(geo: Geometry, initial: Opening[]) {
  const [openings, setOpenings] = useState<Opening[]>(initial);
  const [selId, setSelId] = useState<string | null>(null);
  const [addWall, setAddWall] = useState<WallId>("front");
  const [notice, setNotice] = useState<string | null>(null);
  const nextId = useRef(1);

  const resolved: ResolvedOpening[] = useMemo(() => resolveOpenings(geo, openings), [geo, openings]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const add = useCallback(
    (kind: OpeningKind) => {
      const f = fitOpening(geo, addWall, kind, 0, resolved);
      if (!f) {
        setNotice(
          `No room for a ${OPENING_KINDS[kind].label.toLowerCase()} on the ${wallLabel(addWall).toLowerCase()} — try another wall or a larger building.`
        );
        return;
      }
      const id = `d${nextId.current++}`;
      setOpenings([...resolved, { id, kind, wall: addWall, at: f.at }]);
      setSelId(id);
    },
    [geo, addWall, resolved]
  );

  const update = useCallback(
    (id: string, wall: WallId, at: number, size?: { width: number; height: number }) => {
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
    },
    [geo, resolved]
  );

  const remove = useCallback(
    (id: string) => {
      setOpenings(resolved.filter((x) => x.id !== id));
      setSelId((s) => (s === id ? null : s));
    },
    [resolved]
  );

  const reset = useCallback((list: Opening[]) => {
    setOpenings(list);
    setSelId(null);
  }, []);

  return { openings, resolved, selId, setSelId, addWall, setAddWall, notice, add, update, remove, reset };
}

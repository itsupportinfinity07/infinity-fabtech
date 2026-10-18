"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapPin, X } from "lucide-react";
import Link from "next/link";
import type { MapLocation } from "@/lib/map-types";

type ClientLocation = MapLocation;
const countOf = (l: ClientLocation) => l.clients.length + l.projects.length;
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

const BRAND = "#b91c1c";

function pinIcon(count: number, isActive: boolean) {
  const size = isActive ? 36 : 30;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${BRAND};border:2px solid #fff;box-shadow:0 0 0 ${
      isActive ? 5 : 3
    }px rgba(185,28,28,0.28),0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font:900 11px/1 system-ui,sans-serif">${count}</div>`,
  });
}

function clusterIcon(cluster: { getChildCount(): number }) {
  const n = cluster.getChildCount();
  return L.divIcon({
    className: "",
    iconSize: [44, 44],
    html: `<div style="width:44px;height:44px;border-radius:9999px;background:#1c1917;border:3px solid #fff;box-shadow:0 0 0 4px rgba(28,25,23,0.25),0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font:900 13px/1 system-ui,sans-serif">${n}</div>`,
  });
}

/** Pans/zooms the map to the selected location. */
function FlyToActive({ active }: { active: ClientLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (active) map.flyTo([active.lat, active.lng], Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [active, map]);
  return null;
}

export default function IndiaClientMap({ locations: CLIENT_LOCATIONS }: { locations: ClientLocation[] }) {
  const [active, setActive] = useState<ClientLocation | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalClients = useMemo(
    () => CLIENT_LOCATIONS.reduce((s, l) => s + countOf(l), 0),
    [CLIENT_LOCATIONS]
  );
  const bounds = useMemo(
    () => (CLIENT_LOCATIONS.length ? L.latLngBounds(CLIENT_LOCATIONS.map((l) => [l.lat, l.lng] as [number, number])) : undefined),
    [CLIENT_LOCATIONS]
  );

  const select = (loc: ClientLocation | null) => {
    setActive(loc);
    if (loc && window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
            Pan-India Presence
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-blue dark:text-white">
            PEB Steel Buildings Delivered Across India
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Click a marker to see all clients at that location. The number on each marker is the
            client count; zoom in or click a dark cluster to expand it.
          </p>
        </div>
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black text-brand-orange">{CLIENT_LOCATIONS.length}+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Locations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-brand-blue dark:text-white">{totalClients}+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clients Listed</p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 relative rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg w-full h-[460px] sm:h-[560px] lg:h-[640px] isolate">
          <MapContainer
            {...(bounds ? { bounds, boundsOptions: { padding: [40, 40] as [number, number] } } : { center: [22.97, 78.65] as [number, number], zoom: 5 })}
            minZoom={4}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
            />
            <FlyToActive active={active} />
            <MarkerClusterGroup
              chunkedLoading
              showCoverageOnHover={false}
              maxClusterRadius={45}
              iconCreateFunction={clusterIcon}
            >
              {CLIENT_LOCATIONS.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={pinIcon(countOf(loc), active?.id === loc.id)}
                  title={`${loc.city} — ${countOf(loc)} projects & clients`}
                  eventHandlers={{ click: () => select(loc) }}
                >
                  <Tooltip direction="top" offset={[0, -16]}>
                    <span className="font-bold">{loc.city}</span>
                  </Tooltip>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        {/* Side panel */}
        <div ref={panelRef} className="lg:col-span-1 flex flex-col gap-4 lg:max-h-[640px]">
          {active ? (
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-brand-orange/30 shadow-lg overflow-hidden flex flex-col">
              <div className="bg-white border-b border-slate-100 p-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-orange flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
                      {active.state}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{active.city}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {active.projects.length > 0 && `${active.projects.length} project${active.projects.length > 1 ? "s" : ""}`}
                    {active.projects.length > 0 && active.clients.length > 0 && " · "}
                    {active.clients.length > 0 && `${active.clients.length} client${active.clients.length > 1 ? "s" : ""} served`}
                  </p>
                </div>
                <button
                  onClick={() => select(null)}
                  aria-label="Close location details"
                  className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5 text-slate-600" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
                {active.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white border border-brand-orange/20 hover:border-brand-orange/50 hover:shadow-sm transition-all"
                  >
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-12 w-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                    ) : (
                      <div className="h-12 w-16 rounded-lg bg-slate-100 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 leading-snug">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{[p.type, p.year].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange flex-shrink-0">View</span>
                  </Link>
                ))}
                {active.clients.map((client, i) => {
                  const yearMatch = client.match(/^(.*?)\s*\((\d{4}(?:\s*&\s*\d{4})?)\)$/);
                  const name = yearMatch ? yearMatch[1] : client;
                  const year = yearMatch ? yearMatch[2] : null;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <p className="text-xs text-slate-700 font-medium leading-snug">
                        {name}
                      </p>
                      {year && (
                        <span className="flex-shrink-0 text-[10px] font-bold text-slate-400 tabular-nums">
                          {year}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  All Served Locations
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Click a pin or row to view clients
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                {CLIENT_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => select(loc)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-brand-orange/5 border border-transparent hover:border-brand-orange/20 transition-all group"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-brand-orange/10 group-hover:bg-brand-orange transition-colors flex items-center justify-center">
                      <MapPin className="h-3.5 w-3.5 text-brand-orange group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
                        {loc.city}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{loc.state}</p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-black text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                      {countOf(loc)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "500+", label: "Projects" },
              { value: "10+",  label: "States" },
              { value: "65%+", label: "Repeat" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 text-center"
              >
                <p className="text-base font-black text-brand-blue dark:text-white">{s.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

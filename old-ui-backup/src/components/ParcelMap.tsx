import React, { useMemo, useState } from 'react';
import {
  Layers,
  Box,
  Square,
  Clock,
  MapPin,
  AlertTriangle,
  Landmark,
  Satellite,
  Palette,
  ShieldCheck,
  Crosshair
} from 'lucide-react';
import { Parcel, StateCode } from '../types/land';
import { STATE_PROFILES } from '../data/gortGlossary';

interface ParcelMapProps {
  parcels: Parcel[];
  selectedState: StateCode;
  onSelectParcel: (parcel: Parcel) => void;
  selectedParcel: Parcel | null;
}

type LayerId = 'base' | 'rights' | 'zoning' | 'satellite' | 'integrity';

const LAYERS: { id: LayerId; label: string; sub: string; icon: React.ElementType }[] = [
  { id: 'base', label: 'Base Cadastre', sub: 'SpatialUnit', icon: Square },
  { id: 'rights', label: 'Essential Rights', sub: 'BAUnit • RRR', icon: Landmark },
  { id: 'zoning', label: 'URDPFI Zoning', sub: 'Master Plan', icon: Palette },
  { id: 'satellite', label: 'Satellite 2.5D', sub: 'Open Buildings', icon: Satellite },
  { id: 'integrity', label: 'Integrity Heatmap', sub: 'Discrepancy tint', icon: ShieldCheck }
];

const YEARS = [2004, 2014, 2019, 2024, 2026];

const VIEW_W = 760;
const VIEW_H = 520;
const PAD = 70;

const integrityColor = (score: number) => (score >= 80 ? '#2D6A4F' : score >= 50 ? '#D4A017' : '#C0392B');

export const ParcelMap: React.FC<ParcelMapProps> = ({ parcels, selectedState, onSelectParcel, selectedParcel }) => {
  const [is3D, setIs3D] = useState<boolean>(true);
  const [year, setYear] = useState<number>(2026);
  const [activeLayers, setActiveLayers] = useState<Record<LayerId, boolean>>({
    base: true,
    rights: true,
    zoning: true,
    satellite: true,
    integrity: false
  });
  const [hoverUlpin, setHoverUlpin] = useState<string | null>(null);

  const profile = STATE_PROFILES[selectedState];
  const stateParcels = useMemo(() => parcels.filter((p) => p.state === selectedState), [parcels, selectedState]);

  // Project lat/lng into SVG space (lat → y inverted, lng → x)
  const projection = useMemo(() => {
    const pts = stateParcels.flatMap((p) => p.geometry.coordinates);
    if (pts.length === 0) return null;
    const lats = pts.map((c) => c[0]);
    const lngs = pts.map((c) => c[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const scale = Math.min((VIEW_W - PAD * 2) / (maxLng - minLng || 1), (VIEW_H - PAD * 2) / (maxLat - minLat || 1));
    const offX = (VIEW_W - (maxLng - minLng) * scale) / 2;
    const offY = (VIEW_H - (maxLat - minLat) * scale) / 2;
    return (c: [number, number]): [number, number] => [offX + (c[1] - minLng) * scale, offY + (maxLat - c[0]) * scale];
  }, [stateParcels]);

  const toggleLayer = (id: LayerId) => setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  const existsInYear = (p: Parcel) => new Date(p.validFrom).getFullYear() <= year || !!p.lineage.parentUlpin;
  const isSplitChild = (p: Parcel) => !!p.lineage.splitDate && new Date(p.lineage.splitDate).getFullYear() > year;

  const fillFor = (p: Parcel) => {
    if (activeLayers.integrity) return integrityColor(p.integrityScore);
    if (activeLayers.zoning) return p.urdpfiColor;
    return '#EFEAE0';
  };

  const anomalyCount = stateParcels.filter((p) => p.plantedAnomaly).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-5 p-5 lg:p-6 overflow-auto">
      {/* Left Control Rail */}
      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <div className="saar-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono font-bold text-[#8A847C] tracking-wider">ACTIVE STATE PROFILE</p>
            <span className="badge-pill bg-[#EAF4EE] text-[#2D6A4F] border border-[#CFE5D8]">LIVE</span>
          </div>
          <h3 className="text-xl font-bold">{profile.stateName}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="saar-card-warm rounded-lg p-2">
              <p className="text-[#8A847C]">RoR Name</p>
              <p className="font-semibold text-[#141413]">{profile.recordNames.ror}</p>
            </div>
            <div className="saar-card-warm rounded-lg p-2">
              <p className="text-[#8A847C]">Units</p>
              <p className="font-semibold text-[#141413]">
                {profile.defaultUnits.name}
                {profile.defaultUnits.subdivisionName ? ` / ${profile.defaultUnits.subdivisionName}` : ''}
              </p>
            </div>
            <div className="saar-card-warm rounded-lg p-2">
              <p className="text-[#8A847C]">Parcels</p>
              <p className="font-semibold text-[#141413] font-mono">{stateParcels.length}</p>
            </div>
            <div className="saar-card-warm rounded-lg p-2">
              <p className="text-[#8A847C]">Anomalies</p>
              <p className="font-semibold text-[#C0392B] font-mono">{anomalyCount}</p>
            </div>
          </div>
        </div>

        <div className="saar-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#C45A34]" />
            <p className="text-sm font-bold">5-Layer Cadastral Stack</p>
          </div>
          <div className="space-y-1.5">
            {LAYERS.map((layer, idx) => {
              const Icon = layer.icon;
              const on = activeLayers[layer.id];
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                    on ? 'bg-[#FAF3ED] border-[#ECCFBE]' : 'bg-white border-[#EFEBE3] hover:border-[#D4CEC3]'
                  }`}
                >
                  <span className="text-[10px] font-mono text-[#A39D93] w-3">{idx + 1}</span>
                  <Icon className={`w-4 h-4 ${on ? 'text-[#C45A34]' : 'text-[#A39D93]'}`} />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold text-[#141413]">{layer.label}</span>
                    <span className="block text-[10px] font-mono text-[#8A847C]">{layer.sub}</span>
                  </span>
                  <span className={`w-8 h-4 rounded-full relative transition-colors ${on ? 'bg-[#C45A34]' : 'bg-[#E2DDD3]'}`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${on ? 'left-4.5' : 'left-0.5'}`} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="saar-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#2554C7]" />
            <p className="text-sm font-bold">Bitemporal Time Machine</p>
          </div>
          <p className="text-[11px] text-[#8A847C] mb-3">Scrub 20 years of cadastral lineage and splits.</p>
          <input
            type="range"
            min={0}
            max={YEARS.length - 1}
            value={YEARS.indexOf(year)}
            onChange={(e) => setYear(YEARS[Number(e.target.value)])}
            className="w-full accent-[#C45A34] cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`text-[10px] font-mono cursor-pointer ${y === year ? 'text-[#C45A34] font-bold' : 'text-[#A39D93]'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Map Canvas */}
      <section className="flex-1 flex flex-col saar-card rounded-2xl overflow-hidden min-h-[560px]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#EFEBE3] bg-white">
          <div>
            <h2 className="text-lg font-bold">Cadastral Plan — {stateParcels[0]?.villageOrSector ?? profile.capital}</h2>
            <p className="text-[11px] font-mono text-[#8A847C]">
              ISO 19152 LADM • {stateParcels.length} SpatialUnits • Valid-time {year}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F6F3EC] p-1 rounded-xl border border-[#E6E1D6]">
            <button
              onClick={() => setIs3D(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${!is3D ? 'btn-saar-primary' : 'text-[#635E56]'}`}
            >
              <Square className="w-3.5 h-3.5" /> 2D Orthogonal
            </button>
            <button
              onClick={() => setIs3D(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${is3D ? 'btn-saar-primary' : 'text-[#635E56]'}`}
            >
              <Box className="w-3.5 h-3.5" /> 3D Isometric
            </button>
          </div>
        </div>

        <div className="relative flex-1 architectural-grid bg-[#FAF8F5] perspective-site-plan overflow-hidden flex items-center justify-center">
          {!projection ? (
            <div className="text-center text-[#8A847C]">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No parcels onboarded for this state yet.</p>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className={`w-full h-full max-h-[620px] ${is3D ? 'isometric-building-tilt' : 'flat-site-plan'}`}
            >
              <defs>
                <radialGradient id="radar" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#C45A34" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#C45A34" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Animated radar sweep */}
              {is3D && (
                <g style={{ transformOrigin: `${VIEW_W / 2}px ${VIEW_H / 2}px` }} className="animate-spin [animation-duration:9s]">
                  <path d={`M${VIEW_W / 2} ${VIEW_H / 2} L${VIEW_W / 2} 0 A${VIEW_H / 2} ${VIEW_H / 2} 0 0 1 ${VIEW_W / 2 + 180} 40 Z`} fill="url(#radar)" />
                </g>
              )}

              {stateParcels.map((p) => {
                const pts = p.geometry.coordinates.map(projection);
                const path = `M${pts.map((pt) => pt.join(' ')).join(' L')} Z`;
                const cx = pts.reduce((s, pt) => s + pt[0], 0) / pts.length;
                const cy = pts.reduce((s, pt) => s + pt[1], 0) / pts.length;
                const selected = selectedParcel?.ulpin === p.ulpin;
                const hovered = hoverUlpin === p.ulpin;
                const present = existsInYear(p);
                const ghost = isSplitChild(p);
                const showBuilding =
                  activeLayers.satellite && is3D && p.satelliteData.detected && p.satelliteData.detectionYear <= Math.max(year, 2025) && year >= 2019;
                const extrude = showBuilding ? p.satelliteData.estimatedFloors * 9 : 0;

                return (
                  <g
                    key={p.ulpin}
                    className="cursor-pointer"
                    opacity={present ? 1 : 0.25}
                    onMouseEnter={() => setHoverUlpin(p.ulpin)}
                    onMouseLeave={() => setHoverUlpin(null)}
                    onClick={() => onSelectParcel(p)}
                  >
                    {activeLayers.base && (
                      <path
                        d={path}
                        fill={fillFor(p)}
                        fillOpacity={activeLayers.zoning || activeLayers.integrity ? (hovered || selected ? 0.75 : 0.5) : 1}
                        stroke={selected ? '#C45A34' : '#141413'}
                        strokeWidth={selected ? 3 : hovered ? 2 : 1.2}
                        strokeDasharray={ghost ? '6 4' : undefined}
                      />
                    )}

                    {/* 2.5D building extrusion */}
                    {showBuilding && (
                      <g>
                        <path
                          d={`M${pts.map(([x, y]) => `${(x - cx) * 0.55 + cx} ${(y - cy) * 0.55 + cy - extrude}`).join(' L')} Z`}
                          fill={p.satelliteData.hasBuildingPermission ? '#FFFFFF' : '#F6D5C8'}
                          stroke="#33312E"
                          strokeWidth="1"
                        />
                        {pts.map(([x, y], i) => (
                          <line
                            key={i}
                            x1={(x - cx) * 0.55 + cx}
                            y1={(y - cy) * 0.55 + cy}
                            x2={(x - cx) * 0.55 + cx}
                            y2={(y - cy) * 0.55 + cy - extrude}
                            stroke="#8A847C"
                            strokeWidth="0.8"
                          />
                        ))}
                        <text x={cx} y={cy - extrude - 8} textAnchor="middle" className="font-mono" fontSize="10" fill="#54504A">
                          G+{p.satelliteData.estimatedFloors - 1} • {p.satelliteData.heightMeters}m
                        </text>
                      </g>
                    )}

                    {/* Rights layer markers */}
                    {activeLayers.rights && (p.encumbrances.some((e) => e.status === 'ACTIVE') || p.litigation) && (
                      <g transform={`translate(${pts[1][0] - 14} ${pts[1][1] + 6})`}>
                        <rect width="22" height="16" rx="4" fill={p.litigation ? '#C0392B' : '#2554C7'} />
                        <text x="11" y="11.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
                          {p.litigation ? 'LP' : '₹'}
                        </text>
                      </g>
                    )}

                    {p.plantedAnomaly && activeLayers.integrity && (
                      <circle cx={cx} cy={cy} r="14" fill="none" stroke="#C0392B" strokeWidth="2" className="animate-pulse" />
                    )}

                    <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#141413" className="pointer-events-none">
                      {p.localSurveyNo.replace(/^(Plot No\.|Survey No\.|Khesra No\.|SCO No\.)\s*/, '').replace('-Commercial', '')}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Hover tooltip */}
          {hoverUlpin && (() => {
            const p = stateParcels.find((x) => x.ulpin === hoverUlpin);
            if (!p) return null;
            return (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-[#E2DDD3] rounded-xl px-3.5 py-2.5 shadow-md pointer-events-none">
                <p className="text-[10px] font-mono text-[#8A847C]">ULPIN {p.ulpin}</p>
                <p className="text-sm font-bold">{p.localSurveyNo}</p>
                <p className="text-xs text-[#635E56]">
                  {p.displayUnits.stateUnitValue} • {p.landUse} • Integrity {p.integrityScore}%
                </p>
              </div>
            );
          })()}

          {/* Legend */}
          <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur border border-[#E2DDD3] rounded-xl px-4 py-2 text-[11px] font-mono text-[#635E56]">
            <div className="flex flex-wrap items-center gap-3">
              {activeLayers.integrity ? (
                <>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />Clean ≥80</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]" />Review 50–79</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />Critical &lt;50</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#fbbf24]" />Residential</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />Commercial</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]" />Agricultural</span>
                </>
              )}
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-[#C0392B]" />LP = Lis Pendens</span>
            </div>
            <span className="flex items-center gap-1.5 text-[#8A847C]">
              <Crosshair className="w-3 h-3" /> Click a parcel to inspect provenance
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

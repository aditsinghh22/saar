import { useState } from 'react';
import type { MapArea, Point } from '../../api/types';
import type { PropertyReport } from '../../api/client';
import { LAND_USE_COLOR } from '../../lib/format';

export type ColorMode = 'use' | 'status';

const STATUS_COLOR = { safe: '#8CC79B', caution: '#F2C66D', risky: '#EE8E78' } as const;

const toPath = (pts: Point[]) => `M${pts.map((p) => p.join(' ')).join(' L')} Z`;

export const centroid = (pts: Point[]): Point => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];

interface Props {
  area: MapArea;
  plots: PropertyReport[];
  selectedId?: string;
  onSelect?: (p: PropertyReport) => void;
  colorBy?: ColorMode;
  className?: string;
  interactive?: boolean;
}

export function AreaMap({ area, plots, selectedId, onSelect, colorBy = 'use', className = '', interactive = true }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const hovered = plots.find((p) => p.id === hover);

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 ${area.width} ${area.height}`} className="h-full w-full" role="img" aria-label={`Map of ${area.name}`}>
        <defs>
          <pattern id={`grid-${area.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#1B1A16" strokeOpacity="0.045" />
          </pattern>
          <pattern id={`trees-${area.id}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="2.2" fill="#9DBF8A" />
          </pattern>
          <pattern id={`waves-${area.id}`} width="24" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 5 Q6 1 12 5 T24 5" fill="none" stroke="#9EC0D8" strokeWidth="1.2" />
          </pattern>
        </defs>

        <rect width={area.width} height={area.height} fill="#F1EDE3" />
        <rect width={area.width} height={area.height} fill={`url(#grid-${area.id})`} />

        {area.water?.map((w, i) => (
          <g key={i}>
            <path d={toPath(w)} fill="#D6E6F0" />
            <path d={toPath(w)} fill={`url(#waves-${area.id})`} />
          </g>
        ))}
        {area.greens.map((g, i) => (
          <g key={i}>
            <path d={toPath(g)} fill="#DCE9CF" stroke="#C3D6AE" />
            <path d={toPath(g)} fill={`url(#trees-${area.id})`} opacity="0.6" />
          </g>
        ))}

        {area.roads.map((r, i) => (
          <g key={i}>
            <path d={r.d} fill="none" stroke="#FFFFFF" strokeWidth={r.width} strokeLinecap="square" />
            {r.width > 20 && <path d={r.d} fill="none" stroke="#E0D8C8" strokeWidth="1.5" strokeDasharray="10 10" />}
          </g>
        ))}
        {area.roads.map(
          (r, i) =>
            r.label &&
            r.labelAt && (
              <text
                key={`l${i}`}
                x={r.labelAt[0]}
                y={r.labelAt[1]}
                textAnchor="middle"
                className="fill-faint font-mono text-[10px] uppercase tracking-[0.1em]"
                transform={r.d.includes('V') && !r.d.includes('H') ? `rotate(-90 ${r.labelAt[0]} ${r.labelAt[1]})` : undefined}
              >
                {r.label}
              </text>
            ),
        )}

        {area.others.map((o, i) => (
          <path key={i} d={toPath(o)} fill="#E7E1D4" stroke="#D6CEBE" strokeWidth="1" />
        ))}

        {plots.map((p) => {
          const selected = p.id === selectedId;
          const isHover = p.id === hover;
          const fill = colorBy === 'use' ? LAND_USE_COLOR[p.landUse] : STATUS_COLOR[p.verdict];
          const [cx, cy] = centroid(p.shape);
          return (
            <g
              key={p.id}
              className={interactive ? 'cursor-pointer' : ''}
              onMouseEnter={() => interactive && setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(p)}
            >
              <path
                d={toPath(p.shape)}
                fill={fill}
                fillOpacity={selected || isHover ? 1 : 0.82}
                stroke="#1B1A16"
                strokeWidth={selected ? 3 : isHover ? 2 : 1}
                style={{ transition: 'all 200ms ease' }}
              />
              {p.verdict === 'risky' && colorBy === 'use' && (
                <circle cx={p.shape[1][0] - 10} cy={p.shape[1][1] + 10} r="5" fill="#C2412D" stroke="#fff" strokeWidth="2" />
              )}
              <text x={cx} y={cy + 4} textAnchor="middle" className="pointer-events-none fill-ink font-display text-[12px] font-semibold">
                {p.plotNo.replace(/^(House|Shop|Plot|Survey|Khesra) /, '')}
              </text>
            </g>
          );
        })}

        <g transform={`translate(${area.width - 44} 40)`}>
          <circle r="18" fill="#fff" stroke="#DDD5C6" />
          <path d="M0 -11 L5 4 L0 1 L-5 4 Z" fill="#1B1A16" />
          <text y="15" textAnchor="middle" className="fill-mute font-mono text-[8px]">N</text>
        </g>
      </svg>

      {hovered && interactive && (
        <div className="pointer-events-none absolute left-4 top-4 animate-fade rounded-xl border border-line bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold">{hovered.plotNo}</p>
          <p className="text-xs text-mute">
            {hovered.type} · {hovered.areaSqm.toLocaleString('en-IN')} m² · {hovered.areaLocal}
          </p>
        </div>
      )}
    </div>
  );
}

export function MapLegend({ mode }: { mode: ColorMode }) {
  const items =
    mode === 'use'
      ? Object.entries(LAND_USE_COLOR).slice(0, 3).map(([k, c]) => [k === 'Farming' ? 'Farm land' : k, c])
      : [
          ['Clean record', STATUS_COLOR.safe],
          ['Check before you buy', STATUS_COLOR.caution],
          ['Problems found', STATUS_COLOR.risky],
        ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-2">
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="size-3 rounded-[4px] border border-ink/20" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

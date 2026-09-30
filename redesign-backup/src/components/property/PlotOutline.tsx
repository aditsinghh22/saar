import type { Point } from '../../api/types';

/** Architectural drawing of a single plot boundary with edge lengths. */
export function PlotOutline({ shape, areaSqm, className = '' }: { shape: Point[]; areaSqm: number; className?: string }) {
  const xs = shape.map((p) => p[0]);
  const ys = shape.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const size = 260;
  const pad = 46;
  const scale = (size - pad * 2) / Math.max(w, h);
  const pts = shape.map(([x, y]) => [pad + (x - minX) * scale + ((size - pad * 2) - w * scale) / 2, pad + (y - minY) * scale + ((size - pad * 2) - h * scale) / 2]);

  // Real-world scale: map drawing units so the polygon area matches the recorded area.
  const polyArea = Math.abs(shape.reduce((s, [x, y], i) => {
    const [nx, ny] = shape[(i + 1) % shape.length];
    return s + (x * ny - nx * y);
  }, 0)) / 2;
  const metersPerUnit = Math.sqrt(areaSqm / polyArea);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-label="Plot boundary drawing">
      <rect width={size} height={size} fill="none" />
      <path d={`M${pts.map((p) => p.join(' ')).join(' L')} Z`} fill="#DDF08A" fillOpacity="0.55" stroke="#1B1A16" strokeWidth="1.8" />
      {pts.map(([x, y], i) => {
        const [nx, ny] = pts[(i + 1) % pts.length];
        const [ox, oy] = shape[i];
        const [onx, ony] = shape[(i + 1) % shape.length];
        const len = Math.hypot(onx - ox, ony - oy) * metersPerUnit;
        const mx = (x + nx) / 2;
        const my = (y + ny) / 2;
        const angle = (Math.atan2(ny - y, nx - x) * 180) / Math.PI;
        const nxv = -(ny - y);
        const nyv = nx - x;
        const nl = Math.hypot(nxv, nyv) || 1;
        const cx = size / 2;
        const cy = size / 2;
        const sign = (mx - cx) * nxv + (my - cy) * nyv > 0 ? 1 : -1;
        const lx = mx + (nxv / nl) * 16 * sign;
        const ly = my + (nyv / nl) * 16 * sign;
        const upright = angle > 90 || angle < -90 ? angle + 180 : angle;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="#fff" stroke="#1B1A16" strokeWidth="1.5" />
            <text x={lx} y={ly + 3} textAnchor="middle" transform={`rotate(${upright} ${lx} ${ly})`} className="fill-ink-2 font-mono text-[10px]">
              {len.toFixed(1)} m
            </text>
          </g>
        );
      })}
    </svg>
  );
}

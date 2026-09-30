import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
  Send,
  Search,
  Satellite,
  FileClock,
  Ruler,
  Gavel,
  Banknote,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { Parcel, PlantedAnomaly } from '../types/land';

interface IntegrityEngineProps {
  parcels: Parcel[];
  onInspectParcel: (parcel: Parcel) => void;
}

const ANOMALY_META: Record<PlantedAnomaly['type'], { label: string; icon: React.ElementType; rule: string }> = {
  UNASSESSED_CONSTRUCTION: {
    label: 'Satellite Unassessed Construction',
    icon: Satellite,
    rule: 'SELECT ulpin FROM parcels p JOIN sat_buildings s ON ST_Intersects(p.geom, s.geom)\nWHERE s.floors * s.footprint > p.tax_assessed_area * 1.2;'
  },
  ZOMBIE_MUTATION: {
    label: 'Zombie Mutation',
    icon: FileClock,
    rule: "SELECT d.ulpin FROM deeds d LEFT JOIN ror r ON r.ulpin = d.ulpin AND r.owner = d.buyer\nWHERE r.owner IS NULL AND d.registered < now() - interval '90 days';"
  },
  AREA_MISMATCH: {
    label: 'Cadastral Boundary Mismatch',
    icon: Ruler,
    rule: 'SELECT ulpin FROM ror r JOIN parcels p USING (ulpin)\nWHERE abs(r.recorded_area - ST_Area(p.geom::geography)) / ST_Area(p.geom::geography) > 0.05;'
  },
  LIS_PENDENS_VIOLATION: {
    label: 'Lis Pendens Violation',
    icon: Gavel,
    rule: 'SELECT d.ulpin FROM deeds d JOIN court_orders c USING (ulpin)\nWHERE c.stay_active AND d.registered BETWEEN c.order_date AND coalesce(c.vacated, now());'
  },
  UNREGISTERED_MORTGAGE: {
    label: 'CERSAI Lien Conflict',
    icon: Banknote,
    rule: "SELECT c.ulpin FROM cersai_charges c LEFT JOIN state_ec e USING (ulpin, charge_ref)\nWHERE e.charge_ref IS NULL AND c.status = 'ACTIVE';"
  }
};

type NoticeState = Record<string, { dispatchedAt: string; officer: string }>;

const inr = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`);

export const IntegrityEngine: React.FC<IntegrityEngineProps> = ({ parcels, onInspectParcel }) => {
  const [notices, setNotices] = useState<NoticeState>({});
  const [filter, setFilter] = useState<'ALL' | PlantedAnomaly['type']>('ALL');
  const [showRuleFor, setShowRuleFor] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<string>('2026-09-28 02:00 IST');

  const flagged = useMemo(() => parcels.filter((p) => p.plantedAnomaly), [parcels]);
  const visible = filter === 'ALL' ? flagged : flagged.filter((p) => p.plantedAnomaly!.type === filter);

  const totalLeakage = flagged.reduce((s, p) => s + p.plantedAnomaly!.financialImpactInr, 0);
  const annualLeakage = flagged
    .filter((p) => ['UNASSESSED_CONSTRUCTION', 'ZOMBIE_MUTATION', 'AREA_MISMATCH'].includes(p.plantedAnomaly!.type))
    .reduce((s, p) => s + p.plantedAnomaly!.financialImpactInr, 0);
  const avgIntegrity = Math.round(parcels.reduce((s, p) => s + p.integrityScore, 0) / (parcels.length || 1));

  const dispatch = (p: Parcel) => {
    const officer = p.plantedAnomaly!.responsibleDepartment;
    setNotices((prev) => ({ ...prev, [p.ulpin]: { dispatchedAt: new Date().toLocaleString('en-IN'), officer } }));
  };

  const rescan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setLastScan(new Date().toLocaleString('en-IN'));
    }, 1800);
  };

  return (
    <div className="flex-1 overflow-auto p-5 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold text-[#C45A34] tracking-wider">MAKE DISAGREEMENT THE PRODUCT</p>
          <h1 className="text-3xl font-bold mt-1">Record Integrity & Revenue Leakage</h1>
          <p className="text-sm text-[#635E56] mt-1">Spatial SQL rules cross-reconcile every departmental silo nightly.</p>
        </div>
        <button onClick={rescan} className="btn-saar-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
          <Search className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} /> {scanning ? 'Reconciling 8 silos…' : 'Run reconciliation'}
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <div className="saar-card rounded-2xl p-5">
          <AlertTriangle className="w-5 h-5 text-[#C0392B]" />
          <p className="text-3xl font-bold mt-3">{flagged.length}</p>
          <p className="text-xs text-[#8A847C]">Anomaly vectors detected</p>
        </div>
        <div className="rounded-2xl p-5 bg-[#141413] text-white">
          <IndianRupee className="w-5 h-5 text-[#F0A37F]" />
          <p className="text-3xl font-bold mt-3 text-white">{inr(annualLeakage)}<span className="text-sm text-white/60">/yr</span></p>
          <p className="text-xs text-white/60">Recoverable revenue leakage</p>
        </div>
        <div className="saar-card rounded-2xl p-5">
          <Banknote className="w-5 h-5 text-[#2554C7]" />
          <p className="text-3xl font-bold mt-3">{inr(totalLeakage)}</p>
          <p className="text-xs text-[#8A847C]">Total exposure incl. credit risk</p>
        </div>
        <div className="saar-card rounded-2xl p-5">
          <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
          <p className="text-3xl font-bold mt-3">{avgIntegrity}%</p>
          <p className="text-xs text-[#8A847C]">Mean integrity score • scan {lastScan}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${filter === 'ALL' ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white border-[#E2DDD3] text-[#635E56]'}`}
        >
          All vectors ({flagged.length})
        </button>
        {(Object.keys(ANOMALY_META) as PlantedAnomaly['type'][]).map((t) => {
          const Icon = ANOMALY_META[t].icon;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${filter === t ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white border-[#E2DDD3] text-[#635E56]'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {ANOMALY_META[t].label}
            </button>
          );
        })}
      </div>

      {/* Actionable Worklist */}
      <div className="mt-4 space-y-3">
        {visible.map((p) => {
          const a = p.plantedAnomaly!;
          const meta = ANOMALY_META[a.type];
          const Icon = meta.icon;
          const notice = notices[p.ulpin];
          return (
            <div key={p.ulpin} className="saar-card rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FBEDE9] border border-[#F0C9BF] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#C0392B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-pill bg-[#FBEDE9] text-[#C0392B] border border-[#F0C9BF]">{meta.label}</span>
                    <span className="text-[11px] font-mono text-[#8A847C]">ULPIN {p.ulpin}</span>
                    <span className="text-[11px] font-mono text-[#8A847C]">• Integrity {p.integrityScore}</span>
                  </div>
                  <p className="font-bold mt-2">{a.title}</p>
                  <p className="text-sm text-[#635E56] mt-1">{a.description}</p>
                  <p className="text-xs mt-2">
                    <span className="text-[#8A847C]">Recommended:</span> {a.recommendedAction}
                  </p>
                  <button onClick={() => setShowRuleFor(showRuleFor === p.ulpin ? null : p.ulpin)} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#2554C7] cursor-pointer">
                    <Code2 className="w-3.5 h-3.5" /> {showRuleFor === p.ulpin ? 'Hide' : 'Show'} detection rule
                  </button>
                  {showRuleFor === p.ulpin && (
                    <pre className="mt-2 text-[11px] bg-[#141413] text-[#E8E4DA] rounded-lg p-3 overflow-x-auto">{meta.rule}</pre>
                  )}
                </div>
                <div className="lg:w-56 shrink-0 flex flex-col gap-2 lg:items-end">
                  <p className="text-xl font-bold text-[#C0392B]">{a.financialImpactInr ? inr(a.financialImpactInr) : 'Legal risk'}</p>
                  <p className="text-[11px] text-[#8A847C] lg:text-right">{a.responsibleDepartment}</p>
                  {notice ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Notice sent {notice.dispatchedAt}
                    </span>
                  ) : (
                    <button onClick={() => dispatch(p)} className="btn-saar-terracotta flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                      <Send className="w-3.5 h-3.5" /> Dispatch notice
                    </button>
                  )}
                  <button onClick={() => onInspectParcel(p)} className="btn-saar-secondary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                    Inspect on map
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

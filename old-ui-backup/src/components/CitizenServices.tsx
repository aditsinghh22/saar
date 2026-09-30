import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building,
  QrCode,
  ScanLine,
  Fingerprint,
  Lock,
  Download
} from 'lucide-react';
import { Parcel } from '../types/land';
import { ThreeDEnvelopeViewer } from './ThreeDEnvelopeViewer';

interface CitizenServicesProps {
  parcels: Parcel[];
}

type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

interface AuditCheck {
  label: string;
  status: CheckStatus;
  detail: string;
}

function runTitleAudit(p: Parcel): AuditCheck[] {
  const latestDeed = p.deeds[p.deeds.length - 1];
  const ownerMatchesDeed = !latestDeed || p.owners.some((o) => o.name.startsWith(latestDeed.buyerName));
  const activeCharges = p.encumbrances.filter((e) => e.status === 'ACTIVE');
  const areaGap = Math.abs(p.tax.assessedAreaSqm - p.areaSqm) / p.areaSqm;
  return [
    {
      label: 'RoR owner matches last registered deed',
      status: ownerMatchesDeed ? 'PASS' : 'FAIL',
      detail: ownerMatchesDeed ? 'Mutation is up to date.' : `Deed ${latestDeed?.deedNumber} names ${latestDeed?.buyerName}, RoR not mutated.`
    },
    {
      label: 'No active court stay (Lis Pendens)',
      status: p.litigation?.stayOrderActive ? 'FAIL' : 'PASS',
      detail: p.litigation ? `${p.litigation.caseNumber} — ${p.litigation.courtName}` : 'No pending litigation on eCourts.'
    },
    {
      label: 'Encumbrances disclosed in state EC',
      status: p.plantedAnomaly?.type === 'UNREGISTERED_MORTGAGE' ? 'FAIL' : activeCharges.length ? 'WARN' : 'PASS',
      detail: activeCharges.length
        ? activeCharges.map((e) => `${e.institution} ₹${e.amountInr.toLocaleString('en-IN')}`).join('; ')
        : 'No active charges.'
    },
    {
      label: 'Recorded area matches surveyed polygon',
      status: p.plantedAnomaly?.type === 'AREA_MISMATCH' ? 'FAIL' : areaGap > 0.05 && p.landUse !== 'Residential' ? 'WARN' : 'PASS',
      detail: p.plantedAnomaly?.type === 'AREA_MISMATCH' ? 'Patta exceeds FMB polygon by 15.7%.' : `${p.areaSqm} m² surveyed.`
    },
    {
      label: 'Property tax paid, no arrears',
      status: p.tax.paymentStatus === 'DEFAULTED' ? 'FAIL' : p.tax.paymentStatus === 'PENDING' ? 'WARN' : 'PASS',
      detail: p.tax.arrearsInr ? `Arrears ₹${p.tax.arrearsInr.toLocaleString('en-IN')}` : `Last paid ${p.tax.lastPaidDate ?? '—'}`
    },
    {
      label: 'Construction matches building permission',
      status: p.satelliteData.detected && !p.satelliteData.hasBuildingPermission ? 'FAIL' : 'PASS',
      detail: p.satelliteData.detected
        ? p.satelliteData.hasBuildingPermission ? `Permit ${p.satelliteData.permissionNumber}` : `${p.satelliteData.estimatedFloors} floors without permission`
        : 'No structure detected.'
    }
  ];
}

const STATUS_STYLE: Record<CheckStatus, { icon: React.ElementType; cls: string }> = {
  PASS: { icon: CheckCircle2, cls: 'text-[#2D6A4F]' },
  WARN: { icon: AlertTriangle, cls: 'text-[#B7791F]' },
  FAIL: { icon: XCircle, cls: 'text-[#C0392B]' }
};

// Deterministic pseudo-QR pattern from a string
const QrPattern: React.FC<{ seed: string }> = ({ seed }) => {
  const size = 25;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h >> 16) % 2 === 0);
  }
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        if (finder(x, y)) return null;
        return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#141413" /> : null;
      })}
      {[[0, 0], [size - 7, 0], [0, size - 7]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="7" height="7" fill="#141413" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#141413" />
        </g>
      ))}
    </svg>
  );
};

export const CitizenServices: React.FC<CitizenServicesProps> = ({ parcels }) => {
  const [ulpin, setUlpin] = useState<string>(parcels[0]?.ulpin ?? '');
  const parcel = parcels.find((p) => p.ulpin === ulpin) ?? parcels[0];

  const [floors, setFloors] = useState<number>(3);
  const [frontSetback, setFrontSetback] = useState<number>(3);

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [zkName, setZkName] = useState<string>('');
  const [zkResult, setZkResult] = useState<'match' | 'nomatch' | null>(null);

  const checks = useMemo(() => (parcel ? runTitleAudit(parcel) : []), [parcel]);
  const verdict: 'GREEN' | 'AMBER' | 'RED' = checks.some((c) => c.status === 'FAIL') ? 'RED' : checks.some((c) => c.status === 'WARN') ? 'AMBER' : 'GREEN';

  if (!parcel) return null;

  const coverage = 0.62;
  const footprint = parcel.areaSqm * coverage * Math.max(0.5, 1 - frontSetback * 0.04);
  const gfa = footprint * floors;
  const far = gfa / parcel.areaSqm;
  const maxFar = parcel.landUse === 'Commercial' ? 3.0 : parcel.landUse === 'Agricultural' ? 0.1 : 1.75;

  const verifyScan = () => {
    setScanState('scanning');
    setTimeout(() => setScanState('verified'), 1600);
  };

  const zkVerify = () => {
    const q = zkName.trim().toLowerCase();
    if (!q) return;
    setZkResult(parcel.owners.some((o) => o.name.toLowerCase().includes(q)) ? 'match' : 'nomatch');
  };

  const verdictStyle = {
    GREEN: { bg: 'bg-[#EAF4EE] border-[#CFE5D8]', text: 'text-[#2D6A4F]', label: 'Title appears safe', icon: ShieldCheck },
    AMBER: { bg: 'bg-[#FDF6E3] border-[#F2E0B0]', text: 'text-[#B7791F]', label: 'Proceed with caution', icon: AlertTriangle },
    RED: { bg: 'bg-[#FBEDE9] border-[#F0C9BF]', text: 'text-[#C0392B]', label: 'Do not proceed', icon: ShieldAlert }
  }[verdict];
  const VerdictIcon = verdictStyle.icon;

  return (
    <div className="flex-1 overflow-auto p-5 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] font-mono font-bold text-[#C45A34] tracking-wider">BEFORE YOU BUY • BEFORE YOU BUILD</p>
          <h1 className="text-3xl font-bold mt-1">Citizen Statutory Intelligence</h1>
        </div>
        <select
          value={ulpin}
          onChange={(e) => {
            setUlpin(e.target.value);
            setZkResult(null);
            setScanState('idle');
          }}
          className="bg-white border border-[#E2DDD3] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-xs cursor-pointer"
        >
          {parcels.map((p) => (
            <option key={p.ulpin} value={p.ulpin}>{p.localSurveyNo} — {p.villageOrSector}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Title Due Diligence */}
        <section className="saar-card rounded-2xl p-6">
          <h2 className="text-lg font-bold">Title Due-Diligence Certificate</h2>
          <p className="text-xs text-[#8A847C] font-mono">6-point statutory audit • ULPIN {parcel.ulpin}</p>
          <div className={`mt-4 rounded-xl border p-4 flex items-center gap-3 ${verdictStyle.bg}`}>
            <VerdictIcon className={`w-8 h-8 ${verdictStyle.text}`} />
            <div>
              <p className={`text-lg font-bold ${verdictStyle.text}`}>{verdict} — {verdictStyle.label}</p>
              <p className="text-xs text-[#635E56]">{checks.filter((c) => c.status === 'PASS').length} of 6 checks passed</p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-[#EFEBE3]">
            {checks.map((c) => {
              const s = STATUS_STYLE[c.status];
              const Icon = s.icon;
              return (
                <li key={c.label} className="py-3 flex gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.cls}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-xs text-[#635E56]">{c.detail}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${s.cls}`}>{c.status}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3D Buildable Envelope */}
        <section className="saar-card rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C45A34]" />
            <h2 className="text-lg font-bold">3D Buildable Envelope Simulator</h2>
          </div>
          <p className="text-xs text-[#8A847C] font-mono mb-4">{parcel.zoningCode} • plot {parcel.areaSqm} m²</p>
          <ThreeDEnvelopeViewer floors={floors} frontSetback={frontSetback} parcelArea={parcel.areaSqm} />
          <div className="grid grid-cols-2 gap-5 mt-5">
            <label className="text-xs font-bold text-[#54504A]">
              Permissible floors: <span className="text-[#C45A34]">G+{floors}</span>
              <input type="range" min={1} max={4} value={floors} onChange={(e) => setFloors(Number(e.target.value))} className="w-full accent-[#C45A34] mt-2 cursor-pointer" />
            </label>
            <label className="text-xs font-bold text-[#54504A]">
              Front road setback: <span className="text-[#C45A34]">{frontSetback} m</span>
              <input type="range" min={1} max={6} step={0.5} value={frontSetback} onChange={(e) => setFrontSetback(Number(e.target.value))} className="w-full accent-[#C45A34] mt-2 cursor-pointer" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="saar-card-warm rounded-xl p-3">
              <p className="text-[10px] text-[#8A847C]">Footprint</p>
              <p className="font-bold">{footprint.toFixed(0)} m²</p>
            </div>
            <div className="saar-card-warm rounded-xl p-3">
              <p className="text-[10px] text-[#8A847C]">Gross Floor Area</p>
              <p className="font-bold">{gfa.toFixed(0)} m²</p>
            </div>
            <div className={`rounded-xl p-3 border ${far > maxFar ? 'bg-[#FBEDE9] border-[#F0C9BF]' : 'bg-[#EAF4EE] border-[#CFE5D8]'}`}>
              <p className="text-[10px] text-[#8A847C]">FAR (max {maxFar})</p>
              <p className={`font-bold ${far > maxFar ? 'text-[#C0392B]' : 'text-[#2D6A4F]'}`}>{far.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* Verifiable Credential */}
        <section className="saar-card rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C45A34]" />
            <h2 className="text-lg font-bold">Verifiable Title Credential</h2>
          </div>
          <p className="text-xs text-[#8A847C] font-mono">W3C VC • Ed25519 signature • works offline</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-5">
            <div className="w-40 h-40 shrink-0 p-2 bg-white border border-[#E2DDD3] rounded-xl relative overflow-hidden">
              <QrPattern seed={parcel.ulpin + verdict} />
              {scanState === 'scanning' && <div className="absolute inset-x-0 h-0.5 bg-[#C45A34] shadow-[0_0_12px_#C45A34] animate-bounce top-1/2" />}
            </div>
            <div className="flex-1 text-xs space-y-1.5">
              <p><span className="text-[#8A847C]">Subject:</span> <span className="font-mono">did:landstack:{parcel.ulpin}</span></p>
              <p><span className="text-[#8A847C]">Issuer:</span> DoLR National Land Stack</p>
              <p><span className="text-[#8A847C]">Verdict:</span> <strong className={verdictStyle.text}>{verdict}</strong></p>
              <p><span className="text-[#8A847C]">Issued:</span> {new Date().toISOString().slice(0, 10)}</p>
              <p className="font-mono text-[10px] text-[#8A847C] break-all">sig: z3u2{parcel.ulpin.slice(-6)}Kq9vR…ed25519</p>
              <div className="flex gap-2 pt-2">
                <button onClick={verifyScan} className="btn-saar-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                  <ScanLine className="w-3.5 h-3.5" /> Simulate offline scan
                </button>
                <button className="btn-saar-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
              {scanState === 'verified' && (
                <p className="flex items-center gap-1.5 text-[#2D6A4F] font-semibold pt-1">
                  <CheckCircle2 className="w-4 h-4" /> Signature valid — issued by DoLR, not revoked.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Zero-Knowledge Ownership Verification */}
        <section className="saar-card rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-[#C45A34]" />
            <h2 className="text-lg font-bold">Zero-Knowledge Seller Verification</h2>
          </div>
          <p className="text-xs text-[#8A847C]">
            Check the seller is the recorded owner without seeing the owner’s identity. DPDP Act 2023 compliant.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={zkName}
              onChange={(e) => {
                setZkName(e.target.value);
                setZkResult(null);
              }}
              placeholder="Name on the seller’s ID"
              className="flex-1 bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm"
            />
            <button onClick={zkVerify} className="btn-saar-terracotta flex items-center gap-1.5 px-4 rounded-xl text-sm font-bold cursor-pointer">
              <Lock className="w-4 h-4" /> Prove
            </button>
          </div>
          {zkResult && (
            <div className={`mt-4 rounded-xl p-4 text-sm ${zkResult === 'match' ? 'bg-[#EAF4EE] text-[#2D6A4F]' : 'bg-[#FBEDE9] text-[#C0392B]'}`}>
              {zkResult === 'match'
                ? 'MATCH — the seller is a recorded owner of this parcel. No personal data was disclosed.'
                : 'NO MATCH — this person is not on the Record of Rights. Ask for a mutation extract.'}
            </div>
          )}
          <div className="mt-4 saar-card-warm rounded-xl p-3 text-[11px] font-mono text-[#635E56]">
            Owners on record: {parcel.owners.map((o) => o.maskedName).join(', ')}
          </div>
        </section>
      </div>
    </div>
  );
};

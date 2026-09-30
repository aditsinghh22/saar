import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Landmark,
  Gavel,
  Receipt,
  Satellite,
  Database,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Send,
  GitBranch,
  Clock
} from 'lucide-react';
import { Parcel, Provenance } from '../types/land';

interface ParcelDetailDrawerProps {
  parcel: Parcel | null;
  onClose: () => void;
  onActionClick: (action: string, parcel: Parcel) => void;
}

type Section = 'ror' | 'deeds' | 'charges' | 'tax' | 'satellite' | 'provenance';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const ProvenanceChip: React.FC<{ p?: Provenance }> = ({ p }) => {
  if (!p) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-[#8A847C] border-t border-dashed border-[#E2DDD3] pt-2">
      <span className="flex items-center gap-1">
        <Database className="w-3 h-3" /> {p.sourceSystem}
      </span>
      <span>#{p.recordId}</span>
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" /> {p.lastSynced}
      </span>
      {p.verified ? (
        <span className="flex items-center gap-1 text-[#2D6A4F]"><CheckCircle2 className="w-3 h-3" /> Verified</span>
      ) : (
        <span className="flex items-center gap-1 text-[#C0392B]"><XCircle className="w-3 h-3" /> Conflict</span>
      )}
    </div>
  );
};

export const ParcelDetailDrawer: React.FC<ParcelDetailDrawerProps> = ({ parcel, onClose, onActionClick }) => {
  const [section, setSection] = useState<Section>('ror');
  const [revealNames, setRevealNames] = useState<boolean>(false);

  if (!parcel) return null;

  const scoreColor = parcel.integrityScore >= 80 ? '#2D6A4F' : parcel.integrityScore >= 50 ? '#D4A017' : '#C0392B';
  const sections: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'ror', label: 'RoR', icon: Landmark },
    { id: 'deeds', label: 'Deeds', icon: FileText },
    { id: 'charges', label: 'Charges', icon: Gavel },
    { id: 'tax', label: 'Tax', icon: Receipt },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
    { id: 'provenance', label: 'Sources', icon: Database }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-[#141413]/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#FAF8F5] border-l border-[#E2DDD3] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#E4DFD5] px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-[#C45A34] tracking-wider">ULPIN • BHU-AADHAR</p>
              <p className="font-mono text-sm font-bold text-[#141413]">{parcel.ulpin}</p>
              <h2 className="text-2xl font-bold mt-1">{parcel.localSurveyNo}</h2>
              <p className="text-xs text-[#635E56]">
                {parcel.villageOrSector}, {parcel.talukOrTehsil}, {parcel.district}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F0E8] cursor-pointer" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="saar-card-warm rounded-xl p-2.5">
              <p className="text-[10px] text-[#8A847C]">Area</p>
              <p className="text-sm font-bold">{parcel.areaSqm.toLocaleString('en-IN')} m²</p>
              <p className="text-[10px] text-[#8A847C] truncate">{parcel.displayUnits.stateUnitValue}</p>
            </div>
            <div className="saar-card-warm rounded-xl p-2.5">
              <p className="text-[10px] text-[#8A847C]">Zoning</p>
              <p className="text-sm font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: parcel.urdpfiColor }} />
                {parcel.landUse}
              </p>
              <p className="text-[10px] text-[#8A847C] truncate">{parcel.zoningCode}</p>
            </div>
            <div className="saar-card-warm rounded-xl p-2.5">
              <p className="text-[10px] text-[#8A847C]">Integrity</p>
              <p className="text-sm font-bold" style={{ color: scoreColor }}>{parcel.integrityScore}/100</p>
              <div className="h-1 rounded-full bg-[#E2DDD3] mt-1.5">
                <div className="h-full rounded-full" style={{ width: `${parcel.integrityScore}%`, background: scoreColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Banner */}
        {parcel.plantedAnomaly && (
          <div className="mx-6 mt-4 rounded-xl border border-[#F0C9BF] bg-[#FBEDE9] p-4">
            <div className="flex items-center gap-2 text-[#C0392B]">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs font-bold font-mono tracking-wide">{parcel.plantedAnomaly.type.replace(/_/g, ' ')}</p>
            </div>
            <p className="text-sm font-bold mt-1.5">{parcel.plantedAnomaly.title}</p>
            <p className="text-xs text-[#635E56] mt-1">{parcel.plantedAnomaly.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-mono text-[#C0392B] font-bold">
                {parcel.plantedAnomaly.financialImpactInr > 0 ? `Impact ${inr(parcel.plantedAnomaly.financialImpactInr)}` : 'Legal risk'}
              </span>
              <button
                onClick={() => onActionClick('DISPATCH_WORKFLOW', parcel)}
                className="btn-saar-terracotta flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch to Worklist
              </button>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="px-6 mt-4 flex gap-1 overflow-x-auto">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
                  section === s.id ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white text-[#635E56] border-[#E2DDD3] hover:text-[#141413]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Section Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {section === 'ror' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#54504A]">Owners (Party + Right)</p>
                <button
                  onClick={() => setRevealNames(!revealNames)}
                  className="flex items-center gap-1 text-[11px] text-[#C45A34] font-bold cursor-pointer"
                >
                  {revealNames ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {revealNames ? 'Mask (DPDP)' : 'Reveal (officer)'}
                </button>
              </div>
              {parcel.owners.map((o) => (
                <div key={o.id} className="saar-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">{revealNames ? o.name : o.maskedName}</p>
                    <span className="badge-pill bg-[#F4F0E8] text-[#54504A] border border-[#E2DDD3]">
                      {o.shareNumerator}/{o.shareDenominator} • {o.sharePercentage}%
                    </span>
                  </div>
                  {o.relationType && (
                    <p className="text-xs text-[#635E56] mt-1">
                      {o.relationType} {revealNames ? o.relativeName : '••••••'}
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-[#8A847C] mt-2">Aadhaar VID token: {o.aadhaarToken}</p>
                </div>
              ))}
              <ProvenanceChip p={parcel.provenance.ror} />
              {(parcel.lineage.parentUlpin || parcel.lineage.childrenUlpins) && (
                <div className="saar-card-warm rounded-xl p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-bold text-[#54504A]"><GitBranch className="w-3.5 h-3.5" /> Cadastral Lineage</p>
                  {parcel.lineage.parentUlpin && (
                    <p className="mt-1 font-mono text-[#635E56]">
                      Parent {parcel.lineage.parentUlpin} → split {parcel.lineage.splitDate}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {section === 'deeds' && (
            <>
              {parcel.deeds.length === 0 && <p className="text-sm text-[#8A847C]">No registered deeds — title by inheritance / settlement.</p>}
              {parcel.deeds.map((d) => (
                <div key={d.deedNumber} className="saar-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-bold">{d.deedNumber}</p>
                    <span className="text-[11px] text-[#8A847C]">{d.registrationDate}</span>
                  </div>
                  <p className="text-xs text-[#635E56] mt-1">{d.subRegistrarOffice}</p>
                  <p className="text-sm mt-2">
                    <span className="text-[#8A847C]">From</span> {d.sellerName} <span className="text-[#8A847C]">→</span> {d.buyerName}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                    <div><p className="text-[#8A847C]">Declared</p><p className="font-bold">{inr(d.declaredValueInr)}</p></div>
                    <div><p className="text-[#8A847C]">Guideline</p><p className="font-bold">{inr(d.guidelineValueInr)}</p></div>
                    <div><p className="text-[#8A847C]">Stamp duty</p><p className="font-bold">{inr(d.stampDutyPaidInr)}</p></div>
                  </div>
                  {d.declaredValueInr < d.guidelineValueInr && (
                    <p className="mt-2 text-[11px] text-[#B7791F] font-semibold">Declared below guideline value — Sec. 47A review</p>
                  )}
                  <p className="text-[10px] font-mono text-[#8A847C] mt-2 truncate">SHA-256 {d.documentHash}</p>
                </div>
              ))}
              <ProvenanceChip p={parcel.provenance.registration} />
            </>
          )}

          {section === 'charges' && (
            <>
              {parcel.encumbrances.length === 0 && !parcel.litigation && (
                <div className="saar-card rounded-xl p-4 flex items-center gap-2 text-sm text-[#2D6A4F]">
                  <ShieldCheck className="w-4 h-4" /> No encumbrances or litigation found.
                </div>
              )}
              {parcel.encumbrances.map((e) => (
                <div key={e.id} className="saar-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm">{e.type}</p>
                    <span className={`badge-pill border ${e.status === 'ACTIVE' ? 'bg-[#FDF6E3] text-[#B7791F] border-[#F2E0B0]' : 'bg-[#EAF4EE] text-[#2D6A4F] border-[#CFE5D8]'}`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#635E56] mt-1">{e.institution}</p>
                  <p className="text-lg font-bold mt-2">{inr(e.amountInr)}</p>
                  <p className="text-[10px] font-mono text-[#8A847C] mt-1">
                    {e.cersaiReference} • since {e.registrationDate}
                    {e.dischargeDate ? ` • discharged ${e.dischargeDate}` : ''}
                  </p>
                </div>
              ))}
              {parcel.litigation && (
                <div className="rounded-xl p-4 border border-[#F0C9BF] bg-[#FBEDE9]">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-bold">{parcel.litigation.caseNumber}</p>
                    {parcel.litigation.stayOrderActive && (
                      <span className="badge-pill bg-[#C0392B] text-white">STAY ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-1">{parcel.litigation.courtName}</p>
                  <p className="text-xs text-[#635E56] mt-1">
                    {parcel.litigation.petitioner} vs {parcel.litigation.respondent}
                  </p>
                  <p className="text-xs mt-2">{parcel.litigation.subject}</p>
                  <p className="text-[10px] font-mono text-[#8A847C] mt-2">Filed {parcel.litigation.filingDate}</p>
                </div>
              )}
              <ProvenanceChip p={parcel.provenance.cersai ?? parcel.provenance.litigation ?? parcel.provenance.encumbrance} />
            </>
          )}

          {section === 'tax' && (
            <div className="saar-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-bold">{parcel.tax.propertyTaxId}</p>
                <span
                  className={`badge-pill border ${
                    parcel.tax.paymentStatus === 'PAID'
                      ? 'bg-[#EAF4EE] text-[#2D6A4F] border-[#CFE5D8]'
                      : parcel.tax.paymentStatus === 'PENDING'
                        ? 'bg-[#FDF6E3] text-[#B7791F] border-[#F2E0B0]'
                        : 'bg-[#FBEDE9] text-[#C0392B] border-[#F0C9BF]'
                  }`}
                >
                  {parcel.tax.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-[#635E56] mt-1">{parcel.tax.municipalWard}</p>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div><p className="text-[#8A847C]">Annual value</p><p className="font-bold text-sm">{inr(parcel.tax.annualValueInr)}</p></div>
                <div><p className="text-[#8A847C]">Current demand</p><p className="font-bold text-sm">{inr(parcel.tax.currentDemandInr)}</p></div>
                <div><p className="text-[#8A847C]">Arrears</p><p className={`font-bold text-sm ${parcel.tax.arrearsInr ? 'text-[#C0392B]' : ''}`}>{inr(parcel.tax.arrearsInr)}</p></div>
                <div><p className="text-[#8A847C]">Assessed area</p><p className="font-bold text-sm">{parcel.tax.assessedAreaSqm} m²</p></div>
              </div>
              <p className="text-[11px] text-[#8A847C] mt-3">Last paid {parcel.tax.lastPaidDate ?? '—'}</p>
              <ProvenanceChip p={parcel.provenance.tax} />
            </div>
          )}

          {section === 'satellite' && (
            <div className="saar-card rounded-xl p-4">
              {parcel.satelliteData.detected ? (
                <>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><p className="text-[#8A847C]">Footprint</p><p className="font-bold text-sm">{parcel.satelliteData.footprintAreaSqm} m²</p></div>
                    <div><p className="text-[#8A847C]">Floors</p><p className="font-bold text-sm">{parcel.satelliteData.estimatedFloors}</p></div>
                    <div><p className="text-[#8A847C]">Height</p><p className="font-bold text-sm">{parcel.satelliteData.heightMeters} m</p></div>
                  </div>
                  <div className={`mt-3 rounded-lg p-3 text-xs font-semibold ${parcel.satelliteData.hasBuildingPermission ? 'bg-[#EAF4EE] text-[#2D6A4F]' : 'bg-[#FBEDE9] text-[#C0392B]'}`}>
                    {parcel.satelliteData.hasBuildingPermission
                      ? `Building permission ${parcel.satelliteData.permissionNumber}`
                      : `No building permission — ${parcel.satelliteData.unauthorizedAreaSqm ?? 0} m² unauthorised`}
                  </div>
                  <p className="text-[10px] font-mono text-[#8A847C] mt-2">Detected {parcel.satelliteData.detectionYear} • Google Open Buildings 2.5D</p>
                </>
              ) : (
                <p className="text-sm text-[#8A847C]">No structure detected — open / cultivated land.</p>
              )}
              <ProvenanceChip p={parcel.provenance.satellite} />
            </div>
          )}

          {section === 'provenance' && (
            <>
              <div className="saar-card-warm rounded-xl p-3 text-xs grid grid-cols-2 gap-2">
                <div><p className="text-[#8A847C]">Valid time (real world)</p><p className="font-mono font-bold">{parcel.validFrom}</p></div>
                <div><p className="text-[#8A847C]">Transaction time (system)</p><p className="font-mono font-bold">{parcel.systemTime}</p></div>
              </div>
              {Object.entries(parcel.provenance).map(([key, p]) => (
                <div key={key} className="saar-card rounded-xl p-4">
                  <p className="text-[10px] font-mono font-bold text-[#C45A34] uppercase">{key}</p>
                  <p className="text-sm font-bold mt-0.5">{p.sourceDepartment}</p>
                  <ProvenanceChip p={p} />
                </div>
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

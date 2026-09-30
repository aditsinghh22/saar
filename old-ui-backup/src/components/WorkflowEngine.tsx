import React, { useEffect, useMemo, useState } from 'react';
import {
  FileSignature,
  Landmark,
  Building2,
  Banknote,
  Radio,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Timer,
  Pause,
  Play,
  Trash2
} from 'lucide-react';
import { CloudEvent, Parcel, WorkflowCase } from '../types/land';

interface WorkflowEngineProps {
  parcels: Parcel[];
  onTriggerMutationSuccess: (ulpin: string, newOwnerName: string) => void;
}

type Actor = 'registrar' | 'tehsil' | 'municipal' | 'bank';

const ACTORS: { id: Actor; label: string; office: string; icon: React.ElementType }[] = [
  { id: 'registrar', label: 'Sub-Registrar Office', office: 'Registration • NGDRS', icon: FileSignature },
  { id: 'tehsil', label: 'Tehsil Revenue Office', office: 'Mutation • Inteqal', icon: Landmark },
  { id: 'municipal', label: 'Municipal Tax Corporation', office: 'Property tax', icon: Building2 },
  { id: 'bank', label: 'Bank Lending Officer', office: 'CERSAI charges', icon: Banknote }
];

const STAGES: { id: WorkflowCase['stage']; label: string; role: string }[] = [
  { id: 'DEED_REGISTERED', label: 'Deed Registered', role: 'Sub-Registrar' },
  { id: 'FIELD_VERIFICATION', label: 'Patwari Verification', role: 'Patwari' },
  { id: 'REVENUE_REVIEW', label: 'Kanungo Scrutiny', role: 'Kanungo' },
  { id: 'TAHSILDAR_APPROVAL', label: 'Tahsildar Sanction', role: 'Tahsildar' },
  { id: 'COMPLETED', label: 'RoR Updated', role: 'System' }
];

const now = () => new Date().toISOString();
const makeEvent = (type: CloudEvent['type'], source: string, data: Record<string, any>): CloudEvent => ({
  id: `evt-${Math.random().toString(16).slice(2, 10)}`,
  source,
  type,
  time: now(),
  datacontenttype: 'application/json',
  data
});

const SEED_CASE: WorkflowCase = {
  caseId: 'MUT-CH-2026-0412',
  ulpin: '10CH0220010603',
  caseType: 'MUTATION',
  applicantName: 'Rajesh Kumar Arora',
  applicantRole: 'Buyer',
  stage: 'FIELD_VERIFICATION',
  assignedRole: 'Patwari',
  assignedOffice: 'Tehsil Office, Chandigarh',
  slaDaysTotal: 30,
  slaDaysElapsed: 18,
  openedAt: '2026-09-12',
  eventsLog: [
    { timestamp: '2026-09-12 10:02', actor: 'Citizen', action: 'Application filed', note: 'Sale deed CHD-2022-3318 attached' },
    { timestamp: '2026-09-16 15:40', actor: 'Tehsil Clerk', action: 'Documents checked', note: 'Forwarded to Patwari Sector 22' }
  ]
};

export const WorkflowEngine: React.FC<WorkflowEngineProps> = ({ parcels, onTriggerMutationSuccess }) => {
  const [actor, setActor] = useState<Actor>('registrar');
  const [cases, setCases] = useState<WorkflowCase[]>([SEED_CASE]);
  const [events, setEvents] = useState<CloudEvent[]>([
    makeEvent('in.gov.landstack.mutation.initiated', '/tehsil/chandigarh', { caseId: SEED_CASE.caseId, ulpin: SEED_CASE.ulpin })
  ]);
  const [streamPaused, setStreamPaused] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CloudEvent | null>(null);

  // Registrar form
  const [regUlpin, setRegUlpin] = useState<string>(parcels[0]?.ulpin ?? '');
  const [buyer, setBuyer] = useState<string>('Neha Kapoor');
  const [regResult, setRegResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Bank form
  const [bankUlpin, setBankUlpin] = useState<string>('33TN0140034303');
  const [loanAmount, setLoanAmount] = useState<number>(3000000);
  const [bankResult, setBankResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Municipal re-assignments driven by approvals
  const [taxUpdates, setTaxUpdates] = useState<{ ulpin: string; owner: string; time: string }[]>([]);

  const emit = (e: CloudEvent) => {
    if (!streamPaused) setEvents((prev) => [e, ...prev].slice(0, 40));
  };

  // SLA clock ticks one simulated day every 6s
  useEffect(() => {
    const t = setInterval(() => {
      setCases((prev) => prev.map((c) => (c.stage === 'COMPLETED' ? c : { ...c, slaDaysElapsed: Math.min(c.slaDaysTotal + 5, c.slaDaysElapsed + 1) })));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const parcelOf = (ulpin: string) => parcels.find((p) => p.ulpin === ulpin);

  const registerDeed = () => {
    const p = parcelOf(regUlpin);
    if (!p || !buyer.trim()) return;
    if (p.litigation?.stayOrderActive) {
      setRegResult({ ok: false, message: `BLOCKED — ${p.litigation.courtName} status-quo order in ${p.litigation.caseNumber}. Registration refused under TP Act §52.` });
      emit(makeEvent('in.gov.landstack.litigation.flagged', '/registration/sro-17', { ulpin: p.ulpin, caseNumber: p.litigation.caseNumber, action: 'REGISTRATION_BLOCKED' }));
      return;
    }
    const caseId = `MUT-${p.state}-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const newCase: WorkflowCase = {
      caseId,
      ulpin: p.ulpin,
      caseType: 'MUTATION',
      applicantName: buyer.trim(),
      applicantRole: 'Buyer',
      stage: 'FIELD_VERIFICATION',
      assignedRole: 'Patwari',
      assignedOffice: `Tehsil Office, ${p.district}`,
      slaDaysTotal: 30,
      slaDaysElapsed: 0,
      openedAt: now().slice(0, 10),
      eventsLog: [{ timestamp: now().slice(0, 16).replace('T', ' '), actor: 'Sub-Registrar', action: 'Deed registered', note: `Auto-mutation initiated for ${buyer.trim()}` }]
    };
    setCases((prev) => [newCase, ...prev]);
    setRegResult({ ok: true, message: `Deed registered. Mutation ${caseId} auto-initiated at the Tehsil — no citizen visit required.` });
    emit(makeEvent('in.gov.landstack.deed.registered', '/registration/sro-17', { ulpin: p.ulpin, buyer: buyer.trim() }));
    emit(makeEvent('in.gov.landstack.mutation.initiated', '/tehsil', { caseId, ulpin: p.ulpin }));
  };

  const advance = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.caseId !== caseId) return c;
        const idx = STAGES.findIndex((s) => s.id === c.stage);
        const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
        const log = { timestamp: now().slice(0, 16).replace('T', ' '), actor: STAGES[idx].role, action: `${STAGES[idx].label} cleared`, note: `Forwarded to ${next.role}` };
        if (next.id === 'COMPLETED') {
          onTriggerMutationSuccess(c.ulpin, c.applicantName);
          setTaxUpdates((t) => [{ ulpin: c.ulpin, owner: c.applicantName, time: now().slice(11, 16) }, ...t]);
          emit(makeEvent('in.gov.landstack.mutation.approved', '/tehsil', { caseId, ulpin: c.ulpin, newOwner: c.applicantName }));
          emit(makeEvent('in.gov.landstack.tax.updated', '/municipal', { ulpin: c.ulpin, liableParty: c.applicantName }));
        }
        return { ...c, stage: next.id, assignedRole: next.role, eventsLog: [...c.eventsLog, log] };
      })
    );
  };

  const createCharge = () => {
    const p = parcelOf(bankUlpin);
    if (!p) return;
    const active = p.encumbrances.find((e) => e.status === 'ACTIVE');
    if (active) {
      setBankResult({
        ok: false,
        message: `COLLISION — existing ${active.type.toLowerCase()} of ₹${active.amountInr.toLocaleString('en-IN')} with ${active.institution} (${active.cersaiReference}). Second hypothecation blocked.`
      });
      emit(makeEvent('in.gov.landstack.charge.created', '/cersai', { ulpin: p.ulpin, result: 'REJECTED_DOUBLE_MORTGAGE' }));
      return;
    }
    setBankResult({ ok: true, message: `Charge of ₹${loanAmount.toLocaleString('en-IN')} registered on CERSAI and mirrored to the state EC.` });
    emit(makeEvent('in.gov.landstack.charge.created', '/cersai', { ulpin: p.ulpin, amountInr: loanAmount }));
  };

  const openCases = useMemo(() => cases.filter((c) => c.stage !== 'COMPLETED'), [cases]);

  return (
    <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 p-5 lg:p-6 overflow-auto">
      <div className="flex flex-col gap-5 min-w-0">
        {/* Actor Switcher */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ACTORS.map((a) => {
            const Icon = a.icon;
            const on = actor === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setActor(a.id)}
                className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${on ? 'bg-[#141413] text-white border-[#141413] shadow-lg' : 'saar-card'}`}
              >
                <Icon className={`w-5 h-5 ${on ? 'text-[#F0A37F]' : 'text-[#C45A34]'}`} />
                <p className="text-sm font-bold mt-3">{a.label}</p>
                <p className={`text-[11px] font-mono ${on ? 'text-white/60' : 'text-[#8A847C]'}`}>{a.office}</p>
              </button>
            );
          })}
        </div>

        {/* Actor Panel */}
        <div className="saar-card rounded-2xl p-6">
          {actor === 'registrar' && (
            <>
              <h2 className="text-xl font-bold">Register a Sale Deed</h2>
              <p className="text-sm text-[#635E56] mt-1">Court stay orders are checked automatically before registration.</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <label className="text-xs font-bold text-[#54504A]">
                  Parcel (ULPIN)
                  <select value={regUlpin} onChange={(e) => setRegUlpin(e.target.value)} className="mt-1.5 w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm font-normal">
                    {parcels.map((p) => (
                      <option key={p.ulpin} value={p.ulpin}>
                        {p.localSurveyNo} — {p.villageOrSector}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-[#54504A]">
                  Buyer name
                  <input value={buyer} onChange={(e) => setBuyer(e.target.value)} className="mt-1.5 w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm font-normal" />
                </label>
              </div>
              <button onClick={registerDeed} className="btn-saar-primary mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
                <FileSignature className="w-4 h-4" /> Register & auto-initiate mutation
              </button>
              {regResult && (
                <div className={`mt-4 rounded-xl p-4 text-sm flex gap-2 ${regResult.ok ? 'bg-[#EAF4EE] text-[#2D6A4F]' : 'bg-[#FBEDE9] text-[#C0392B]'}`}>
                  {regResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
                  {regResult.message}
                </div>
              )}
              <p className="text-[11px] text-[#8A847C] mt-4">Tip: try “SCO No. 107-Commercial” to see the Lis Pendens blocker.</p>
            </>
          )}

          {actor === 'tehsil' && (
            <>
              <h2 className="text-xl font-bold">Mutation (Inteqal / Dakhil-Kharij) Queue</h2>
              <p className="text-sm text-[#635E56] mt-1">Patwari → Kanungo → Tahsildar, with a 30-day service guarantee.</p>
              <div className="mt-5 space-y-4">
                {cases.map((c) => {
                  const p = parcelOf(c.ulpin);
                  const idx = STAGES.findIndex((s) => s.id === c.stage);
                  const remaining = c.slaDaysTotal - c.slaDaysElapsed;
                  const done = c.stage === 'COMPLETED';
                  return (
                    <div key={c.caseId} className="rounded-2xl border border-[#E4DFD5] p-5 bg-[#FAF8F5]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs text-[#8A847C]">{c.caseId}</p>
                          <p className="font-bold">{p?.localSurveyNo} → {c.applicantName}</p>
                        </div>
                        {done ? (
                          <span className="badge-pill bg-[#EAF4EE] text-[#2D6A4F] border border-[#CFE5D8]"><CheckCircle2 className="w-3 h-3" /> RoR UPDATED</span>
                        ) : (
                          <span className={`badge-pill border ${remaining < 0 ? 'bg-[#FBEDE9] text-[#C0392B] border-[#F0C9BF]' : remaining <= 7 ? 'bg-[#FDF6E3] text-[#B7791F] border-[#F2E0B0]' : 'bg-white text-[#54504A] border-[#E2DDD3]'}`}>
                            <Timer className="w-3 h-3" /> {remaining < 0 ? `SLA breached by ${-remaining}d` : `${remaining}d left of ${c.slaDaysTotal}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-4">
                        {STAGES.slice(0, 5).map((s, i) => (
                          <React.Fragment key={s.id}>
                            <div className={`flex-1 text-center rounded-lg px-2 py-1.5 text-[10px] font-bold border ${i < idx || done ? 'bg-[#141413] text-white border-[#141413]' : i === idx ? 'bg-[#FAF3ED] text-[#C45A34] border-[#ECCFBE]' : 'bg-white text-[#A39D93] border-[#E6E1D6]'}`}>
                              {s.label}
                            </div>
                            {i < 4 && <ArrowRight className="w-3 h-3 text-[#D4CEC3] shrink-0" />}
                          </React.Fragment>
                        ))}
                      </div>
                      {!done && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-[#635E56]">With <strong>{c.assignedRole}</strong>, {c.assignedOffice}</p>
                          <button onClick={() => advance(c.caseId)} className="btn-saar-terracotta px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                            {c.stage === 'TAHSILDAR_APPROVAL' ? 'Sanction mutation' : `Clear as ${c.assignedRole}`}
                          </button>
                        </div>
                      )}
                      <ul className="mt-3 space-y-1 text-[11px] text-[#8A847C] font-mono">
                        {c.eventsLog.slice(-3).map((l, i) => (
                          <li key={i}>{l.timestamp} • {l.actor}: {l.action}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {actor === 'municipal' && (
            <>
              <h2 className="text-xl font-bold">Automatic Tax Liability Re-assignment</h2>
              <p className="text-sm text-[#635E56] mt-1">When the Tahsildar sanctions a mutation, the tax demand moves to the new owner — no office visit needed.</p>
              <div className="mt-5 space-y-2">
                {taxUpdates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D4CEC3] p-6 text-center text-sm text-[#8A847C]">
                    Waiting for <span className="font-mono">mutation.approved</span> events. {openCases.length} mutation(s) in progress.
                  </div>
                ) : (
                  taxUpdates.map((t, i) => {
                    const p = parcelOf(t.ulpin);
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#E4DFD5] px-4 py-3">
                        <div>
                          <p className="text-sm font-bold">{p?.tax.propertyTaxId}</p>
                          <p className="text-xs text-[#635E56]">Demand re-addressed to {t.owner}</p>
                        </div>
                        <span className="text-[11px] font-mono text-[#2D6A4F]">{t.time} ✓</span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {actor === 'bank' && (
            <>
              <h2 className="text-xl font-bold">Create a Mortgage Charge</h2>
              <p className="text-sm text-[#635E56] mt-1">CERSAI and state encumbrance records are checked together to stop double mortgages.</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <label className="text-xs font-bold text-[#54504A]">
                  Collateral (ULPIN)
                  <select value={bankUlpin} onChange={(e) => setBankUlpin(e.target.value)} className="mt-1.5 w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm font-normal">
                    {parcels.map((p) => (
                      <option key={p.ulpin} value={p.ulpin}>{p.localSurveyNo} — {p.villageOrSector}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-[#54504A]">
                  Loan amount (₹)
                  <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="mt-1.5 w-full bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm font-normal" />
                </label>
              </div>
              <button onClick={createCharge} className="btn-saar-primary mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
                <Banknote className="w-4 h-4" /> Check & create charge
              </button>
              {bankResult && (
                <div className={`mt-4 rounded-xl p-4 text-sm flex gap-2 ${bankResult.ok ? 'bg-[#EAF4EE] text-[#2D6A4F]' : 'bg-[#FBEDE9] text-[#C0392B]'}`}>
                  {bankResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
                  {bankResult.message}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CloudEvents Monitor */}
      <aside className="saar-card rounded-2xl flex flex-col min-h-[520px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFEBE3]">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${streamPaused ? 'text-[#A39D93]' : 'text-[#C45A34] animate-pulse'}`} />
            <div>
              <p className="text-sm font-bold">Live Event Bus</p>
              <p className="text-[10px] font-mono text-[#8A847C]">CloudEvents v1.0 • {events.length} events</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setStreamPaused(!streamPaused)} className="p-1.5 rounded-lg hover:bg-[#F4F0E8] cursor-pointer" title={streamPaused ? 'Resume' : 'Pause'}>
              {streamPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button onClick={() => setEvents([])} className="p-1.5 rounded-lg hover:bg-[#F4F0E8] cursor-pointer" title="Clear">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
              className="w-full text-left rounded-xl border border-[#EFEBE3] bg-[#FAF8F5] hover:border-[#D4CEC3] px-3 py-2.5 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-[#141413] truncate">{e.type.replace('in.gov.landstack.', '')}</span>
                <span className="text-[10px] font-mono text-[#A39D93] shrink-0">{e.time.slice(11, 19)}</span>
              </div>
              <p className="text-[10px] font-mono text-[#8A847C]">{e.source}</p>
              {selectedEvent?.id === e.id && (
                <pre className="mt-2 text-[10px] leading-relaxed bg-[#141413] text-[#E8E4DA] rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify({ specversion: '1.0', ...e }, null, 2)}
                </pre>
              )}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

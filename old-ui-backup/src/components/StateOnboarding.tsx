import React, { useState } from 'react';
import {
  Upload,
  Wand2,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  ArrowRight,
  Timer
} from 'lucide-react';
import { StateCode } from '../types/land';
import { BIHAR_COLUMN_MAPPINGS, BIHAR_SAMPLE_ROWS, VALIDATION_GATES } from '../data/onboardingData';

interface StateOnboardingProps {
  onStateDeployed: (stateCode: StateCode) => void;
}

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { label: 'Ingest register', icon: Upload },
  { label: 'AI schema mapping', icon: Wand2 },
  { label: 'Validation gates', icon: ShieldCheck },
  { label: 'Deploy', icon: Rocket }
];

export const StateOnboarding: React.FC<StateOnboardingProps> = ({ onStateDeployed }) => {
  const [step, setStep] = useState<Step>(0);
  const [ingested, setIngested] = useState<boolean>(false);
  const [mapping, setMapping] = useState<boolean>(false);
  const [mapped, setMapped] = useState<boolean>(false);
  const [gateStatus, setGateStatus] = useState<Record<string, 'idle' | 'running' | 'passed'>>({});
  const [deploying, setDeploying] = useState<boolean>(false);

  const avgConfidence = Math.round(BIHAR_COLUMN_MAPPINGS.reduce((s, m) => s + m.confidence, 0) / BIHAR_COLUMN_MAPPINGS.length);
  const allGatesPassed = VALIDATION_GATES.every((g) => gateStatus[g.id] === 'passed');

  const runMapping = () => {
    setMapping(true);
    setTimeout(() => {
      setMapping(false);
      setMapped(true);
    }, 1400);
  };

  const runGates = async () => {
    for (const gate of VALIDATION_GATES) {
      setGateStatus((s) => ({ ...s, [gate.id]: 'running' }));
      await new Promise((r) => setTimeout(r, gate.durationMs));
      setGateStatus((s) => ({ ...s, [gate.id]: 'passed' }));
    }
  };

  const deploy = () => {
    setDeploying(true);
    setTimeout(() => onStateDeployed('BR'), 1500);
  };

  const columns = Object.keys(BIHAR_SAMPLE_ROWS[0]);

  return (
    <div className="flex-1 overflow-auto p-5 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold text-[#C45A34] tracking-wider">ADDING A STATE = CONFIGURATION, NOT CODE</p>
          <h1 className="text-3xl font-bold mt-1">5-Minute Live State Onboarding Studio</h1>
          <p className="text-sm text-[#635E56] mt-1">Onboard Bihar’s Jamabandi register into the national Parcel Spine.</p>
        </div>
        <span className="badge-pill bg-white border border-[#E2DDD3] text-[#54504A]">
          <Timer className="w-3.5 h-3.5" /> Target: under 5 minutes
        </span>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-4 gap-2 mt-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const state = i < step ? 'done' : i === step ? 'current' : 'todo';
          return (
            <button
              key={s.label}
              disabled={i > step}
              onClick={() => setStep(i as Step)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all ${
                state === 'current' ? 'bg-[#141413] text-white border-[#141413]' : state === 'done' ? 'bg-[#EAF4EE] border-[#CFE5D8] text-[#2D6A4F] cursor-pointer' : 'bg-white border-[#E6E1D6] text-[#A39D93]'
              }`}
            >
              {state === 'done' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Icon className="w-4 h-4 shrink-0" />}
              <span className="text-xs font-bold hidden sm:block">{i + 1}. {s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="saar-card rounded-2xl p-6 mt-5">
        {step === 0 && (
          <>
            <h2 className="text-lg font-bold">Ingest a sample revenue register</h2>
            <p className="text-sm text-[#635E56] mt-1">Upload a CSV / XLSX export from the state system. Hindi headers are fine.</p>
            {!ingested ? (
              <button
                onClick={() => setIngested(true)}
                className="mt-5 w-full rounded-2xl border-2 border-dashed border-[#D4CEC3] bg-[#FAF8F5] hover:border-[#C45A34] py-10 flex flex-col items-center gap-2 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-8 h-8 text-[#C45A34]" />
                <span className="text-sm font-bold">bihar_jamabandi_mastipur_sample.csv</span>
                <span className="text-xs text-[#8A847C]">Click to load sample (3 rows, 8 columns)</span>
              </button>
            ) : (
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#E4DFD5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#F6F3EC]">
                    <tr>
                      {columns.map((c) => (
                        <th key={c} className="px-3 py-2 text-left text-xs font-bold text-[#54504A] whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BIHAR_SAMPLE_ROWS.map((row, i) => (
                      <tr key={i} className="border-t border-[#EFEBE3]">
                        {columns.map((c) => (
                          <td key={c} className="px-3 py-2 whitespace-nowrap">{row[c]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button disabled={!ingested} onClick={() => setStep(1)} className="btn-saar-primary mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-40">
              Continue to mapping <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">AI-assisted schema mapper</h2>
                <p className="text-sm text-[#635E56] mt-1">Maps each local column to the ISO 19152 LADM field and its GoRT canonical key.</p>
              </div>
              {mapped && <span className="badge-pill bg-[#EAF4EE] text-[#2D6A4F] border border-[#CFE5D8]">Avg confidence {avgConfidence}%</span>}
            </div>
            {!mapped ? (
              <button onClick={runMapping} className="btn-saar-terracotta mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
                {mapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {mapping ? 'Inferring mappings…' : 'Auto-map columns'}
              </button>
            ) : (
              <div className="mt-5 space-y-2">
                {BIHAR_COLUMN_MAPPINGS.map((m) => (
                  <div key={m.sourceColumn} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_120px] items-center gap-3 rounded-xl bg-[#FAF8F5] border border-[#EFEBE3] px-4 py-3">
                    <div>
                      <p className="text-sm font-bold">{m.sourceColumn}</p>
                      <p className="text-[11px] text-[#8A847C]">e.g. {m.sampleValue}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#C45A34] hidden md:block" />
                    <div>
                      <p className="text-sm font-mono font-bold">{m.canonicalField}</p>
                      <p className="text-[11px] font-mono text-[#8A847C]">GoRT: {m.gortKey}{m.transform ? ` • ${m.transform}` : ''}</p>
                    </div>
                    <div>
                      <div className="h-1.5 rounded-full bg-[#E2DDD3]">
                        <div className="h-full rounded-full bg-[#2D6A4F]" style={{ width: `${m.confidence}%` }} />
                      </div>
                      <p className="text-[11px] font-mono text-right mt-1">{m.confidence}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button disabled={!mapped} onClick={() => setStep(2)} className="btn-saar-primary mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-40">
              Continue to validation <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold">Automated validation gates</h2>
            <p className="text-sm text-[#635E56] mt-1">All four must pass before any record touches the national spine.</p>
            <div className="mt-5 grid md:grid-cols-2 gap-3">
              {VALIDATION_GATES.map((g, i) => {
                const st = gateStatus[g.id] ?? 'idle';
                return (
                  <div key={g.id} className={`rounded-xl border p-4 ${st === 'passed' ? 'bg-[#EAF4EE] border-[#CFE5D8]' : 'bg-[#FAF8F5] border-[#EFEBE3]'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">Gate {i + 1}: {g.name}</p>
                      {st === 'running' && <Loader2 className="w-4 h-4 animate-spin text-[#C45A34]" />}
                      {st === 'passed' && <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />}
                    </div>
                    <p className="text-xs text-[#635E56] mt-1">{g.description}</p>
                    {st === 'passed' && <p className="text-[11px] font-mono text-[#2D6A4F] mt-2">{g.resultNote}</p>}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-5">
              {!allGatesPassed && (
                <button onClick={runGates} className="btn-saar-terracotta flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
                  <ShieldCheck className="w-4 h-4" /> Run all gates
                </button>
              )}
              <button disabled={!allGatesPassed} onClick={() => setStep(3)} className="btn-saar-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-40">
                Continue to deploy <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <Rocket className="w-10 h-10 text-[#C45A34] mx-auto" />
            <h2 className="text-2xl font-bold mt-3">Bihar is ready to go live</h2>
            <p className="text-sm text-[#635E56] mt-1 max-w-md mx-auto">
              State profile generated with Bigha/Katha units, Hindi vocabulary and Circle Officer workflow. No code changes required.
            </p>
            <pre className="mt-5 text-left text-[11px] bg-[#141413] text-[#E8E4DA] rounded-xl p-4 max-w-md mx-auto overflow-x-auto">{`state: BR
units: { primary: Bigha, sub: Katha, katha_m2: 126.46 }
ror: "Jamabandi Register II"
mutation: "Dakhil-Kharij"
offices: [Karmachari, Circle Inspector, Circle Officer]
languages: [hi, en]`}</pre>
            <button onClick={deploy} className="btn-saar-terracotta mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer">
              {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {deploying ? 'Deploying to Parcel Spine…' : '1-click deploy Bihar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

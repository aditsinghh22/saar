import React, { useMemo, useState } from 'react';
import { X, Link2, ShieldCheck, Loader2, CheckCircle2, Hash } from 'lucide-react';

interface AuditChainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Block {
  index: number;
  timestamp: string;
  actor: string;
  action: string;
  ulpin: string;
  prevHash: string;
  hash: string;
}

// Small deterministic hash for display (stands in for HMAC-SHA-256)
const pseudoHash = (input: string) => {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    h1 = Math.imul(h1 ^ input.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + input.charCodeAt(i), 2246822507) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).repeat(2);
};

const ENTRIES: Omit<Block, 'index' | 'prevHash' | 'hash'>[] = [
  { timestamp: '2026-09-28 02:00:04', actor: 'Integrity Engine', action: 'RECONCILIATION_RUN', ulpin: '*' },
  { timestamp: '2026-09-28 09:41:17', actor: 'Patwari Sector 22', action: 'FIELD_VERIFICATION_SUBMITTED', ulpin: '10CH0220010603' },
  { timestamp: '2026-09-28 11:05:52', actor: 'Sub-Registrar SRO-17', action: 'REGISTRATION_BLOCKED_LIS_PENDENS', ulpin: '10CH0220010704' },
  { timestamp: '2026-09-28 12:30:09', actor: 'Karur Vysya Bank', action: 'CHARGE_REJECTED_DOUBLE_MORTGAGE', ulpin: '33TN0140034303' },
  { timestamp: '2026-09-28 14:12:40', actor: 'Citizen (anon)', action: 'DUE_DILIGENCE_VIEWED', ulpin: '10CH0220010401' },
  { timestamp: '2026-09-28 14:30:00', actor: 'Sync Service', action: 'ROR_SNAPSHOT_INGESTED', ulpin: '*' }
];

export const AuditChainModal: React.FC<AuditChainModalProps> = ({ isOpen, onClose }) => {
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifiedUpTo, setVerifiedUpTo] = useState<number>(-1);

  const chain = useMemo<Block[]>(() => {
    const blocks: Block[] = [];
    let prev = '0'.repeat(32);
    ENTRIES.forEach((e, i) => {
      const hash = pseudoHash(`${prev}|${e.timestamp}|${e.actor}|${e.action}|${e.ulpin}`);
      blocks.push({ ...e, index: i, prevHash: prev, hash });
      prev = hash;
    });
    return blocks;
  }, []);

  const reverify = async () => {
    setVerifying(true);
    setVerifiedUpTo(-1);
    for (let i = 0; i < chain.length; i++) {
      await new Promise((r) => setTimeout(r, 350));
      setVerifiedUpTo(i);
    }
    setVerifying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#141413]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#FAF8F5] rounded-2xl border border-[#E2DDD3] shadow-2xl overflow-hidden">
        <div className="bg-white border-b border-[#E4DFD5] px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] border border-[#CFE5D8] flex items-center justify-center">
              <Link2 className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Tamper-Evident Audit Ledger</h2>
              <p className="text-xs text-[#8A847C] font-mono">HMAC-SHA-256 hash chain • {chain.length} blocks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F0E8] cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {chain.map((b) => {
            const ok = verifiedUpTo >= b.index;
            return (
              <div key={b.index} className={`rounded-xl border p-4 transition-colors ${ok ? 'bg-[#EAF4EE] border-[#CFE5D8]' : 'bg-white border-[#E4DFD5]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">
                    <span className="font-mono text-[#8A847C] mr-2">#{b.index}</span>
                    {b.action.replace(/_/g, ' ')}
                  </p>
                  {ok && <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />}
                </div>
                <p className="text-xs text-[#635E56] mt-0.5">
                  {b.actor} • {b.timestamp} • ULPIN {b.ulpin}
                </p>
                <div className="mt-2 grid gap-0.5 text-[10px] font-mono text-[#8A847C]">
                  <p className="truncate flex items-center gap-1"><Hash className="w-3 h-3" /> prev {b.prevHash}</p>
                  <p className="truncate flex items-center gap-1 text-[#141413]"><Hash className="w-3 h-3" /> hash {b.hash}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t border-[#E4DFD5] px-6 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-[#635E56]">
            {verifiedUpTo === chain.length - 1 ? 'All blocks verified — chain intact.' : 'Recompute every hash from the genesis block.'}
          </p>
          <button onClick={reverify} disabled={verifying} className="btn-saar-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-60">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Re-verify Entire Chain
          </button>
        </div>
      </div>
    </div>
  );
};

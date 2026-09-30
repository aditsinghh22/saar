import React, { useMemo, useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { GORT_TERMS, STATE_PROFILES } from '../data/gortGlossary';
import { StateCode } from '../types/land';

interface GoRTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoRTModal: React.FC<GoRTModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<StateCode | 'ALL'>('ALL');

  const terms = useMemo(() => {
    const q = query.toLowerCase();
    return GORT_TERMS.filter(
      (t) =>
        (stateFilter === 'ALL' || t.state === stateFilter || t.state === 'ALL') &&
        (!q || [t.localTerm, t.englishMeaning, t.plainDescription, t.canonicalKey].join(' ').toLowerCase().includes(q))
    );
  }, [query, stateFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#141413]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#FAF8F5] rounded-2xl border border-[#E2DDD3] shadow-2xl overflow-hidden">
        <div className="bg-white border-b border-[#E4DFD5] px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3ED] border border-[#ECCFBE] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#C45A34]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Glossary of Revenue Terms (GoRT)</h2>
              <p className="text-xs text-[#8A847C] font-mono">DoLR canonical keys ↔ local vocabulary ↔ ISO 19152 LADM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F0E8] cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-[#EFEBE3] bg-white">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-[#8A847C]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Jamabandi, Patta, Khasra…" className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          {(['ALL', 'CH', 'TN', 'BR'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${stateFilter === s ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white border-[#E2DDD3] text-[#635E56]'}`}
            >
              {s === 'ALL' ? 'All states' : STATE_PROFILES[s].stateName}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid sm:grid-cols-2 gap-3">
          {terms.map((t, i) => (
            <div key={i} className="saar-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-bold">{t.localTerm}</p>
                <span className="badge-pill bg-[#F4F0E8] text-[#54504A] border border-[#E2DDD3]">{t.state}</span>
              </div>
              <p className="text-xs font-semibold text-[#C45A34]">{t.englishMeaning}</p>
              <p className="text-sm text-[#54504A] mt-2">{t.plainDescription}</p>
              <div className="mt-3 pt-2 border-t border-dashed border-[#E2DDD3] text-[10px] font-mono text-[#8A847C] space-y-0.5">
                <p>GoRT: {t.canonicalKey}</p>
                <p>LADM: {t.ladmEquivalent}</p>
                <p className="font-sans text-[11px] italic">{t.legalContext}</p>
              </div>
            </div>
          ))}
          {terms.length === 0 && <p className="text-sm text-[#8A847C]">No terms match “{query}”.</p>}
        </div>
      </div>
    </div>
  );
};

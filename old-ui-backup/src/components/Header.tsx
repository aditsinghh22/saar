import React from 'react';
import { 
  Layers, 
  GitMerge, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  FileCode2, 
  BookOpen, 
  CheckCircle2, 
  Globe, 
  Database, 
  Search, 
  Compass,
  Building
} from 'lucide-react';
import { StateCode, LanguageCode } from '../types/land';
import { STATE_PROFILES } from '../data/gortGlossary';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedState: StateCode;
  setSelectedState: (state: StateCode) => void;
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  onOpenGoRTModal: () => void;
  onOpenAuditModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedState,
  setSelectedState,
  currentLang,
  setCurrentLang,
  onOpenGoRTModal,
  onOpenAuditModal,
  searchQuery,
  setSearchQuery,
  onSearchSubmit
}) => {
  const navItems = [
    { id: 'map', label: 'Cadastral Plan & 3D Spine', icon: Layers, badge: 'LADM' },
    { id: 'workflow', label: 'Cross-Dept Mesh', icon: GitMerge, badge: 'Live Bus' },
    { id: 'citizen', label: 'Building Envelope & Due Diligence', icon: Building, badge: '3D Studio' },
    { id: 'integrity', label: 'Integrity & Revenue Audit', icon: AlertTriangle, badge: '₹48.6L' },
    { id: 'onboarding', label: 'State Integration Studio', icon: PlusCircle, badge: 'AI Mapper' },
    { id: 'standards', label: 'OGC API & Spec', icon: FileCode2, badge: 'ISO 19152' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4DFD5] shadow-xs select-none">
      {/* Top Gov / Architectural Metadata Ribbon */}
      <div className="bg-[#F6F3EC] text-[#54504A] text-xs px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E1D6]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-medium text-[#141413]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C45A34]"></span>
            <span className="font-bold tracking-tight">Government of India</span>
            <span className="text-[#B8B1A5]">•</span>
            <span className="text-[#635E56]">Department of Land Resources (DoLR)</span>
          </div>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white text-[#C45A34] border border-[#E2DDD3] font-semibold">
            NATIONAL LAND STACK • ISO 19152 LADM
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden lg:flex items-center gap-2 text-[#635E56] font-mono text-[11px]">
            <Database className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Federated Mesh: <strong className="text-[#141413]">8 Depts Synced</strong></span>
            <span className="text-[#D4CEC3]">|</span>
            <span>Auditing: <strong className="text-[#2D6A4F]">Active SHA-256</strong></span>
          </div>

          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1.5 text-[#54504A] hover:text-[#141413] transition-colors cursor-pointer text-[11px] bg-white px-2.5 py-0.5 rounded-md border border-[#E2DDD3]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Audit Chain: <strong className="text-[#141413]">Verified</strong></span>
          </button>

          <button
            onClick={onOpenGoRTModal}
            className="flex items-center gap-1.5 bg-[#FAF3ED] text-[#C45A34] hover:bg-[#F5E8DF] px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-[#ECCFBE] transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>GoRT Glossary</span>
          </button>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 bg-white">
        {/* Brand: SAAR */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#141413] flex items-center justify-center text-white font-black text-xl shadow-md border border-[#2D2C28]">
            <span className="font-heading tracking-tighter">S</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-2xl tracking-tight text-[#141413] font-heading">
                SAAR
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F4F0E8] text-[#635E56] border border-[#E2DDD3]">
                सार • Spatial Cadastre
              </span>
            </div>
            <p className="text-xs text-[#635E56] -mt-0.5 font-medium">
              Spatial Architecture & Land Administration Registry
            </p>
          </div>
        </div>

        {/* Universal Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="flex-1 max-w-xl min-w-[260px] flex items-center gap-2 bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3.5 py-2 focus-within:border-[#C45A34] focus-within:bg-white transition-all"
        >
          <Search className="w-4 h-4 text-[#8A847C] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ULPIN, Khasra / Survey No. or owner (e.g. 104-B, 341/1)"
            className="flex-1 bg-transparent text-sm text-[#141413] placeholder:text-[#A39D93] focus:outline-none"
          />
          <kbd className="hidden md:inline-block text-[10px] font-mono text-[#8A847C] bg-white border border-[#E2DDD3] rounded px-1.5 py-0.5">
            ↵
          </kbd>
          <button
            type="submit"
            className="btn-saar-primary text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer"
          >
            Locate
          </button>
        </form>

        {/* State Profile & Language Selectors */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-[#E2DDD3] rounded-xl px-3 py-2 shadow-xs">
            <Compass className="w-4 h-4 text-[#C45A34]" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as StateCode)}
              className="bg-transparent text-sm font-semibold text-[#141413] focus:outline-none cursor-pointer"
            >
              {Object.values(STATE_PROFILES).map((profile) => (
                <option key={profile.state} value={profile.state}>
                  {profile.stateName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#E2DDD3] rounded-xl px-3 py-2 shadow-xs">
            <Globe className="w-4 h-4 text-[#2D6A4F]" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
              className="bg-transparent text-sm font-semibold text-[#141413] focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <nav className="px-6 flex items-center gap-1 overflow-x-auto border-t border-[#EFEBE3] bg-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive ? 'text-[#141413]' : 'text-[#7A746B] hover:text-[#141413]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C45A34]' : ''}`} />
              <span>{item.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                  isActive
                    ? 'bg-[#FAF3ED] text-[#C45A34] border-[#ECCFBE]'
                    : 'bg-[#F6F3EC] text-[#8A847C] border-[#E6E1D6]'
                }`}
              >
                {item.badge}
              </span>
              {isActive && <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-[#C45A34]" />}
            </button>
          );
        })}
        <div className="ml-auto hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-[#8A847C] pl-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          DPDP Act 2023 Compliant
        </div>
      </nav>
    </header>
  );
};

import React, { useState } from 'react';
import { FileCode2, Play, Copy, CheckCircle2, Globe, BookOpen, Shield, Palette, Loader2 } from 'lucide-react';

type DocTab = 'ogc' | 'openapi' | 'ladm' | 'dpdp' | 'urdpfi';

const WFS_URL = 'https://api.landstack.gov.in/ogc/collections/cadastral_parcels/items?f=json';

const SAMPLE_FEATURES = {
  type: 'FeatureCollection',
  numberMatched: 8,
  numberReturned: 1,
  features: [
    {
      type: 'Feature',
      id: '10CH0220010401',
      geometry: {
        type: 'Polygon',
        coordinates: [[[76.7761, 30.7342], [76.7765, 30.7348], [76.7772, 30.7346], [76.7768, 30.734], [76.7761, 30.7342]]]
      },
      properties: {
        ulpin: '10CH0220010401',
        localSurveyNo: 'Plot No. 104-B',
        areaSqm: 505.8,
        landUse: 'Residential',
        integrityScore: 98,
        'ladm:class': 'LA_SpatialUnit'
      }
    }
  ],
  links: [{ rel: 'next', href: '/collections/cadastral_parcels/items?f=json&offset=1' }]
};

const OPENAPI = `openapi: 3.1.0
info:
  title: National Land Stack API
  version: 1.4.0
paths:
  /parcels/{ulpin}:
    get:
      summary: Fetch parcel with RRR and provenance
      parameters:
        - { name: ulpin, in: path, required: true, schema: { type: string, pattern: '^[0-9]{2}[A-Z]{2}[0-9]{10}$' } }
      responses:
        '200': { $ref: '#/components/responses/Parcel' }
  /parcels/{ulpin}/due-diligence:
    get:
      summary: 6-point statutory title audit (Verifiable Credential)
  /mutations:
    post:
      summary: Initiate mutation (emits in.gov.landstack.mutation.initiated)
  /integrity/anomalies:
    get:
      summary: Cross-silo reconciliation findings`;

const LADM = `from pydantic import BaseModel, Field
from datetime import date

class LA_SpatialUnit(BaseModel):
    ulpin: str = Field(pattern=r"^[0-9]{2}[A-Z]{2}[0-9]{10}$")
    geometry: dict  # GeoJSON Polygon, EPSG:4326
    area_sqm: float
    parent_ulpin: str | None = None

class LA_Party(BaseModel):
    party_id: str
    name: str
    aadhaar_vid_token: str  # never raw Aadhaar (DPDP Act 2023)

class LA_RRR(BaseModel):
    kind: str  # RIGHT | RESTRICTION | RESPONSIBILITY
    party_id: str
    share: tuple[int, int]
    valid_from: date
    source_id: str  # LA_AdministrativeSource`;

const DPDP_ROWS = [
  ['Purpose limitation', 'Owner PII shown only to officers with an open case', 'ParcelDetailDrawer masking'],
  ['Data minimisation', 'Aadhaar stored as Virtual ID token only', 'OwnerParty.aadhaarToken'],
  ['Consent', 'ZK seller verification returns yes/no, never identity', 'CitizenServices ZK check'],
  ['Accountability', 'Every view and mutation hash-chained', 'Audit Chain (HMAC-SHA-256)'],
  ['Right to correction', 'Citizen can raise a record-correction case', 'WorkflowCase RECORD_CORRECTION']
];

const URDPFI = [
  ['Residential', '#fbbf24', 'R-1, R-2, R-V'],
  ['Commercial', '#ef4444', 'C-1, C-2'],
  ['Agricultural', '#84cc16', 'AG-1, AG-2'],
  ['Industrial', '#8b5cf6', 'I-1, I-2'],
  ['Public & Semi-Public', '#3b82f6', 'PS-1'],
  ['Water Body / Eco-Sensitive', '#06b6d4', 'W-1'],
  ['Transport / Utilities', '#6b7280', 'T-1']
];

export const LivingDocument: React.FC = () => {
  const [tab, setTab] = useState<DocTab>('ogc');
  const [running, setRunning] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const runRequest = () => {
    setRunning(true);
    setResponse(null);
    setTimeout(() => {
      setRunning(false);
      setResponse(JSON.stringify(SAMPLE_FEATURES, null, 2));
    }, 900);
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(WFS_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const tabs: { id: DocTab; label: string; icon: React.ElementType }[] = [
    { id: 'ogc', label: 'OGC API – Features', icon: Globe },
    { id: 'openapi', label: 'OpenAPI 3.1', icon: FileCode2 },
    { id: 'ladm', label: 'ISO 19152 Indian Profile', icon: BookOpen },
    { id: 'dpdp', label: 'DPDP Compliance', icon: Shield },
    { id: 'urdpfi', label: 'URDPFI Colours', icon: Palette }
  ];

  return (
    <div className="flex-1 overflow-auto p-5 lg:p-6">
      <p className="text-[11px] font-mono font-bold text-[#C45A34] tracking-wider">SELF-GENERATING LIVING SPECIFICATION</p>
      <h1 className="text-3xl font-bold mt-1">OGC Standards & Technical Document</h1>
      <p className="text-sm text-[#635E56] mt-1">Proof of interoperability, generated from the running system.</p>

      <div className="flex flex-wrap gap-2 mt-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${tab === t.id ? 'bg-[#141413] text-white border-[#141413]' : 'bg-white border-[#E2DDD3] text-[#635E56] hover:text-[#141413]'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="saar-card rounded-2xl p-6 mt-4">
        {tab === 'ogc' && (
          <>
            <h2 className="text-lg font-bold">Live test harness</h2>
            <div className="mt-4 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl px-3 py-2.5 font-mono text-xs overflow-x-auto">
                <span className="badge-pill bg-[#EAF4EE] text-[#2D6A4F] border border-[#CFE5D8]">GET</span>
                <span className="whitespace-nowrap">/collections/cadastral_parcels/items?f=json</span>
              </div>
              <button onClick={runRequest} className="btn-saar-terracotta flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Send
              </button>
            </div>
            {response && (
              <>
                <p className="mt-4 text-[11px] font-mono text-[#2D6A4F]">200 OK • application/geo+json • 38 ms</p>
                <pre className="mt-2 text-[11px] bg-[#141413] text-[#E8E4DA] rounded-xl p-4 max-h-80 overflow-auto">{response}</pre>
              </>
            )}
            <div className="mt-6 rounded-xl bg-[#F6F3EC] border border-[#E6E1D6] p-4">
              <p className="text-sm font-bold">1-Click QGIS / ArcGIS connector</p>
              <p className="text-xs text-[#635E56] mt-1">Layer → Add Layer → Add WFS / OGC API – Features Layer, then paste:</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-[11px] overflow-x-auto whitespace-nowrap">{WFS_URL}</code>
                <button onClick={copyUrl} className="btn-saar-secondary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'openapi' && <pre className="text-[12px] bg-[#141413] text-[#E8E4DA] rounded-xl p-5 overflow-auto">{OPENAPI}</pre>}
        {tab === 'ladm' && <pre className="text-[12px] bg-[#141413] text-[#E8E4DA] rounded-xl p-5 overflow-auto">{LADM}</pre>}

        {tab === 'dpdp' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#8A847C] border-b border-[#EFEBE3]">
                <th className="py-2 pr-4">DPDP principle</th>
                <th className="py-2 pr-4">Implementation</th>
                <th className="py-2">Where</th>
              </tr>
            </thead>
            <tbody>
              {DPDP_ROWS.map(([a, b, c]) => (
                <tr key={a} className="border-b border-[#F3EFEA]">
                  <td className="py-3 pr-4 font-semibold">{a}</td>
                  <td className="py-3 pr-4 text-[#635E56]">{b}</td>
                  <td className="py-3 font-mono text-[11px]">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'urdpfi' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {URDPFI.map(([name, color, codes]) => (
              <div key={name} className="flex items-center gap-3 rounded-xl border border-[#EFEBE3] p-3">
                <span className="w-10 h-10 rounded-lg border border-black/10" style={{ background: color }} />
                <div>
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-[11px] font-mono text-[#8A847C]">{color} • {codes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

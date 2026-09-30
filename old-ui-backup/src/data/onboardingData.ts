// Sample Bihar Jamabandi register used by the 5-Minute State Onboarding Studio

export interface SourceColumnMapping {
  sourceColumn: string;
  sampleValue: string;
  canonicalField: string;
  gortKey: string;
  confidence: number; // 0 - 100
  transform?: string;
}

export interface ValidationGate {
  id: string;
  name: string;
  description: string;
  durationMs: number;
  resultNote: string;
}

export const BIHAR_SAMPLE_ROWS: Record<string, string>[] = [
  {
    'जमाबंदी सं.': '1182',
    'रैयत का नाम': 'राम चन्द्र प्रसाद',
    'पिता का नाम': 'शिव नन्दन प्रसाद',
    'खेसरा सं.': '512',
    'रकबा (कट्ठा)': '10',
    'हल्का': 'मस्तीपुर',
    'अंचल': 'दरभंगा सदर',
    'भूमि प्रकार': 'व्यावसायिक'
  },
  {
    'जमाबंदी सं.': '1183',
    'रैयत का नाम': 'सीता देवी',
    'पिता का नाम': 'राम किशुन यादव',
    'खेसरा सं.': '513',
    'रकबा (कट्ठा)': '40',
    'हल्का': 'मस्तीपुर',
    'अंचल': 'दरभंगा सदर',
    'भूमि प्रकार': 'कृषि'
  },
  {
    'जमाबंदी सं.': '1184',
    'रैयत का नाम': 'अंजलि कुमारी',
    'पिता का नाम': 'सुरेश झा',
    'खेसरा सं.': '514',
    'रकबा (कट्ठा)': '4',
    'हल्का': 'मस्तीपुर',
    'अंचल': 'दरभंगा सदर',
    'भूमि प्रकार': 'आवासीय'
  }
];

export const BIHAR_COLUMN_MAPPINGS: SourceColumnMapping[] = [
  { sourceColumn: 'जमाबंदी सं.', sampleValue: '1182', canonicalField: 'BAUnit.recordId', gortKey: 'RECORD_OF_RIGHTS', confidence: 97 },
  { sourceColumn: 'रैयत का नाम', sampleValue: 'राम चन्द्र प्रसाद', canonicalField: 'Party.name', gortKey: 'RAIYAT', confidence: 98, transform: 'Devanagari → ISO 15919 transliteration' },
  { sourceColumn: 'पिता का नाम', sampleValue: 'शिव नन्दन प्रसाद', canonicalField: 'Party.relativeName', gortKey: 'RELATIVE', confidence: 93 },
  { sourceColumn: 'खेसरा सं.', sampleValue: '512', canonicalField: 'SpatialUnit.label', gortKey: 'PARCEL_NUMBER', confidence: 96 },
  { sourceColumn: 'रकबा (कट्ठा)', sampleValue: '10', canonicalField: 'SpatialUnit.area', gortKey: 'AREA_UNIT', confidence: 91, transform: 'Katha × 126.46 → m²' },
  { sourceColumn: 'हल्का', sampleValue: 'मस्तीपुर', canonicalField: 'SpatialUnit.village', gortKey: 'HALKA', confidence: 94 },
  { sourceColumn: 'अंचल', sampleValue: 'दरभंगा सदर', canonicalField: 'SpatialUnit.tehsil', gortKey: 'CIRCLE', confidence: 92 },
  { sourceColumn: 'भूमि प्रकार', sampleValue: 'व्यावसायिक', canonicalField: 'BAUnit.landUse', gortKey: 'LAND_CLASS', confidence: 89, transform: 'Hindi class → URDPFI category' }
];

export const VALIDATION_GATES: ValidationGate[] = [
  {
    id: 'units',
    name: 'Unit Conversion Sanity Test',
    description: 'Katha / Bigha values converted to m² and compared with polygon area (±5%).',
    durationMs: 900,
    resultNote: '3/3 rows within tolerance (max deviation 1.8%).'
  },
  {
    id: 'geometry',
    name: 'Polygon Geometric Closure',
    description: 'Every Khesra polygon is closed, non-self-intersecting and within the Halka boundary.',
    durationMs: 1100,
    resultNote: 'All polygons closed; 0 topology errors.'
  },
  {
    id: 'keys',
    name: 'Key Collision Test',
    description: 'Generated 14-character ULPINs are unique across the national Parcel Spine.',
    durationMs: 700,
    resultNote: '0 collisions against 1,28,430 existing ULPINs.'
  },
  {
    id: 'gort',
    name: 'GoRT Compliance Check',
    description: 'All local terms resolve to a DoLR Glossary of Revenue Terms canonical key.',
    durationMs: 800,
    resultNote: '8/8 columns mapped to GoRT keys.'
  }
];

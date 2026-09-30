export type StateCode = 'CH' | 'TN' | 'BR';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'pa';

export type LandUseCategory = 
  | 'Residential'
  | 'Commercial'
  | 'Agricultural'
  | 'Industrial'
  | 'Public & Semi-Public'
  | 'Water Body / Eco-Sensitive'
  | 'Transport / Utilities';

export interface Provenance {
  sourceDepartment: string;
  sourceSystem: string;
  recordId: string;
  lastSynced: string;
  verified: boolean;
}

export interface OwnerParty {
  id: string;
  name: string; // Transliterated/original
  maskedName: string; // DPDP compliant
  shareNumerator: number;
  shareDenominator: number;
  sharePercentage: number;
  aadhaarToken: string; // Virtual token, never raw
  gender: string;
  relationType?: string;
  relativeName?: string;
}

export interface SaleDeedRecord {
  deedNumber: string;
  registrationDate: string;
  subRegistrarOffice: string;
  sellerName: string;
  buyerName: string;
  declaredValueInr: number;
  guidelineValueInr: number;
  stampDutyPaidInr: number;
  documentHash: string;
}

export interface EncumbranceRecord {
  id: string;
  type: 'Mortgage' | 'Court Attachment' | 'Lease' | 'Tax Lien';
  institution: string;
  amountInr: number;
  registrationDate: string;
  dischargeDate?: string;
  status: 'ACTIVE' | 'DISCHARGED';
  cersaiReference?: string;
}

export interface LitigationRecord {
  caseNumber: string;
  courtName: string;
  filingDate: string;
  petitioner: string;
  respondent: string;
  stayOrderActive: boolean;
  subject: string;
}

export interface TaxAssessment {
  propertyTaxId: string;
  municipalWard: string;
  annualValueInr: number;
  currentDemandInr: number;
  arrearsInr: number;
  paymentStatus: 'PAID' | 'PENDING' | 'DEFAULTED';
  lastPaidDate?: string;
  assessedAreaSqm: number;
}

export interface SatelliteBuildingDetection {
  detected: boolean;
  footprintAreaSqm: number;
  estimatedFloors: number;
  heightMeters: number;
  detectionYear: number;
  hasBuildingPermission: boolean;
  permissionNumber?: string;
  unauthorizedAreaSqm?: number;
}

export interface PlantedAnomaly {
  type: 
    | 'AREA_MISMATCH'
    | 'UNASSESSED_CONSTRUCTION'
    | 'ZOMBIE_MUTATION'
    | 'LIS_PENDENS_VIOLATION'
    | 'UNREGISTERED_MORTGAGE';
  title: string;
  description: string;
  financialImpactInr: number;
  responsibleDepartment: string;
  recommendedAction: string;
}

export interface Parcel {
  ulpin: string; // 14-char Bhu-Aadhar ID
  state: StateCode;
  district: string;
  talukOrTehsil: string;
  villageOrSector: string;
  localSurveyNo: string; // Khasra / Survey No
  subDivisionNo?: string;
  areaSqm: number;
  displayUnits: {
    stateUnitName: string;
    stateUnitValue: string;
  };
  landUse: LandUseCategory;
  zoningCode: string;
  urdpfiColor: string; // Standard URDPFI color
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][]; // Relative or Lat/Lng
  };
  owners: OwnerParty[];
  deeds: SaleDeedRecord[];
  encumbrances: EncumbranceRecord[];
  litigation?: LitigationRecord;
  tax: TaxAssessment;
  satelliteData: SatelliteBuildingDetection;
  lineage: {
    parentUlpin?: string;
    splitDate?: string;
    mergedUlpins?: string[];
    childrenUlpins?: string[];
  };
  integrityScore: number; // 0 - 100
  plantedAnomaly?: PlantedAnomaly;
  provenance: Record<string, Provenance>;
  validFrom: string; // Real-world valid time
  systemTime: string; // System ingestion time
}

export interface GoRTTerm {
  canonicalKey: string;
  localTerm: string;
  state: StateCode | 'ALL';
  language: LanguageCode;
  ladmEquivalent: string;
  englishMeaning: string;
  plainDescription: string;
  legalContext: string;
}

export interface CloudEvent {
  id: string;
  source: string;
  type: 
    | 'in.gov.landstack.deed.registered'
    | 'in.gov.landstack.mutation.initiated'
    | 'in.gov.landstack.mutation.approved'
    | 'in.gov.landstack.charge.created'
    | 'in.gov.landstack.litigation.flagged'
    | 'in.gov.landstack.tax.updated'
    | 'in.gov.landstack.satellite.anomaly_detected';
  time: string;
  datacontenttype: string;
  data: Record<string, any>;
}

export interface WorkflowCase {
  caseId: string;
  ulpin: string;
  caseType: 'MUTATION' | 'ENCUMBRANCE_NOC' | 'RECORD_CORRECTION' | 'PARTITION';
  applicantName: string;
  applicantRole: string;
  stage: 'DEED_REGISTERED' | 'FIELD_VERIFICATION' | 'REVENUE_REVIEW' | 'TAHSILDAR_APPROVAL' | 'COMPLETED' | 'REJECTED';
  assignedRole: string;
  assignedOffice: string;
  slaDaysTotal: number;
  slaDaysElapsed: number;
  openedAt: string;
  eventsLog: {
    timestamp: string;
    actor: string;
    action: string;
    note: string;
  }[];
}

export interface StateProfile {
  state: StateCode;
  stateName: string;
  capital: string;
  languages: LanguageCode[];
  defaultUnits: {
    name: string;
    ratioToSqm: number;
    subdivisionName?: string;
    subdivisionRatio?: number;
  };
  recordNames: {
    ror: string;
    surveyMap: string;
    mutation: string;
    encumbrance: string;
  };
  revenueOffices: {
    fieldLevel: string;
    intermediateLevel: string;
    approvalLevel: string;
  };
}

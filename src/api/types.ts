// Shapes returned by the Saar API. The mock client in ./client.ts returns
// exactly these, so the real backend only has to match this file.

export type StateCode = 'CH' | 'TN' | 'BR';
export type PropertyType = 'House' | 'Shop' | 'Farm land' | 'Plot' | 'Office';
export type LandUse = 'Residential' | 'Commercial' | 'Farming' | 'Mixed use' | 'Public';
export type Verdict = 'safe' | 'caution' | 'risky';
export type Point = [number, number];

export interface Owner {
  name: string;
  relation?: string;
  sharePercent: number;
  since: string;
}

export interface HistoryEvent {
  date: string;
  title: string;
  detail: string;
  office: string;
  kind: 'sale' | 'transfer' | 'loan' | 'split' | 'court' | 'tax' | 'building' | 'survey';
}

export interface Loan {
  lender: string;
  amount: number;
  since: string;
  status: 'Active' | 'Closed';
  inStateRecords: boolean;
}

export interface CourtCase {
  caseNo: string;
  court: string;
  filed: string;
  summary: string;
  saleBlocked: boolean;
  status: 'Ongoing' | 'Closed';
}

export interface Tax {
  taxId: string;
  ward: string;
  annual: number;
  due: number;
  status: 'Paid' | 'Due' | 'Overdue';
  lastPaid?: string;
  assessedFor: string;
}

export interface Building {
  floors: number;
  heightM: number;
  builtAreaSqm: number;
  approved: boolean;
  permitNo?: string;
  seenOnSatellite: string;
}

export interface BuildRules {
  zone: string;
  maxFloors: number;
  maxHeightM: number;
  frontGapM: number;
  sideGapM: number;
  rearGapM: number;
  maxCoveragePercent: number;
  floorAreaRatio: number;
}

export interface Source {
  record: string;
  office: string;
  updated: string;
}

export interface Property {
  id: string;
  plotNo: string;
  title: string;
  locality: string;
  city: string;
  district: string;
  state: StateCode;
  areaId: string;
  type: PropertyType;
  landUse: LandUse;
  areaSqm: number;
  areaLocal: string;
  recordedAreaSqm?: number;
  image: string;
  shape: Point[];
  owners: Owner[];
  pendingTransfer?: { soldOn: string; buyer: string; deedNo: string };
  health: number;
  valueEstimate: number;
  govtRate: number;
  history: HistoryEvent[];
  loans: Loan[];
  cases: CourtCase[];
  tax: Tax;
  building: Building | null;
  rules: BuildRules;
  sources: Source[];
  lastUpdated: string;
}

export interface Check {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export interface MapArea {
  id: string;
  name: string;
  city: string;
  state: StateCode;
  width: number;
  height: number;
  roads: { d: string; width: number; label?: string; labelAt?: Point }[];
  others: Point[][];
  greens: Point[][];
  water?: Point[][];
}

export interface Issue {
  id: string;
  propertyId: string;
  kind: 'Unrecorded building' | 'Name not updated' | 'Area mismatch' | 'Sold during court case' | 'Hidden loan';
  title: string;
  detail: string;
  lossPerYear: number;
  office: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Notice sent' | 'Resolved';
  found: string;
}

export type ApplicationType =
  | 'Name transfer after sale'
  | 'Certified copy of land record'
  | 'Building permission'
  | 'Correct an error in records'
  | 'Split a plot'
  | 'No-dues certificate';

export type ApplicationStatus = 'Submitted' | 'In review' | 'Field visit' | 'Needs info' | 'Approved' | 'Rejected';

export interface ApplicationStep {
  label: string;
  office: string;
  date?: string;
  note?: string;
  state: 'done' | 'current' | 'upcoming';
}

export interface Application {
  id: string;
  type: ApplicationType;
  propertyId: string;
  applicant: string;
  submitted: string;
  expectedBy: string;
  status: ApplicationStatus;
  fee: number;
  steps: ApplicationStep[];
  documents: { name: string; size: string }[];
}

export interface Service {
  id: string;
  title: string;
  summary: string;
  time: string;
  fee: string;
  applicationType?: ApplicationType;
  href: string;
  image: string;
}

export interface Term {
  term: string;
  alsoCalled?: string;
  meaning: string;
  example: string;
  category: 'Records' | 'Measurement' | 'Process' | 'Offices' | 'Building';
}

export interface Faq {
  q: string;
  a: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href: string;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  role: 'citizen' | 'officer';
  office?: string;
  savedPropertyIds: string[];
}

export interface OfficeStats {
  recordsLinked: number;
  openIssues: number;
  moneyRecoverable: number;
  avgDaysToApprove: number;
  monthly: { month: string; approved: number; recovered: number }[];
  byOffice: { office: string; pending: number; overdue: number }[];
}

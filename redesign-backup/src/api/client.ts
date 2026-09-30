// Mock implementation of the Saar API.
// Every function is async and returns the same shapes a real backend would,
// so swapping this file for fetch() calls is the only change needed.

import type {
  Application,
  ApplicationType,
  Check,
  Issue,
  MapArea,
  Notification,
  OfficeStats,
  Property,
  PropertyType,
  StateCode,
  User,
  Verdict,
} from './types';
import { PROPERTIES } from '../data/properties';
import { AREAS } from '../data/areas';
import { ISSUES, OFFICE_STATS } from '../data/office';
import { APPLICATIONS } from '../data/applications';
import { CURRENT_USER, FAQS, NOTIFICATIONS, OFFICER_USER, SERVICES, TERMS } from '../data/content';
import { formatMoney } from '../lib/format';

const db = {
  properties: structuredClone(PROPERTIES),
  applications: structuredClone(APPLICATIONS),
  issues: structuredClone(ISSUES),
  notifications: structuredClone(NOTIFICATIONS),
};

const wait = <T,>(value: T, ms = 280 + Math.random() * 320): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

export class NotFoundError extends Error {}

/* ---------------------------------- Session --------------------------------- */

const SESSION_KEY = 'saar.session';

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeSession(user: User | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — session lasts for this tab only */
  }
}

let session: User | null = readSession();

export const auth = {
  current: () => session,
  async sendOtp(phone: string) {
    if (phone.replace(/\D/g, '').length < 10) throw new Error('Enter a valid 10-digit mobile number');
    return wait({ sentTo: phone }, 600);
  },
  async verifyOtp(_phone: string, otp: string, role: User['role']) {
    if (otp.length !== 6) throw new Error('Enter the 6-digit code');
    session = role === 'officer' ? OFFICER_USER : CURRENT_USER;
    writeSession(session);
    return wait(session, 500);
  },
  async signOut() {
    session = null;
    writeSession(null);
    return wait(true, 150);
  },
  async toggleSaved(propertyId: string) {
    if (!session) throw new Error('Sign in to save properties');
    const ids = session.savedPropertyIds;
    session = {
      ...session,
      savedPropertyIds: ids.includes(propertyId) ? ids.filter((i) => i !== propertyId) : [...ids, propertyId],
    };
    writeSession(session);
    return wait(session, 150);
  },
};

/* -------------------------------- Properties -------------------------------- */

export interface PropertyReport extends Property {
  checks: Check[];
  verdict: Verdict;
  area: MapArea | undefined;
}

export function runChecks(p: Property): Check[] {
  const activeLoans = p.loans.filter((l) => l.status === 'Active');
  const hiddenLoan = activeLoans.find((l) => !l.inStateRecords);
  const blockingCase = p.cases.find((c) => c.status === 'Ongoing' && c.saleBlocked);
  const openCase = p.cases.find((c) => c.status === 'Ongoing');
  const areaGap = p.recordedAreaSqm ? Math.abs(p.recordedAreaSqm - p.areaSqm) / p.areaSqm : 0;

  return [
    p.pendingTransfer
      ? { id: 'owner', label: 'Owner name is up to date', status: 'warn', detail: `Sold to ${p.pendingTransfer.buyer} on ${p.pendingTransfer.soldOn}, but records still show the old owner.` }
      : { id: 'owner', label: 'Owner name is up to date', status: 'pass', detail: `Records match the last registered sale.` },
    hiddenLoan
      ? { id: 'loans', label: 'Loans on this property', status: 'fail', detail: `${formatMoney(hiddenLoan.amount)} loan from ${hiddenLoan.lender} is missing from state records.` }
      : activeLoans.length
        ? { id: 'loans', label: 'Loans on this property', status: 'warn', detail: `${formatMoney(activeLoans[0].amount)} active loan from ${activeLoans[0].lender}. It must be repaid before a sale.` }
        : { id: 'loans', label: 'Loans on this property', status: 'pass', detail: 'No active loans.' },
    blockingCase
      ? { id: 'court', label: 'Court cases', status: 'fail', detail: `${blockingCase.court} has stopped any sale (case ${blockingCase.caseNo}).` }
      : openCase
        ? { id: 'court', label: 'Court cases', status: 'warn', detail: `Ongoing case ${openCase.caseNo}.` }
        : { id: 'court', label: 'Court cases', status: 'pass', detail: 'No court cases found.' },
    areaGap > 0.05
      ? { id: 'area', label: 'Area matches the map', status: 'warn', detail: `Record says ${p.recordedAreaSqm} m², map measures ${p.areaSqm} m² (${Math.round(areaGap * 100)}% gap).` }
      : { id: 'area', label: 'Area matches the map', status: 'pass', detail: `${p.areaSqm.toLocaleString('en-IN')} m² on both record and map.` },
    p.tax.status === 'Overdue'
      ? { id: 'tax', label: 'Property tax', status: 'warn', detail: `${formatMoney(p.tax.due)} overdue since ${p.tax.lastPaid ?? 'never'}.` }
      : { id: 'tax', label: 'Property tax', status: 'pass', detail: p.tax.due ? `${formatMoney(p.tax.due)} due this year — not overdue.` : 'All tax paid.' },
    !p.building
      ? { id: 'building', label: 'Building approval', status: 'pass', detail: 'Empty land — nothing built yet.' }
      : p.building.approved
        ? { id: 'building', label: 'Building approval', status: 'pass', detail: `Approved (${p.building.permitNo}). Matches satellite image.` }
        : { id: 'building', label: 'Building approval', status: 'fail', detail: `${p.building.floors} floors built with no permission on file.` },
  ];
}

export function verdictOf(checks: Check[]): Verdict {
  if (checks.some((c) => c.status === 'fail')) return 'risky';
  if (checks.some((c) => c.status === 'warn')) return 'caution';
  return 'safe';
}

function toReport(p: Property): PropertyReport {
  const checks = runChecks(p);
  return { ...p, checks, verdict: verdictOf(checks), area: AREAS.find((a) => a.id === p.areaId) };
}

export interface SearchFilters {
  state?: StateCode | 'all';
  type?: PropertyType | 'all';
}

export const properties = {
  async search(query: string, filters: SearchFilters = {}) {
    const q = query.toLowerCase().replace(/\s+/g, ' ').trim();
    const results = db.properties.filter((p) => {
      if (filters.state && filters.state !== 'all' && p.state !== filters.state) return false;
      if (filters.type && filters.type !== 'all' && p.type !== filters.type) return false;
      if (!q) return true;
      const haystack = [p.id, p.plotNo, p.title, p.locality, p.city, p.district, ...p.owners.map((o) => o.name)]
        .join(' ')
        .toLowerCase();
      return q.split(' ').every((word) => haystack.includes(word));
    });
    return wait(results.map(toReport));
  },
  async get(id: string) {
    const p = db.properties.find((x) => x.id === id);
    if (!p) throw new NotFoundError(`No property with ID ${id}`);
    return wait(toReport(p));
  },
  async list(ids?: string[]) {
    const list = ids ? db.properties.filter((p) => ids.includes(p.id)) : db.properties;
    return wait(list.map(toReport));
  },
  async payTax(id: string) {
    const p = db.properties.find((x) => x.id === id);
    if (!p) throw new NotFoundError(id);
    const paid = p.tax.due;
    p.tax = { ...p.tax, due: 0, status: 'Paid', lastPaid: new Date().toISOString().slice(0, 10) };
    return wait({ paid, receiptNo: `RCPT-${Date.now().toString().slice(-8)}` }, 900);
  },
};

/* ----------------------------------- Maps ----------------------------------- */

export const maps = {
  async areas() {
    return wait(AREAS, 150);
  },
  async area(id: string) {
    const area = AREAS.find((a) => a.id === id);
    if (!area) throw new NotFoundError(id);
    const plots = db.properties.filter((p) => p.areaId === id).map(toReport);
    return wait({ area, plots });
  },
};

/* ------------------------------- Applications ------------------------------- */

export interface NewApplication {
  type: ApplicationType;
  propertyId: string;
  applicant: string;
  note?: string;
  documents: { name: string; size: string }[];
}

const FEES: Record<ApplicationType, number> = {
  'Name transfer after sale': 500,
  'Certified copy of land record': 100,
  'Building permission': 12500,
  'Correct an error in records': 0,
  'Split a plot': 1000,
  'No-dues certificate': 200,
};

const DAYS: Record<ApplicationType, number> = {
  'Name transfer after sale': 30,
  'Certified copy of land record': 1,
  'Building permission': 45,
  'Correct an error in records': 45,
  'Split a plot': 45,
  'No-dues certificate': 7,
};

export const applications = {
  async list() {
    return wait([...db.applications].sort((a, b) => b.submitted.localeCompare(a.submitted)));
  },
  async get(id: string) {
    const app = db.applications.find((a) => a.id === id);
    if (!app) throw new NotFoundError(id);
    return wait(app);
  },
  async create(input: NewApplication) {
    const today = new Date();
    const due = new Date(today.getTime() + DAYS[input.type] * 86400000);
    const app: Application = {
      id: `SR-26-0${4900 + db.applications.length}`,
      type: input.type,
      propertyId: input.propertyId,
      applicant: input.applicant,
      submitted: today.toISOString().slice(0, 10),
      expectedBy: due.toISOString().slice(0, 10),
      status: 'Submitted',
      fee: FEES[input.type],
      documents: input.documents,
      steps: [
        { label: 'Application received', office: 'Saar', date: today.toISOString().slice(0, 10), note: input.note, state: 'done' },
        { label: 'Documents checked', office: 'Assigned office', state: 'current' },
        { label: 'Decision', office: 'Assigned office', state: 'upcoming' },
      ],
    };
    db.applications.unshift(app);
    db.notifications.unshift({
      id: `n${Date.now()}`,
      title: 'Application submitted',
      body: `${input.type} — reference ${app.id}.`,
      time: 'Just now',
      unread: true,
      href: `/applications/${app.id}`,
    });
    return wait(app, 900);
  },
  fees: FEES,
  days: DAYS,
};

/* ---------------------------------- Office ---------------------------------- */

export const office = {
  async stats(): Promise<OfficeStats> {
    const open = db.issues.filter((i) => i.status !== 'Resolved');
    return wait({ ...OFFICE_STATS, openIssues: OFFICE_STATS.openIssues - (ISSUES.filter((i) => i.status !== 'Resolved').length - open.length) });
  },
  async issues() {
    return wait(db.issues);
  },
  async updateIssue(id: string, status: Issue['status']) {
    const issue = db.issues.find((i) => i.id === id);
    if (!issue) throw new NotFoundError(id);
    issue.status = status;
    return wait(issue, 400);
  },
};

/* --------------------------------- Content ---------------------------------- */

export const content = {
  services: () => wait(SERVICES, 120),
  terms: () => wait(TERMS, 120),
  faqs: () => wait(FAQS, 120),
};

export const notifications = {
  async list(): Promise<Notification[]> {
    return wait(db.notifications, 150);
  },
  async markAllRead() {
    db.notifications.forEach((n) => (n.unread = false));
    return wait(true, 100);
  },
};

import type { Faq, Notification, Service, Term, User } from '../api/types';
import { photos } from '../lib/images';

export const SERVICES: Service[] = [
  {
    id: 'check',
    title: 'Check a property before you buy',
    summary: 'Owners, loans, court cases, tax and building approvals — one report, in plain words.',
    time: 'Instant',
    fee: 'Free',
    href: '/search',
    image: photos.keys(800),
  },
  {
    id: 'transfer',
    title: 'Transfer the owner’s name after a sale',
    summary: 'Bought a property? Get your name onto the land record and the tax bill.',
    time: '15–30 days',
    fee: '₹500',
    applicationType: 'Name transfer after sale',
    href: '/applications/new?type=transfer',
    image: photos.eveningHouse(800),
  },
  {
    id: 'copy',
    title: 'Download a signed land record',
    summary: 'A digitally signed copy that banks and courts accept.',
    time: 'Within 24 hours',
    fee: '₹100',
    applicationType: 'Certified copy of land record',
    href: '/applications/new?type=copy',
    image: photos.blueprint(800),
  },
  {
    id: 'permit',
    title: 'Apply for building permission',
    summary: 'Upload your plan. We check it against local rules before it reaches the office.',
    time: '30–45 days',
    fee: 'From ₹5,000',
    applicationType: 'Building permission',
    href: '/applications/new?type=permit',
    image: photos.siteTeam(800),
  },
  {
    id: 'correct',
    title: 'Fix a mistake in your records',
    summary: 'Wrong area, spelling or share? Ask for a correction with supporting proof.',
    time: '30–45 days',
    fee: 'Free',
    applicationType: 'Correct an error in records',
    href: '/applications/new?type=correct',
    image: photos.crops(800),
  },
  {
    id: 'split',
    title: 'Split a plot between owners',
    summary: 'Divide land between family members or co-owners with a fresh survey.',
    time: '45 days',
    fee: '₹1,000',
    applicationType: 'Split a plot',
    href: '/applications/new?type=split',
    image: photos.field(800),
  },
];

export const TERMS: Term[] = [
  { term: 'Khasra', alsoCalled: 'Survey number, Khesra', meaning: 'The number given to a piece of land on the village map.', example: 'Khasra 512 is one specific field in Mastipur village.', category: 'Records' },
  { term: 'Jamabandi', alsoCalled: 'Record of Rights, RoR', meaning: 'The official record of who owns a piece of land and who farms it.', example: 'Your name should appear on the Jamabandi after you buy land.', category: 'Records' },
  { term: 'Patta', alsoCalled: 'Chitta (Tamil Nadu)', meaning: 'The ownership document for land in Tamil Nadu and a few other states.', example: 'The Patta for Survey 341/1 lists two owners with equal shares.', category: 'Records' },
  { term: 'Khatauni', alsoCalled: 'Khata, Khatian', meaning: 'A list of all land held by one family or person in a village.', example: 'One Khatauni can include many Khasra numbers.', category: 'Records' },
  { term: 'Mutation', alsoCalled: 'Dakhil-Kharij, Inteqal, Name transfer', meaning: 'Changing the owner’s name in land records after a sale or inheritance. Registering a sale does not do this by itself.', example: 'After buying a flat, you apply for mutation so the tax bill comes in your name.', category: 'Process' },
  { term: 'Encumbrance', alsoCalled: 'Loans & claims, EC', meaning: 'Any loan, mortgage or legal claim attached to a property.', example: 'A house with an active home loan has an encumbrance until the loan is repaid.', category: 'Records' },
  { term: 'Sale deed', alsoCalled: 'Registry, Bainama', meaning: 'The signed and registered document that proves a sale took place.', example: 'Sale deed CHD-2018-0941 records the sale of House 104-B.', category: 'Records' },
  { term: 'Stay order', alsoCalled: 'Lis pendens, Status quo', meaning: 'A court order saying the property must not be sold or changed while a case is going on.', example: 'Buying during a stay order can make the sale invalid.', category: 'Process' },
  { term: 'Circle rate', alsoCalled: 'Guideline value, Ready reckoner', meaning: 'The minimum price the government uses to calculate stamp duty.', example: 'If the circle rate is ₹2 Cr, stamp duty is charged on at least ₹2 Cr.', category: 'Process' },
  { term: 'Kanal & Marla', meaning: 'Land units used in Punjab, Haryana and Chandigarh. 1 Kanal = 20 Marla ≈ 506 m².', example: 'A 1 Kanal house in Chandigarh is about 5,445 sq ft.', category: 'Measurement' },
  { term: 'Bigha & Katha', meaning: 'Land units used in Bihar, UP and Bengal. Size varies by state. In Bihar, 1 Bigha = 20 Katha ≈ 2,529 m².', example: '10 Katha in Darbhanga is about 1,265 m².', category: 'Measurement' },
  { term: 'Cent', meaning: 'Land unit used in Tamil Nadu and Kerala. 100 Cents = 1 Acre ≈ 4,047 m².', example: 'A 20 Cent plot is about 809 m².', category: 'Measurement' },
  { term: 'Patwari', alsoCalled: 'Lekhpal, VAO, Karamchari', meaning: 'The village-level revenue officer who keeps land records and visits sites.', example: 'The Patwari visits the land before a name transfer is approved.', category: 'Offices' },
  { term: 'Tehsildar', alsoCalled: 'Taluk officer, Circle officer', meaning: 'The officer who approves changes to land records for a group of villages.', example: 'Your name transfer is final once the Tehsildar signs it.', category: 'Offices' },
  { term: 'Sub-Registrar', meaning: 'The office where sale deeds and other property documents are registered.', example: 'Buyer and seller both sign the sale deed at the Sub-Registrar office.', category: 'Offices' },
  { term: 'Setback', alsoCalled: 'Open space, Margin', meaning: 'The empty space you must leave between your building and the plot boundary.', example: 'A 3 m front setback means the building must start 3 m from the road edge.', category: 'Building' },
  { term: 'FAR', alsoCalled: 'Floor Area Ratio, FSI', meaning: 'Total floor area you may build, divided by the plot area.', example: 'On a 500 m² plot with FAR 1.75, you can build 875 m² in total across all floors.', category: 'Building' },
  { term: 'Ground coverage', meaning: 'The share of the plot the building can cover at ground level.', example: '65% coverage on a 500 m² plot allows a 325 m² footprint.', category: 'Building' },
];

export const FAQS: Faq[] = [
  { q: 'Is the information on Saar official?', a: 'Yes. Every detail comes directly from the government office that owns it — the revenue department, the registration office, the municipality or the bank registry. Each section shows which office it came from and when it was last updated.' },
  { q: 'Can I buy a property just because the report says “Clean record”?', a: 'A clean record means we found no problems in government records. You should still visit the property, check the seller’s identity, and ideally get a lawyer to review the sale deed.' },
  { q: 'Why is my name not showing after I bought a property?', a: 'Registering a sale deed does not automatically update the land record. You need to apply for a name transfer (also called mutation). You can do this online from the Services page.' },
  { q: 'How long does a name transfer take?', a: 'Usually 15 to 30 days. It includes a document check, a site visit by the local revenue officer, and approval by the Tehsildar. You can follow each step live under My applications.' },
  { q: 'Who can see my personal details?', a: 'Public reports show owner names only. Aadhaar, phone numbers and addresses are never shown. Officers see full details only for applications they are handling, and every view is logged.' },
  { q: 'Which states are on Saar?', a: 'Chandigarh, Tamil Nadu and Bihar are live today. Punjab, Karnataka and Odisha are being added next.' },
  { q: 'What if I find a mistake in my records?', a: 'Use “Fix a mistake in your records” on the Services page. Attach any proof you have. There is no fee.' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Site visit scheduled', body: 'Revenue officer will visit House 106-C on 2 Oct at 11:00 AM.', time: '2 hours ago', unread: true, href: '/applications/SR-26-04812' },
  { id: 'n2', title: 'Action needed on your building plan', body: 'Rear gap is 1.2 m — upload a revised plan with 2 m.', time: 'Yesterday', unread: true, href: '/applications/SR-26-04390' },
  { id: 'n3', title: 'Signed land record ready', body: 'Your copy for House 104-B is ready to download.', time: '3 Sep', unread: false, href: '/applications/SR-26-04577' },
  { id: 'n4', title: 'Property tax paid', body: '₹48,000 received for House 104-B. Receipt sent to your email.', time: '12 May', unread: false, href: '/property/10CH0220010401' },
];

export const CURRENT_USER: User = {
  name: 'Rohan Mehta',
  phone: '+91 98•••• 4410',
  email: 'rohan.m@example.in',
  role: 'citizen',
  savedPropertyIds: ['10CH0220010401', '10CH0220010805', '33TN0140034101'],
};

export const OFFICER_USER: User = {
  name: 'Kavita Rana',
  phone: '+91 97•••• 2208',
  email: 'kavita.rana@chd.gov.in',
  role: 'officer',
  office: 'Tehsil Office, Chandigarh',
  savedPropertyIds: [],
};

export const STATES = [
  { code: 'CH', name: 'Chandigarh', live: true, records: '48,210', units: 'Kanal, Marla' },
  { code: 'TN', name: 'Tamil Nadu', live: true, records: '52,960', units: 'Acre, Cent' },
  { code: 'BR', name: 'Bihar', live: true, records: '27,260', units: 'Bigha, Katha' },
  { code: 'PB', name: 'Punjab', live: false, records: 'Coming Dec 2026', units: 'Kanal, Marla' },
  { code: 'KA', name: 'Karnataka', live: false, records: 'Coming Jan 2027', units: 'Acre, Gunta' },
  { code: 'OD', name: 'Odisha', live: false, records: 'Coming Mar 2027', units: 'Acre, Decimal' },
] as const;

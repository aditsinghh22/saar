import { GoRTTerm, StateCode, StateProfile } from '../types/land';

// ==========================================
// STATE PROFILES (Configuration, not code)
// ==========================================
export const STATE_PROFILES: Record<StateCode, StateProfile> = {
  CH: {
    state: 'CH',
    stateName: 'Chandigarh (UT)',
    capital: 'Chandigarh',
    languages: ['en', 'hi', 'pa'],
    defaultUnits: {
      name: 'Kanal',
      ratioToSqm: 505.857,
      subdivisionName: 'Marla',
      subdivisionRatio: 25.293
    },
    recordNames: {
      ror: 'Jamabandi',
      surveyMap: 'Massavi / Aks Shajra',
      mutation: 'Inteqal',
      encumbrance: 'Rahen Register'
    },
    revenueOffices: {
      fieldLevel: 'Patwari',
      intermediateLevel: 'Kanungo',
      approvalLevel: 'Tahsildar'
    }
  },
  TN: {
    state: 'TN',
    stateName: 'Tamil Nadu',
    capital: 'Chennai',
    languages: ['en', 'ta'],
    defaultUnits: {
      name: 'Acre',
      ratioToSqm: 4046.86,
      subdivisionName: 'Cent',
      subdivisionRatio: 40.4686
    },
    recordNames: {
      ror: 'Patta / Chitta',
      surveyMap: 'FMB Sketch',
      mutation: 'Patta Transfer',
      encumbrance: 'Encumbrance Certificate (EC)'
    },
    revenueOffices: {
      fieldLevel: 'Village Administrative Officer (VAO)',
      intermediateLevel: 'Revenue Inspector',
      approvalLevel: 'Tahsildar'
    }
  },
  BR: {
    state: 'BR',
    stateName: 'Bihar',
    capital: 'Patna',
    languages: ['en', 'hi'],
    defaultUnits: {
      name: 'Bigha',
      ratioToSqm: 2529.29,
      subdivisionName: 'Katha',
      subdivisionRatio: 126.46
    },
    recordNames: {
      ror: 'Jamabandi Register II',
      surveyMap: 'Cadastral Survey (Khatiyan) Map',
      mutation: 'Dakhil-Kharij',
      encumbrance: 'Encumbrance Register'
    },
    revenueOffices: {
      fieldLevel: 'Revenue Karmachari',
      intermediateLevel: 'Circle Inspector',
      approvalLevel: 'Circle Officer (CO)'
    }
  }
};

// ==========================================
// DoLR GLOSSARY OF REVENUE TERMS (GoRT)
// ==========================================
export const GORT_TERMS: GoRTTerm[] = [
  {
    canonicalKey: 'RECORD_OF_RIGHTS',
    localTerm: 'Jamabandi',
    state: 'CH',
    language: 'pa',
    ladmEquivalent: 'BAUnit + RRR (Right)',
    englishMeaning: 'Record of Rights',
    plainDescription: 'The official register of who owns and cultivates each piece of land in a village.',
    legalContext: 'Punjab Land Revenue Act, 1887 — Section 31 (Record of Rights).'
  },
  {
    canonicalKey: 'RECORD_OF_RIGHTS',
    localTerm: 'Patta',
    state: 'TN',
    language: 'ta',
    ladmEquivalent: 'BAUnit + RRR (Right)',
    englishMeaning: 'Title / Record of Rights',
    plainDescription: 'Revenue document naming the owner and extent of each survey number in Tamil Nadu.',
    legalContext: 'Tamil Nadu Patta Pass Book Act, 1983.'
  },
  {
    canonicalKey: 'RECORD_OF_RIGHTS',
    localTerm: 'Chitta',
    state: 'TN',
    language: 'ta',
    ladmEquivalent: 'BAUnit (extract)',
    englishMeaning: 'Land extract',
    plainDescription: 'Village-level extract showing ownership, extent and classification (Nanjai/Punjai) of land.',
    legalContext: 'Maintained by the VAO under the Tamil Nadu Revenue Standing Orders.'
  },
  {
    canonicalKey: 'RECORD_OF_RIGHTS',
    localTerm: 'Khatian',
    state: 'BR',
    language: 'hi',
    ladmEquivalent: 'BAUnit + Party',
    englishMeaning: 'Record of Rights (survey era)',
    plainDescription: 'Survey-settlement record listing each raiyat (tenant-holder) and their plots.',
    legalContext: 'Bihar Tenancy Act, 1885 — Chapter X.'
  },
  {
    canonicalKey: 'PARCEL_NUMBER',
    localTerm: 'Khasra',
    state: 'ALL',
    language: 'hi',
    ladmEquivalent: 'SpatialUnit (label)',
    englishMeaning: 'Survey / plot number',
    plainDescription: 'The number that identifies a single field or plot on the village cadastral map.',
    legalContext: 'Used across North Indian revenue systems; Khesra in Bihar.'
  },
  {
    canonicalKey: 'MUTATION',
    localTerm: 'Inteqal',
    state: 'CH',
    language: 'pa',
    ladmEquivalent: 'AdministrativeSource (transfer) → RRR update',
    englishMeaning: 'Mutation of title',
    plainDescription: 'Updating the owner’s name in the revenue record after a sale, gift or inheritance.',
    legalContext: 'Punjab Land Revenue Act, 1887 — Section 34.'
  },
  {
    canonicalKey: 'MUTATION',
    localTerm: 'Dakhil-Kharij',
    state: 'BR',
    language: 'hi',
    ladmEquivalent: 'AdministrativeSource (transfer) → RRR update',
    englishMeaning: 'Mutation of title',
    plainDescription: 'Literally “entry and removal” — adding the new owner and striking out the old one.',
    legalContext: 'Bihar Land Mutation Act, 2011.'
  },
  {
    canonicalKey: 'ENCUMBRANCE',
    localTerm: 'Encumbrance Certificate (EC)',
    state: 'TN',
    language: 'en',
    ladmEquivalent: 'Restriction / Mortgage',
    englishMeaning: 'Encumbrance',
    plainDescription: 'Certificate listing all registered transactions and charges (loans, mortgages) on a property.',
    legalContext: 'Registration Act, 1908 — issued by the Sub-Registrar.'
  },
  {
    canonicalKey: 'LIS_PENDENS',
    localTerm: 'Lis Pendens',
    state: 'ALL',
    language: 'en',
    ladmEquivalent: 'Restriction (court)',
    englishMeaning: 'Pending litigation',
    plainDescription: 'While a court case over the property is pending, any transfer is subject to the court’s final decision.',
    legalContext: 'Transfer of Property Act, 1882 — Section 52.'
  },
  {
    canonicalKey: 'AREA_UNIT',
    localTerm: 'Kanal / Marla',
    state: 'CH',
    language: 'pa',
    ladmEquivalent: 'SpatialUnit.area (unit)',
    englishMeaning: 'Area units',
    plainDescription: '1 Kanal = 20 Marla ≈ 505.86 m².',
    legalContext: 'Customary unit recognised in Punjab, Haryana and Chandigarh revenue records.'
  },
  {
    canonicalKey: 'AREA_UNIT',
    localTerm: 'Cent',
    state: 'TN',
    language: 'ta',
    ladmEquivalent: 'SpatialUnit.area (unit)',
    englishMeaning: 'Area unit',
    plainDescription: '100 Cents = 1 Acre ≈ 4,046.86 m².',
    legalContext: 'Customary unit in Tamil Nadu and Kerala.'
  },
  {
    canonicalKey: 'AREA_UNIT',
    localTerm: 'Bigha / Katha',
    state: 'BR',
    language: 'hi',
    ladmEquivalent: 'SpatialUnit.area (unit)',
    englishMeaning: 'Area units',
    plainDescription: 'In Bihar, 1 Bigha = 20 Katha ≈ 2,529 m². Values vary by district.',
    legalContext: 'Bihar Special Survey & Settlement Act, 2011 standardises conversion.'
  },
  {
    canonicalKey: 'FIELD_OFFICER',
    localTerm: 'Patwari',
    state: 'CH',
    language: 'hi',
    ladmEquivalent: 'Party (role: surveyor/recorder)',
    englishMeaning: 'Village accountant',
    plainDescription: 'Village-level revenue official who maintains land records and verifies sites.',
    legalContext: 'Known as VAO in Tamil Nadu and Karmachari in Bihar.'
  },
  {
    canonicalKey: 'GUIDELINE_VALUE',
    localTerm: 'Collector Rate / Guideline Value',
    state: 'ALL',
    language: 'en',
    ladmEquivalent: 'BAUnit.valuation',
    englishMeaning: 'Minimum government valuation',
    plainDescription: 'The floor value used to compute stamp duty on a property transaction.',
    legalContext: 'Indian Stamp Act, 1899 — Section 47A (state amendments).'
  }
];

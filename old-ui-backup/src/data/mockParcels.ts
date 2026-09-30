import { Parcel } from '../types/land';

export const MOCK_PARCELS: Parcel[] = [
  // ==========================================
  // CHANDIGARH (UT) - SECTOR 22
  // ==========================================
  {
    ulpin: '10CH0220010401',
    state: 'CH',
    district: 'Chandigarh',
    talukOrTehsil: 'Chandigarh Urban',
    villageOrSector: 'Sector 22-B',
    localSurveyNo: 'Plot No. 104-B',
    subDivisionNo: '104/1',
    areaSqm: 505.8,
    displayUnits: {
      stateUnitName: 'Kanal-Marla',
      stateUnitValue: '1 Kanal 0 Marla'
    },
    landUse: 'Residential',
    zoningCode: 'R-1 (Urban Detached Housing)',
    urdpfiColor: '#fbbf24', // Warm residential amber
    geometry: {
      type: 'Polygon',
      coordinates: [
        [30.7342, 76.7761],
        [30.7348, 76.7765],
        [30.7346, 76.7772],
        [30.7340, 76.7768]
      ]
    },
    owners: [
      {
        id: 'CH-OWN-01',
        name: 'Harpreet Singh Sandhu',
        maskedName: 'H******* S**** S*****',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-9821-XXXX-3341',
        gender: 'Male',
        relationType: 's/o',
        relativeName: 'Late Balwant Singh Sandhu'
      }
    ],
    deeds: [
      {
        deedNumber: 'CHD-2018-0941',
        registrationDate: '2018-11-14',
        subRegistrarOffice: 'Sub-Registrar Sector 17, Chandigarh',
        sellerName: 'Navjot Kaur Dhillon',
        buyerName: 'Harpreet Singh Sandhu',
        declaredValueInr: 24500000,
        guidelineValueInr: 23800000,
        stampDutyPaidInr: 1470000,
        documentHash: '0x9fa4c7b89e1d82f3a647b901a1c3d987'
      }
    ],
    encumbrances: [
      {
        id: 'ENC-CH-01',
        type: 'Mortgage',
        institution: 'HDFC Bank Ltd., Sector 35 Branch',
        amountInr: 12000000,
        registrationDate: '2019-02-10',
        status: 'ACTIVE',
        cersaiReference: 'CERSAI-2019-0091823'
      }
    ],
    tax: {
      propertyTaxId: 'MC-CHD-22B-104',
      municipalWard: 'Ward 12 (Sector 22)',
      annualValueInr: 48000,
      currentDemandInr: 7200,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-05-12',
      assessedAreaSqm: 505.8
    },
    satelliteData: {
      detected: true,
      footprintAreaSqm: 260.4,
      estimatedFloors: 3,
      heightMeters: 10.5,
      detectionYear: 2025,
      hasBuildingPermission: true,
      permissionNumber: 'CH-BP-2019-881'
    },
    lineage: {
      parentUlpin: '10CH0220010400',
      splitDate: '2014-06-20'
    },
    integrityScore: 98,
    provenance: {
      ror: {
        sourceDepartment: 'Department of Revenue, Chandigarh Admn',
        sourceSystem: 'e-Dharni (Jamabandi Portal)',
        recordId: 'JAM-2022-22B-104',
        lastSynced: '2026-09-28 14:30 IST',
        verified: true
      },
      registration: {
        sourceDepartment: 'Inspector General of Registration',
        sourceSystem: 'NGDRS Chandigarh',
        recordId: 'REG-2018-0941',
        lastSynced: '2026-09-28 14:30 IST',
        verified: true
      },
      tax: {
        sourceDepartment: 'Municipal Corporation Chandigarh',
        sourceSystem: 'MC Property Tax Network',
        recordId: 'MC-CHD-22B-104',
        lastSynced: '2026-09-27 10:15 IST',
        verified: true
      }
    },
    validFrom: '2018-11-14',
    systemTime: '2026-09-28 14:30:00'
  },

  // Planted Anomaly 1: Satellite Unassessed Construction (Revenue Leakage)
  {
    ulpin: '10CH0220010502',
    state: 'CH',
    district: 'Chandigarh',
    talukOrTehsil: 'Chandigarh Urban',
    villageOrSector: 'Sector 22-B',
    localSurveyNo: 'Plot No. 105-B',
    areaSqm: 632.2,
    displayUnits: {
      stateUnitName: 'Kanal-Marla',
      stateUnitValue: '1 Kanal 5 Marla'
    },
    landUse: 'Residential',
    zoningCode: 'R-1 (Urban Detached Housing)',
    urdpfiColor: '#fbbf24',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [30.7348, 76.7765],
        [30.7355, 76.7770],
        [30.7352, 76.7778],
        [30.7346, 76.7772]
      ]
    },
    owners: [
      {
        id: 'CH-OWN-02',
        name: 'Amarjeet Kaur Brar',
        maskedName: 'A******* K*** B***',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-4410-XXXX-7782',
        gender: 'Female',
        relationType: 'w/o',
        relativeName: 'Jaswinder Singh Brar'
      }
    ],
    deeds: [
      {
        deedNumber: 'CHD-2011-0233',
        registrationDate: '2011-03-02',
        subRegistrarOffice: 'Sub-Registrar Sector 17, Chandigarh',
        sellerName: 'Estate of Late Kulwant Singh Brar',
        buyerName: 'Amarjeet Kaur Brar',
        declaredValueInr: 11500000,
        guidelineValueInr: 11200000,
        stampDutyPaidInr: 690000,
        documentHash: '0x3bd18e0c55a2f7419c02de7b6a1f4e28'
      }
    ],
    encumbrances: [],
    tax: {
      propertyTaxId: 'MC-CHD-22B-105',
      municipalWard: 'Ward 12 (Sector 22)',
      annualValueInr: 16000,
      currentDemandInr: 2400,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-04-30',
      assessedAreaSqm: 210
    },
    satelliteData: {
      detected: true,
      footprintAreaSqm: 296.7,
      estimatedFloors: 3,
      heightMeters: 11.0,
      detectionYear: 2025,
      hasBuildingPermission: false,
      unauthorizedAreaSqm: 680
    },
    lineage: {},
    integrityScore: 42,
    plantedAnomaly: {
      type: 'UNASSESSED_CONSTRUCTION',
      title: 'Unassessed Multi-Story Construction Detected via Satellite',
      description: 'Satellite footprint shows a 3-floor structure (~890 m² built-up) while municipal tax is assessed on a single floor of 210 m². No building plan approval exists on record.',
      financialImpactInr: 320000,
      responsibleDepartment: 'Municipal Corporation Chandigarh',
      recommendedAction: 'Issue re-assessment notice under Municipal Act and trigger building-plan regularisation inspection.'
    },
    provenance: {
      ror: {
        sourceDepartment: 'Department of Revenue, Chandigarh Admn',
        sourceSystem: 'e-Dharni (Jamabandi Portal)',
        recordId: 'JAM-2011-22B-105',
        lastSynced: '2026-09-28 14:30 IST',
        verified: true
      },
      tax: {
        sourceDepartment: 'Municipal Corporation Chandigarh',
        sourceSystem: 'MC Property Tax Network',
        recordId: 'MC-CHD-22B-105',
        lastSynced: '2026-09-27 10:15 IST',
        verified: false
      },
      satellite: {
        sourceDepartment: 'NRSC / Google Open Buildings',
        sourceSystem: 'Bhuvan 2.5D Building Footprints',
        recordId: 'SAT-2025-CH-22B-105',
        lastSynced: '2026-03-14 06:00 IST',
        verified: true
      }
    },
    validFrom: '2011-03-02',
    systemTime: '2026-09-28 14:30:00'
  },

  // Planted Anomaly 2: Zombie Mutation (Deed registered, RoR never updated)
  {
    ulpin: '10CH0220010603',
    state: 'CH',
    district: 'Chandigarh',
    talukOrTehsil: 'Chandigarh Urban',
    villageOrSector: 'Sector 22-C',
    localSurveyNo: 'Plot No. 106-C',
    areaSqm: 420.0,
    displayUnits: {
      stateUnitName: 'Kanal-Marla',
      stateUnitValue: '16.6 Marla'
    },
    landUse: 'Residential',
    zoningCode: 'R-1 (Urban Detached Housing)',
    urdpfiColor: '#fbbf24',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [30.7336, 76.7772],
        [30.7342, 76.7776],
        [30.7339, 76.7783],
        [30.7333, 76.7779]
      ]
    },
    owners: [
      {
        id: 'CH-OWN-03',
        name: 'Gurpreet Singh Walia (Deceased/Ex-Owner)',
        maskedName: 'G******* S**** W****',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-1187-XXXX-0923',
        gender: 'Male',
        relationType: 's/o',
        relativeName: 'Kartar Singh Walia'
      }
    ],
    deeds: [
      {
        deedNumber: 'CHD-2022-3318',
        registrationDate: '2022-07-11',
        subRegistrarOffice: 'Sub-Registrar Sector 17, Chandigarh',
        sellerName: 'Gurpreet Singh Walia',
        buyerName: 'Rajesh Kumar Arora',
        declaredValueInr: 19000000,
        guidelineValueInr: 19800000,
        stampDutyPaidInr: 1188000,
        documentHash: '0x71c2e9a4d0b83f56e1a7c4b29d08f3e6'
      }
    ],
    encumbrances: [],
    tax: {
      propertyTaxId: 'MC-CHD-22C-106',
      municipalWard: 'Ward 13 (Sector 22)',
      annualValueInr: 38000,
      currentDemandInr: 5700,
      arrearsInr: 76000,
      paymentStatus: 'DEFAULTED',
      lastPaidDate: '2024-03-28',
      assessedAreaSqm: 420
    },
    satelliteData: {
      detected: true,
      footprintAreaSqm: 260,
      estimatedFloors: 2,
      heightMeters: 7.2,
      detectionYear: 2025,
      hasBuildingPermission: true,
      permissionNumber: 'CH-BP-2005-114'
    },
    lineage: {},
    integrityScore: 54,
    plantedAnomaly: {
      type: 'ZOMBIE_MUTATION',
      title: 'Zombie Mutation: Deed Registered 4 Years Ago without RoR Mutation',
      description: 'Sale deed CHD-2022-3318 transferred the plot to Rajesh Kumar Arora in July 2022, but the Jamabandi still lists the seller. Tax demand is being raised against the former owner and is in default.',
      financialImpactInr: 76000,
      responsibleDepartment: 'Tehsil Revenue Office, Chandigarh',
      recommendedAction: 'Auto-initiate suo-motu mutation (Inteqal) and re-address municipal tax demand to the registered buyer.'
    },
    provenance: {
      ror: {
        sourceDepartment: 'Department of Revenue, Chandigarh Admn',
        sourceSystem: 'e-Dharni (Jamabandi Portal)',
        recordId: 'JAM-2004-22C-106',
        lastSynced: '2026-09-28 14:30 IST',
        verified: false
      },
      registration: {
        sourceDepartment: 'Inspector General of Registration',
        sourceSystem: 'NGDRS Chandigarh',
        recordId: 'REG-2022-3318',
        lastSynced: '2026-09-28 14:30 IST',
        verified: true
      }
    },
    validFrom: '2004-08-19',
    systemTime: '2026-09-28 14:30:00'
  },

  // Planted Anomaly 3: Lis Pendens Violation (High Court stay ignored)
  {
    ulpin: '10CH0220010704',
    state: 'CH',
    district: 'Chandigarh',
    talukOrTehsil: 'Chandigarh Urban',
    villageOrSector: 'Sector 22-A',
    localSurveyNo: 'SCO No. 107-Commercial',
    areaSqm: 252.9,
    displayUnits: {
      stateUnitName: 'Kanal-Marla',
      stateUnitValue: '10 Marla'
    },
    landUse: 'Commercial',
    zoningCode: 'C-2 (Shop-cum-Office)',
    urdpfiColor: '#ef4444',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [30.7352, 76.7778],
        [30.7357, 76.7781],
        [30.7355, 76.7786],
        [30.7350, 76.7783]
      ]
    },
    owners: [
      {
        id: 'CH-OWN-04',
        name: 'Vipin Mehra & Partners',
        maskedName: 'V**** M**** & P*******',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-6620-XXXX-1458',
        gender: 'Firm'
      }
    ],
    deeds: [
      {
        deedNumber: 'CHD-2025-0117',
        registrationDate: '2025-01-20',
        subRegistrarOffice: 'Sub-Registrar Sector 17, Chandigarh',
        sellerName: 'Legal Heirs of Late Om Prakash Sethi',
        buyerName: 'Vipin Mehra & Partners',
        declaredValueInr: 38500000,
        guidelineValueInr: 41000000,
        stampDutyPaidInr: 2310000,
        documentHash: '0xa84f02c9e17d6b35f90e2a1c48b7d5e3'
      }
    ],
    encumbrances: [],
    litigation: {
      caseNumber: 'CWP-4471-2024',
      courtName: 'Punjab & Haryana High Court',
      filingDate: '2024-08-21',
      petitioner: 'Anita Sethi',
      respondent: 'Rakesh Sethi & Others',
      stayOrderActive: true,
      subject: 'Inheritance dispute — status quo on title and possession ordered on 03-09-2024.'
    },
    tax: {
      propertyTaxId: 'MC-CHD-22A-107',
      municipalWard: 'Ward 11 (Sector 22)',
      annualValueInr: 124000,
      currentDemandInr: 18600,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-06-02',
      assessedAreaSqm: 252.9
    },
    satelliteData: {
      detected: true,
      footprintAreaSqm: 245,
      estimatedFloors: 4,
      heightMeters: 14.6,
      detectionYear: 2025,
      hasBuildingPermission: true,
      permissionNumber: 'CH-BP-1998-0402'
    },
    lineage: {},
    integrityScore: 32,
    plantedAnomaly: {
      type: 'LIS_PENDENS_VIOLATION',
      title: 'Active High Court Stay Order Violated during Registration',
      description: 'Sale deed CHD-2025-0117 was registered on 20-01-2025 while CWP-4471-2024 carried an active status-quo order. The Sub-Registrar had no automated court-order check.',
      financialImpactInr: 0,
      responsibleDepartment: 'Sub-Registrar Sector 17, Chandigarh',
      recommendedAction: 'Flag deed as voidable, notify High Court registry and freeze further mutation until disposal.'
    },
    provenance: {
      registration: {
        sourceDepartment: 'Inspector General of Registration',
        sourceSystem: 'NGDRS Chandigarh',
        recordId: 'REG-2025-0117',
        lastSynced: '2026-09-28 14:30 IST',
        verified: true
      },
      litigation: {
        sourceDepartment: 'eCourts Services',
        sourceSystem: 'NJDG / High Court CIS',
        recordId: 'CWP-4471-2024',
        lastSynced: '2026-09-26 22:00 IST',
        verified: true
      }
    },
    validFrom: '2025-01-20',
    systemTime: '2026-09-28 14:30:00'
  },

  // ==========================================
  // TAMIL NADU - ALANGUDI VILLAGE, PUDUKKOTTAI
  // ==========================================
  {
    ulpin: '33TN0140034101',
    state: 'TN',
    district: 'Pudukkottai',
    talukOrTehsil: 'Alangudi',
    villageOrSector: 'Alangudi Village',
    localSurveyNo: 'Survey No. 341/1',
    areaSqm: 4046.8, // 1 Acre = 100 Cents
    displayUnits: {
      stateUnitName: 'Acre-Cent',
      stateUnitValue: '1 Acre 0 Cents'
    },
    landUse: 'Agricultural',
    zoningCode: 'AG-1 (Wet Land / Nanjai)',
    urdpfiColor: '#84cc16',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [10.3612, 78.9821],
        [10.3620, 78.9829],
        [10.3614, 78.9838],
        [10.3606, 78.9830]
      ]
    },
    owners: [
      {
        id: 'TN-OWN-01',
        name: 'M. Senthil Murugan',
        maskedName: 'M. S****** M******',
        shareNumerator: 1,
        shareDenominator: 2,
        sharePercentage: 50,
        aadhaarToken: 'VID-2231-XXXX-5519',
        gender: 'Male',
        relationType: 's/o',
        relativeName: 'Muthusamy'
      },
      {
        id: 'TN-OWN-02',
        name: 'S. Meenakshi',
        maskedName: 'S. M*******',
        shareNumerator: 1,
        shareDenominator: 2,
        sharePercentage: 50,
        aadhaarToken: 'VID-2231-XXXX-7730',
        gender: 'Female',
        relationType: 'd/o',
        relativeName: 'Muthusamy'
      }
    ],
    deeds: [],
    encumbrances: [
      {
        id: 'ENC-TN-01',
        type: 'Mortgage',
        institution: 'Indian Bank, Alangudi Branch',
        amountInr: 300000,
        registrationDate: '2020-06-01',
        dischargeDate: '2023-08-10',
        status: 'DISCHARGED',
        cersaiReference: 'CERSAI-2020-3318204'
      }
    ],
    tax: {
      propertyTaxId: 'TN-ALG-341-1',
      municipalWard: 'Alangudi Village Panchayat',
      annualValueInr: 1200,
      currentDemandInr: 1200,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-07-01',
      assessedAreaSqm: 4046.8
    },
    satelliteData: {
      detected: false,
      footprintAreaSqm: 0,
      estimatedFloors: 0,
      heightMeters: 0,
      detectionYear: 2025,
      hasBuildingPermission: false
    },
    lineage: {
      parentUlpin: '33TN0140034100',
      splitDate: '2016-04-12'
    },
    integrityScore: 96,
    provenance: {
      ror: {
        sourceDepartment: 'Revenue & Disaster Management Dept, Tamil Nadu',
        sourceSystem: 'TN e-Services (Patta / Chitta)',
        recordId: 'PATTA-ALG-1182',
        lastSynced: '2026-09-25 18:00 IST',
        verified: true
      },
      survey: {
        sourceDepartment: 'Survey & Settlement Dept, Tamil Nadu',
        sourceSystem: 'TN FMB Sketch Repository',
        recordId: 'FMB-ALG-341',
        lastSynced: '2026-08-02 09:00 IST',
        verified: true
      }
    },
    validFrom: '2016-04-12',
    systemTime: '2026-09-25 18:00:00'
  },

  // Planted Anomaly 4: Cadastral Boundary Mismatch
  {
    ulpin: '33TN0140034202',
    state: 'TN',
    district: 'Pudukkottai',
    talukOrTehsil: 'Alangudi',
    villageOrSector: 'Alangudi Village',
    localSurveyNo: 'Survey No. 342/2',
    areaSqm: 1080.0, // Actual Surveyed Polygon area
    displayUnits: {
      stateUnitName: 'Acre-Cent',
      stateUnitValue: '26.7 Cents (Patta: 30.9 Cents)'
    },
    landUse: 'Agricultural',
    zoningCode: 'AG-2 (Dry Land / Punjai)',
    urdpfiColor: '#84cc16',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [10.3620, 78.9829],
        [10.3625, 78.9834],
        [10.3621, 78.9840],
        [10.3614, 78.9838]
      ]
    },
    owners: [
      {
        id: 'TN-OWN-03',
        name: 'K. Palanivel',
        maskedName: 'K. P*******',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-8812-XXXX-0417',
        gender: 'Male',
        relationType: 's/o',
        relativeName: 'Kandasamy'
      }
    ],
    deeds: [
      {
        deedNumber: 'ALG-1998-0077',
        registrationDate: '1998-01-22',
        subRegistrarOffice: 'Sub-Registrar Office, Alangudi',
        sellerName: 'R. Ganesan',
        buyerName: 'K. Palanivel',
        declaredValueInr: 85000,
        guidelineValueInr: 82000,
        stampDutyPaidInr: 6800,
        documentHash: '0x0c4e8b21f7a95d36c2e10b8f4a7d9e52'
      }
    ],
    encumbrances: [],
    tax: {
      propertyTaxId: 'TN-ALG-342-2',
      municipalWard: 'Alangudi Village Panchayat',
      annualValueInr: 400,
      currentDemandInr: 400,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-07-01',
      assessedAreaSqm: 1250
    },
    satelliteData: {
      detected: false,
      footprintAreaSqm: 0,
      estimatedFloors: 0,
      heightMeters: 0,
      detectionYear: 2025,
      hasBuildingPermission: false
    },
    lineage: {},
    integrityScore: 61,
    plantedAnomaly: {
      type: 'AREA_MISMATCH',
      title: 'Cadastral Boundary Mismatch: Patta Area Exceeds Surveyed Polygon by 15.7%',
      description: 'Patta records 1,250 m² (30.9 Cents) but the geo-referenced FMB polygon measures 1,080 m². The 170 m² difference overlaps the neighbouring poramboke (government) land.',
      financialImpactInr: 12000,
      responsibleDepartment: 'Taluk Office, Alangudi',
      recommendedAction: 'Schedule ETS re-survey with the Firka surveyor and correct the Patta extent under Section 14 of the TN Survey Act.'
    },
    provenance: {
      ror: {
        sourceDepartment: 'Revenue & Disaster Management Dept, Tamil Nadu',
        sourceSystem: 'TN e-Services (Patta / Chitta)',
        recordId: 'PATTA-ALG-0874',
        lastSynced: '2026-09-25 18:00 IST',
        verified: false
      },
      survey: {
        sourceDepartment: 'Survey & Settlement Dept, Tamil Nadu',
        sourceSystem: 'TN FMB Sketch Repository',
        recordId: 'FMB-ALG-342',
        lastSynced: '2026-08-02 09:00 IST',
        verified: true
      }
    },
    validFrom: '1998-01-22',
    systemTime: '2026-09-25 18:00:00'
  },

  // Planted Anomaly 5: Unregistered Mortgage (CERSAI charge missing in state EC)
  {
    ulpin: '33TN0140034303',
    state: 'TN',
    district: 'Pudukkottai',
    talukOrTehsil: 'Alangudi',
    villageOrSector: 'Alangudi Village',
    localSurveyNo: 'Survey No. 343/1',
    areaSqm: 809.3,
    displayUnits: {
      stateUnitName: 'Acre-Cent',
      stateUnitValue: '20 Cents'
    },
    landUse: 'Residential',
    zoningCode: 'R-V (Village Natham Residential)',
    urdpfiColor: '#fbbf24',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [10.3606, 78.9830],
        [10.3614, 78.9838],
        [10.3609, 78.9843],
        [10.3602, 78.9836]
      ]
    },
    owners: [
      {
        id: 'TN-OWN-04',
        name: 'Dharmalingam Chettiar',
        maskedName: 'D*********** C*******',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-5509-XXXX-2286',
        gender: 'Male',
        relationType: 's/o',
        relativeName: 'Ramasamy Chettiar'
      }
    ],
    deeds: [
      {
        deedNumber: 'ALG-2008-1142',
        registrationDate: '2008-10-30',
        subRegistrarOffice: 'Sub-Registrar Office, Alangudi',
        sellerName: 'P. Subramanian',
        buyerName: 'Dharmalingam Chettiar',
        declaredValueInr: 1450000,
        guidelineValueInr: 1400000,
        stampDutyPaidInr: 101500,
        documentHash: '0x5d9a3e7c12b04f86a1e2c9d70b3f8a41'
      }
    ],
    encumbrances: [
      {
        id: 'ENC-TN-02',
        type: 'Mortgage',
        institution: 'Karur Vysya Bank, Pudukkottai',
        amountInr: 4500000,
        registrationDate: '2021-11-08',
        status: 'ACTIVE',
        cersaiReference: 'CERSAI-2021-8840117'
      }
    ],
    tax: {
      propertyTaxId: 'TN-ALG-343-1',
      municipalWard: 'Alangudi Village Panchayat',
      annualValueInr: 5400,
      currentDemandInr: 5400,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-06-15',
      assessedAreaSqm: 310
    },
    satelliteData: {
      detected: true,
      footprintAreaSqm: 160,
      estimatedFloors: 2,
      heightMeters: 7.0,
      detectionYear: 2025,
      hasBuildingPermission: true,
      permissionNumber: 'ALG-PB-2018-77'
    },
    lineage: {},
    integrityScore: 38,
    plantedAnomaly: {
      type: 'UNREGISTERED_MORTGAGE',
      title: 'Double-Mortgage Threat: ₹45 Lakh CERSAI Charge Missing in State EC',
      description: 'A ₹45 L equitable mortgage by deposit of title deeds is registered on CERSAI but absent from the Tamil Nadu Encumbrance Certificate. A second lender relying on the state EC would see a clean title.',
      financialImpactInr: 4500000,
      responsibleDepartment: 'Sub-Registrar Office, Alangudi',
      recommendedAction: 'Sync CERSAI charge into state EC and alert all scheduled banks against fresh hypothecation of this ULPIN.'
    },
    provenance: {
      ror: {
        sourceDepartment: 'Revenue & Disaster Management Dept, Tamil Nadu',
        sourceSystem: 'TN e-Services (Patta / Chitta)',
        recordId: 'PATTA-ALG-1520',
        lastSynced: '2026-09-25 18:00 IST',
        verified: true
      },
      encumbrance: {
        sourceDepartment: 'Registration Dept, Tamil Nadu',
        sourceSystem: 'TNREGINET Encumbrance Certificate',
        recordId: 'EC-ALG-343-1',
        lastSynced: '2026-09-25 18:00 IST',
        verified: false
      },
      cersai: {
        sourceDepartment: 'Central Registry (CERSAI)',
        sourceSystem: 'CERSAI Security Interest Registry',
        recordId: 'CERSAI-2021-8840117',
        lastSynced: '2026-09-28 08:00 IST',
        verified: true
      }
    },
    validFrom: '2008-10-30',
    systemTime: '2026-09-28 08:00:00'
  },

  // ==========================================
  // BIHAR - MASTIPUR HALKA, DARBHANGA
  // ==========================================
  {
    ulpin: '10BR0210051201',
    state: 'BR',
    district: 'Darbhanga',
    talukOrTehsil: 'Darbhanga Sadar',
    villageOrSector: 'Mastipur Halka',
    localSurveyNo: 'Khesra No. 512',
    areaSqm: 1264.6, // Approx 10 Katha
    displayUnits: {
      stateUnitName: 'Bigha-Katha',
      stateUnitValue: '10 Katha'
    },
    landUse: 'Commercial',
    zoningCode: 'C-1 (Market Road Commercial)',
    urdpfiColor: '#ef4444',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [26.1542, 85.8971],
        [26.1549, 85.8978],
        [26.1544, 85.8986],
        [26.1537, 85.8979]
      ]
    },
    owners: [
      {
        id: 'BR-OWN-01',
        name: 'Ram Chandra Prasad',
        maskedName: 'R** C****** P*****',
        shareNumerator: 1,
        shareDenominator: 1,
        sharePercentage: 100,
        aadhaarToken: 'VID-7304-XXXX-6612',
        gender: 'Male',
        relationType: 's/o',
        relativeName: 'Shiv Nandan Prasad'
      }
    ],
    deeds: [
      {
        deedNumber: 'DBG-2015-4418',
        registrationDate: '2015-09-07',
        subRegistrarOffice: 'District Sub-Registry, Darbhanga',
        sellerName: 'Mohan Lal Jha',
        buyerName: 'Ram Chandra Prasad',
        declaredValueInr: 8400000,
        guidelineValueInr: 8100000,
        stampDutyPaidInr: 504000,
        documentHash: '0xe62b9d0f4c71a8e3b5d20c9f1a46e7b8'
      }
    ],
    encumbrances: [],
    tax: {
      propertyTaxId: 'DMC-MST-512',
      municipalWard: 'Ward 7 (Mastipur)',
      annualValueInr: 64000,
      currentDemandInr: 9600,
      arrearsInr: 0,
      paymentStatus: 'PAID',
      lastPaidDate: '2026-04-20',
      assessedAreaSqm: 1264.6
    },
    satelliteData: {
      detected: true,
      footprintAreaSqm: 640,
      estimatedFloors: 3,
      heightMeters: 11.5,
      detectionYear: 2025,
      hasBuildingPermission: true,
      permissionNumber: 'DMC-BP-2021-219'
    },
    lineage: {},
    integrityScore: 92,
    provenance: {
      ror: {
        sourceDepartment: 'Revenue & Land Reforms Dept, Bihar',
        sourceSystem: 'Bihar Bhumi (Jamabandi Register II)',
        recordId: 'JAM-MST-0512',
        lastSynced: '2026-09-22 20:00 IST',
        verified: true
      },
      tax: {
        sourceDepartment: 'Darbhanga Municipal Corporation',
        sourceSystem: 'DMC Holding Tax Portal',
        recordId: 'DMC-MST-512',
        lastSynced: '2026-09-20 11:00 IST',
        verified: true
      }
    },
    validFrom: '2015-09-07',
    systemTime: '2026-09-22 20:00:00'
  }
];

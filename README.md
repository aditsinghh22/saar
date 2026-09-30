# BHU-SETU (भू-सेतु) | National Land Stack DPI & Interoperability Platform

> **"Federate, don't centralize. One common data model (ISO 19152 LADM), many state profiles. Every fact carries its source, date, and tamper-evident audit trail."**

BHU-SETU is a next-generation Digital Public Infrastructure (DPI) platform designed for the **Department of Land Resources (DoLR), Ministry of Rural Development, Government of India**. It unifies cadastral workflows, reconciles departmental records across diverse states without taking their data away from them, and provides citizens with transparent **"Before You Buy, Before You Build"** statutory intelligence.

---

## 🏛️ Core Design Principles

1. **Federate, Don't Centralize (The UPI of Land)**
   Land is a State subject under the Constitution of India. States and departments never surrender their operational databases to a monolithic central database. Bhu-Setu holds:
   - The **Parcel Spine**: 14-character geocoded ULPIN (Bhu-Aadhar), polygon geometry, and cadastral lineage.
   - The **Linkage Index**: Asynchronous mapping of which record, in which department's system, belongs to which parcel.
   - **Cached Views** for sub-second GIS queries.

2. **One Common Data Model (ISO 19152 LADM) + State Profiles**
   - Built on the international standard **ISO 19152 LADM (Land Administration Domain Model)** around **RRR** (Rights, Restrictions, Responsibilities).
   - Maps the problem statement's 3 layers:
     - **Base Layer:** `SpatialUnit`, ULPIN, sub-divisions, parent-child lineage.
     - **Essential Layer:** `BAUnit`, `Party`, `Right`, `Mortgage`/`Restriction`, `AdministrativeSource` (RoR, registration deeds, encumbrance).
     - **Essential Overlays & Additional:** Master plan zoning, land-use classifications, municipal property tax, satellite earth observation.
   - **Adding a state means writing configuration (State Profile YAML), not code.**

3. **Every Fact Carries Its Source, Date & Cryptographic Audit**
   - Every value shown on screen displays its source department, source system ID, last-synced timestamp, and conflict alerts.
   - **Bitemporal Auditing:** Tracks valid real-world date vs. system transaction date.
   - **Tamper-Evident Ledger:** Immutably links all mutations, charges, and views in an HMAC-SHA-256 hash-chained block ledger with a "Re-verify Entire Chain" tool.

4. **GoRT (Glossary of Revenue Terms) Standardisation**
   - Deep integration with DoLR's official **Glossary of Revenue Terms (GoRT)**.
   - Canonical keys link local terminology (*Jamabandi, Khasra, Patta, Chitta, Khatian, Dakhil-Kharij, Cent, Bigha, Katha*) to standard LADM entities with interactive on-hover explanations.

---

## ✨ Features & Interactive Modules

### 1. 🗺️ GIS & Parcel Spine Explorer
- **Interactive 2D/3D Cadastral Viewer:** Real-time vector rendering of cadastral parcels with coordinate centroids, boundary nodes, and status indicators.
- **3D Isometric Tilt Perspective:** Toggle between 2D Orthogonal and dramatic 3D Isometric view with physical building extrusions and an animated radar sweep.
- **5-Layer Cadastral Stack:**
  1. Base Cadastre (`SpatialUnit`)
  2. Essential Rights (`BAUnit`, `Right`, `Party`, Encumbrances)
  3. URDPFI Master Plan Zoning (Residential, Commercial, Agricultural, Tourism)
  4. Satellite 2.5D Temporal (Google Open Buildings floor & height annotations)
  5. Record Integrity Heatmap (tinting parcels Green, Amber, Red based on discrepancies)
- **Bitemporal Time Machine:** Interactive timeline scrubber (2004, 2014, 2019, 2024, 2026) demonstrating cadastral subdivision splits and 20-year legal evolution.

### 2. ⚡ Cross-Department State Machine & Event Mesh
- **4 Department Actor Perspectives:**
  1. *Sub-Registrar Office:* Register sale deeds with automated Lis Pendens / High Court Stay Order blockers.
  2. *Tehsil Revenue Office:* Mutation (Inteqal / Dakhil-Kharij) state machine with live SLA countdown timers (Patwari verification -> Kanungo scrutiny -> Tahsildar sanction).
  3. *Municipal Tax Corporation:* Automatically re-assigns tax liability and demand upon Tahsildar approval without requiring office visits.
  4. *Bank Lending Officer (CERSAI):* Real-time double-mortgage collision blocker preventing fraudulent second hypothecations.
- **Live CloudEvents Monitor:** Asynchronous event bus streaming ISO/CloudEvents v1.0 JSON payloads in real time.

### 3. 🛡️ Citizen Services ("Before You Buy, Before You Build")
- **Title Due-Diligence Certificate:** 6-point statutory title audit delivering an instant Red / Amber / Green verdict on title safety.
- **3D Buildable Envelope Simulator (Three.js WebGL):**
  - Fully interactive 3D WebGL building model with orbit drag controls.
  - Interactive setback sliders (Front road setback, permissible floor count G+1 to G+4).
  - Physical floorplate glass extrusions, rooftop solar panels, setback perimeter guide poles, and Gross Floor Area (FAR) calculation.
  - Camera view presets: 3D Isometric, Street Front, and Bird's Eye Top View.
- **Verifiable Credential & Offline QR Code:** Ed25519 digitally signed title certificate with offline verification scanner simulator.
- **Zero-Knowledge Ownership Verification:** Verifies seller identity match against recorded title without exposing sensitive Aadhaar or private PII to the public (DPDP Act 2023 compliant).

### 4. 🚨 Record Integrity Engine & Revenue Leakage Dashboard
- **"Make Disagreement the Product":** Spatial SQL rule engine cross-reconciling disparate departmental silos.
- **5 Planted Anomaly Vectors Detected:**
  - *Satellite Unassessed Construction:* Multi-story building detected on land assessed as vacant (₹3.2L/yr leakage).
  - *Zombie Mutation:* Sale deed registered 4 years ago without Jamabandi mutation.
  - *Cadastral Boundary Mismatch:* Patta recorded area exceeds surveyed GIS polygon by 15.7%.
  - *Lis Pendens Violation:* Deed registered in violation of High Court status-quo injunction.
  - *CERSAI Lien Conflict:* ₹45L bank mortgage in CERSAI missing in state Encumbrance Certificate.
- **Actionable Worklist:** 1-click dispatch of formal notices to field officers with audit logging.

### 5. 🚀 5-Minute Live State Onboarding Studio
- **AI-Assisted Schema Mapper:** Ingest sample state revenue registers (e.g. Bihar Jamabandi), map columns with confidence scores (94% avg) to canonical LADM terms and GoRT dictionary.
- **4 Automated Validation Gates:** Unit conversion sanity test, polygon geometric closure, key collision test, and GoRT compliance check.
- **1-Click Live Deployment:** Instantly loads Bihar into the live map with regional Katha/Decimal units and Hindi vocabulary!

### 6. 📜 OGC Standards & Living Technical Document
- **Proof of Interoperability:** Live test harness for **OGC API – Features** (`/collections/cadastral_parcels/items?f=json`).
- **1-Click QGIS Connector:** Copyable WFS / GeoJSON endpoint for instant live loading into QGIS or ArcGIS.
- **Self-Generating Living Specification:** OpenAPI 3.1 definitions, ISO 19152 Indian profile Pydantic models, DPDP compliance matrix, and URDPFI land-use color schemes.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Theme** | Tailwind CSS v4, Custom Tactile 3D Design System, Lucide Icons |
| **3D Graphics** | Three.js (WebGL), Isometric SVG Extrusions |
| **Data Standards** | ISO 19152 LADM, OGC API – Features, CloudEvents v1.0, W3C Verifiable Credentials |
| **Domain Standards** | DoLR Glossary of Revenue Terms (GoRT), URDPFI Guidelines, DPDP Act 2023 |

---

## 🏃 Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production verification
npm run build
```

The web application runs locally at `http://localhost:5173/`.

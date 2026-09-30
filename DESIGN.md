# Saar — Design Specification

This document describes the Saar web app redesign (September 2026) precisely enough to rebuild it from scratch: visual language, tokens, components, every page, copy rules, imagery, motion, and the data contract the UI expects from the backend.

Stack: React 19 + TypeScript, Vite, Tailwind CSS v4 (CSS-first `@theme`), `react-router` v7, `lucide-react` icons, Three.js (building planner only, lazy-loaded).

---

## 1. Design principles

1. **Finished product, not a prototype.** Every screen behaves as if a backend exists: data loads asynchronously, shows skeletons while loading, has empty states and error states, and actions give feedback (toasts, button spinners).
2. **Plain language.** No jargon in the UI. Official or regional terms appear only in the "Land words, explained" glossary, always next to their plain meaning.
3. **Warm, light and architectural.** Inspired by architecture-studio sites (Bunkr Design, Brandingfolio): paper-toned background, huge tight headings, generous whitespace, real photography, numbered steps, `+` accordions, large rounded cards.
4. **Every fact shows its source.** Records always say which government office they came from and when they were last updated.

---

## 2. Brand

- **Name:** `saar`. The wordmark is always lowercase.
- **Wordmark:** Inter Tight, semibold, 26px, letter-spacing `-0.05em`.
- **Logo mark:** a 32×32 rounded square (radius 9) in forest `#1F4634`, with a stacked-layers glyph stroked in lime `#DDF08A`, stroke width 2.4 and round joins. On dark backgrounds the colours invert (lime square, forest stroke).
  ```svg
  <svg viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#1F4634"/>
  <path d="M8 20.5 16 25l8-4.5M8 15.5 16 20l8-4.5L16 11z" fill="none" stroke="#DDF08A" stroke-width="2.4" stroke-linejoin="round"/></svg>
  ```
- **Tagline:** "Know your land before you buy, build or borrow."
- **Voice:** calm, direct and reassuring. Short sentences, second person ("you"). Numbers in Indian format (₹2.45 Cr, ₹45 L, 1,28,430).

---

## 3. Design tokens

Defined in `src/index.css` under `@theme`, so Tailwind generates utilities such as `bg-paper`, `text-ink` and `font-display`.

### 3.1 Colour

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F5F2EB` | Page background |
| `sand` | `#ECE6DA` | Tab tracks, soft fills, skeleton base |
| `stone` | `#DDD5C6` | Input borders, stronger dividers |
| `line` | `#E5DFD3` | Card borders, hairlines |
| `ink` | `#1B1A16` | Primary text, dark buttons, toasts |
| `ink-2` | `#3D3B35` | Secondary text |
| `mute` | `#7A756B` | Body copy on paper, meta text |
| `faint` | `#A8A296` | Placeholders, timestamps |
| `forest` | `#1F4634` | **Primary brand**: primary buttons, footer, active states |
| `forest-2` | `#2C5C45` | Primary button hover |
| `mint` | `#E4EEE3` | Soft brand fill (selected rows, avatar bg) |
| `lime` | `#DDF08A` | Highlight: CTA band, "New" pill, selection, accents on forest |
| `clay` | `#E4623A` | Construction-orange accent, over-limit states |
| `clay-soft` | `#FBE7DD` | Soft clay fill |
| `sky` | `#DCE8F2` | Info badge bg (text `#2B5B84`) |
| `ok` / `ok-soft` | `#2F7A4E` / `#E3F1E7` | Pass, "Clean record" |
| `warn` / `warn-soft` | `#B7791F` / `#FBF0D9` | Caution, "Check before you buy" |
| `bad` / `bad-soft` | `#C2412D` / `#FBE4DF` | Problem, "Problems found" |

**Status colours are reserved** for pass, caution and problem. They are never used decoratively, and always appear with an icon and a label.

**Map land-use fills:** Residential `#F4C95D`, Commercial `#E8845C`, Farming `#9CC37A`, Mixed use `#C79BD8`, Public `#7FB3D5`.
**Map record-status fills:** clean `#8CC79B`, caution `#F2C66D`, problems `#EE8E78`.

Text selection uses a lime background with ink text.

### 3.2 Typography

Loaded from Google Fonts: `Inter Tight:400–800`, `Inter:400–700`, `Instrument Serif:ital 0,1`, `JetBrains Mono:400,500`.

| Token | Family | Role |
|---|---|---|
| `font-display` | Inter Tight | All headings (h1–h4), big numbers, card titles |
| `font-sans` | Inter | Body, UI (`font-feature-settings: 'cv11','ss01'`) |
| `font-serif` | Instrument Serif *italic* | One or two accent words per heading (the `.serif-accent` utility) |
| `font-mono` | JetBrains Mono | Eyebrows, IDs, reference numbers, map labels, dates in timelines |

Headings: `letter-spacing: -0.035em`, semibold (600), line-height `0.95–1.05`.

| Element | Size (mobile → desktop) |
|---|---|
| Home hero h1 | `3.25rem` → `sm:4.5rem` → `xl:5.5rem`, leading 0.95 |
| Page h1 | `3rem` → `sm:3.75rem` (services/help hero go to `sm:4.5rem`) |
| Section heading (h2) | `2.25rem` → `sm:3rem` → `lg:3.75rem`, leading 1.02 |
| Card title | 20–30px (`text-xl`–`text-3xl`) |
| Big stat | 36–60px display |
| Body lead | 18–20px, `text-mute`, `leading-relaxed` |
| Eyebrow | mono 0.72rem, uppercase, tracking 0.08em, `text-mute` |

**Heading pattern:** plain words, then a serif-italic phrase, e.g. `Everything about a property, *in one place.*`, `From search to *sorted* in four steps.`

### 3.3 Shape, elevation and spacing

- **Radius:** pills and buttons `rounded-full`; small cards `rounded-2xl` (16px); standard cards `rounded-3xl` (24px); hero and feature blocks `rounded-[2rem]` (32px).
- **Borders:** 1px `line` on white cards. Cards are flat by default.
- **Shadows:** used sparingly.
  - Card hover: `0 24px 48px -24px rgb(27 26 22 / .25)` plus `-translate-y-1`.
  - Search bar: `0 18px 40px -20px rgb(27 26 22 / .28)`.
  - Primary button: inner top highlight plus `0 6px 16px -6px rgb(31 70 52 / .6)`.
  - Floating panels and menus: `shadow-xl`.
- **Container (`container-x`):** max-width 1320px, centred; side padding 16px (mobile), 24px (≥640), 40px (≥1024).
- **Section rhythm:** `py-24` mobile, `lg:py-32` desktop. Page top padding `pt-10 lg:pt-14`.
- **Grid gaps:** 20px (`gap-5`) between cards.

### 3.4 Utilities (custom)

| Utility | Definition |
|---|---|
| `container-x` | Container described above |
| `serif-accent` | Instrument Serif, italic, weight 400, tracking -0.01em |
| `eyebrow` | Mono, 0.72rem, uppercase, 0.08em tracking, mute |
| `skeleton` | Shimmering gradient `#ECE6DA → #F5F1E8 → #ECE6DA`, 800px bg, 1.4s linear loop, radius 12px |
| `grid-paper` | 28px grid of 1px lines at `ink / 5%` (used behind plot drawings) |
| `no-scrollbar` | Hides scrollbars on horizontal tab strips |

---

## 4. Motion

| Name | Spec | Used for |
|---|---|---|
| `rise` | opacity 0→1, translateY 18px→0, 0.7s `cubic-bezier(.16,1,.3,1)` | Page hero, menus, toasts, modals, cards in results |
| `fade` | opacity 0→1, 0.4s ease-out | Tab panel swap, overlays, mobile menu |
| `marquee` | translateX 0→-50%, 40s linear infinite | "Records come directly from" strip |
| `shimmer` | background-position sweep, 1.4s | Skeletons |
| `.reveal` | opacity/translateY 24px, 0.8s same easing; toggled by IntersectionObserver (`rootMargin: 0 0 -8% 0`); optional stagger delay | All homepage sections, service and glossary cards |

- **Hover:** images scale to 1.04–1.05 over 700ms; arrow icons nudge 2px right; icon circles fill forest or ink.
- **Buttons:** `active:scale-[0.98]`.
- **Result grids:** stagger 50ms per card.
- **Reduced motion:** all animations are removed and `.reveal` elements are shown immediately.

---

## 5. Imagery

Unsplash photos, hot-linked as `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w={w}&q=80` (helper `photos.x(width)`):

| Key | Photo ID | Where |
|---|---|---|
| modernHouse | `1600585154340-be6161a56a0c` | Home hero, House 104-B |
| whiteHouse | `1523217582562-09d0def993a6` | House 105-B |
| eveningHouse | `1494526585095-c41746248156` | House 106-C, "Transfer name" service |
| poolVilla | `1613490493576-7fde63acd811` | (spare) |
| whiteVilla | `1512917774080-9991f1c4c750` | Survey 343/1 |
| apartment | `1545324418-cc1a3fa10c00` | Shop 107 |
| facade | `1488972685288-c3fd157d7c7a` | Khesra 512 |
| city | `1582407947304-fd86f028f716` | (spare) |
| siteTeam | `1541888946425-d81bb19240f5` | Plot 108, "How it works", login, permit service |
| siteWork | `1504307651254-35680f356dfd` | Khesra 514 |
| blueprint | `1503387762-592deb58ef4e` | "Plan your building" card, land-record service |
| field | `1500382017468-9049fed747ef` | Farm land 341/1, 513, split service |
| crops | `1625246333195-78d9c38ad449` | Farm 342/2, correction service |
| keys | `1560518883-ce09059eeffa` | "Check before you buy" card (luminosity blend, 25% opacity on forest) |
| jaipur | `1477587458883-47145ed94245` | "Where Saar works" |
| office | `1497366216548-37526070297c` | (spare) |
| architecture | `1487958449943-2429e8be8625` | (spare) |

**Treatments:**
- Photos sit in rounded containers.
- Pill tags on photos use `bg-white/90` with backdrop blur.
- Hero photo: a gradient from `ink/30` at the bottom.
- Login photo: a gradient from `forest/85` at the bottom, with a pull quote on top.

---

## 6. Components

### 6.1 Buttons (`components/ui/Button.tsx`)

- **Shape:** full pill, `font-medium`, gap 8px.
- **Sizes:** `sm` h-36 px-16 14px · `md` h-44 px-20 15px · `lg` h-52 px-28 16px.

| Variant | Style |
|---|---|
| `primary` | forest bg, white text, hover forest-2, brand shadow |
| `dark` | ink bg, white text, hover ink-2 |
| `outline` | 1px stone border, `white/60` bg, hover white bg |
| `ghost` | transparent, hover sand |
| `lime` | lime bg, ink text, hover brightness 95% |
| `white` | white bg, subtle shadow |

- `loading` swaps the leading icon for a spinning `LoaderCircle` and disables the button.
- `ButtonLink` is the router-link version; `iconRight` nudges right on hover.

### 6.2 Badges (`components/ui/Badge.tsx`)

- **Shape:** pill, 12px medium text, padding `4px 10px`.
- **Tones:** ok, warn, bad, neutral (sand/ink-2), info (sky/#2B5B84), dark (ink/white).
- **`VerdictBadge`:** icon plus label.

  | Verdict | Icon | Label |
  |---|---|---|
  | safe | CircleCheck | "Clean record" |
  | caution | CircleAlert | "Check before you buy" |
  | risky | CircleX | "Problems found" |

- **`StatusBadge` (applications):**

  | Status | Tone |
  |---|---|
  | Submitted, In review, Field visit | info (clock icon) |
  | Needs info | warn |
  | Approved | ok |
  | Rejected | bad |

### 6.3 Other UI primitives (`components/ui/misc.tsx`)

- **Card:** white, 1px line border, `rounded-3xl`.
- **SectionHeading:** eyebrow, then the h2 (with serif accent), then an optional lead paragraph (max-w-xl, 18px mute). An optional action sits right-aligned at the bottom on desktop.
- **Tabs:** a sand pill track with 4px padding. The active tab is white with a small shadow. An optional count chip is ink/white when the tab is active and `stone/70` when not. The strip scrolls sideways on mobile.
- **Accordion (Bunkr style):**
  - Hairline dividers between rows.
  - Each row: optional mono number (`01`, `02`…), a 20–24px display title, and a 40px round `+` button that rotates 45° and fills ink when open.
  - Opening animates `grid-template-rows 0fr → 1fr`. The first item is open by default.
- **Modal:**
  - Backdrop `ink/40` with a blur.
  - Panel: white, `rounded-3xl`, padding 32px.
  - On mobile it becomes a bottom sheet with a rounded top.
  - Closes on Escape or backdrop click; page scroll is locked while open.
- **Toast:** stacked bottom-right (bottom-centre on mobile). Ink card with a lime check (success) or clay alert (error), title plus optional body, auto-dismiss after 4.2s.
- **EmptyState:** dashed stone border, `white/50` bg, a 56px sand icon tile, title, body, optional action.
- **Field and input:**
  - Label is 14px medium ink-2 above the input; hint (faint) or error (bad) below.
  - Inputs: h-48, `rounded-xl`, 1px stone border.
  - Focus: forest border plus a 4px `forest/10` ring.
- **Skeleton:** the `skeleton` utility, shaped like the content it replaces.
- **Reveal:** a wrapper that applies `.reveal`, with an optional delay in ms.

### 6.4 Layout

**Navbar** (sticky, height 72px):
- **Background:** paper; after 8px of scroll it becomes `paper/85` with `backdrop-blur-xl` and a bottom hairline.
- **Left:** the logo.
- **Centre (≥1024px):** links "Check a property", "Map", "Plan a building", "Services", "Help". The active link is a white pill with a shadow. Officers also see a mint "Office" pill with a building icon (solid forest when active).
- **Right, signed out:** "Sign in" text link plus an "Apply online" primary small button (hidden below 640px).
- **Right, signed in:**
  - A bell with a clay unread dot. It opens a 352px "Updates" panel with "Mark all read"; each row has a clay dot if unread, a title, a body and a time.
  - An avatar (forest circle, lime initials) plus a chevron. It opens a menu: name and office/phone, "Office dashboard" (officers only), "My properties", "My applications", and "Sign out" in red.
- **Mobile:** a search icon plus a hamburger. The menu opens full width with 24px display-font links separated by hairlines, plus Sign in / Apply buttons.

**Footer** (forest background, white text):
- **Left:** "Every land record. *One place.*" (serif accent in lime), a one-line pitch, and an email pill form with a lime "Notify me" button.
- **Right:** three columns — *For citizens*, *Explore*, *For offices* — with mono uppercase headers at 45% white. Link hover turns lime and reveals an ↗ arrow.
- **Bottom bar:** lime logo mark, "© 2026 Saar. Land records made simple.", Privacy, Terms of use, Accessibility, "Helpline 1800-11-2026".
- **Signature detail:** a giant `saar` wordmark (31vw, bold, `white/6%`) bleeding off the bottom edge.

### 6.5 Property components

**PropertyCard:**
- 4:3 photo with a verdict badge top-left and a ↗ circle top-right (shown on hover).
- Mono eyebrow with the property type, then the plot number as the title, with the market value right-aligned.
- Three meta rows with icons: locality (MapPin), area in m² and local unit (Ruler), owner (UserRound).
- Has a skeleton twin.

**PropertyRow:** a compact row with a 64px thumbnail, title and locality, the verdict badge (≥640px), and an optional action.

**SearchBox:**
- A white pill with a leading search icon and the placeholder "Plot number, survey number, owner or locality". A forest "Search →" button sits inside the pill; on mobile it shows the arrow only.
- Underneath: "Try:" chips — `104-B Chandigarh`, `Survey 341/1`, `Khesra 512`, `Meera Joshi`.

**AreaMap (SVG):**
- **Canvas:** 800×520, bg `#F1EDE3` with a 20px grid at 4.5% ink.
- **Other plots:** `#E7E1D4` fill, `#D6CEBE` stroke.
- **Greens:** `#DCE9CF` with a dotted tree pattern.
- **Water:** `#D6E6F0` with a wave pattern.
- **Roads:** white strokes. Roads wider than 20 units get a dashed centreline `#E0D8C8`, and road names are drawn in mono uppercase 10px `faint`.
- **Linked plots:** land-use or status fill at 82% opacity, 1px ink stroke. Hover: 100% opacity and a 2px stroke. Selected: 3px stroke.
- **Plot label:** 12px semibold at the centroid, with the prefix stripped ("104-B").
- **Risky plots** in land-use mode get a red dot with a white ring at a corner.
- **North arrow:** top-right.
- **Hover tooltip:** top-left — plot number, type, area and local unit.

**MapLegend:** 12px swatches with labels.

**PlotOutline (SVG):**
- The plot polygon is normalised into a 260-unit box, filled lime at 55% with a 1.8px ink stroke.
- Vertices are drawn as white dots with ink strokes.
- Each edge carries a mono label with its real length in metres, calculated so the polygon's area equals the recorded area. Labels sit outside the shape and are rotated to stay upright.
- Drawn on the `grid-paper` background.

**BuildingViewer (Three.js):**
- **Scene:** transparent renderer on a `#F1EDE3` container, fog `#F1EDE3`, hemisphere light plus a warm soft-shadow sun, ACES tone mapping.
- **Ground:** a sage disc `#E6E8D6`.
- **Road:** runs along the front edge, `#D8D2C6`, with white dashes.
- **Plot:** a cream pad `#F1EBDD` with an ink boundary line.
- **Allowed building area:** a dashed ok-green `#2F7A4E` outline.
- **Floors:** 3.2m each. Each is an off-white slab and body with blue-grey glass bands. Floors above the limit render in translucent clay.
- **Roof:** a forest parapet (clay if over the limit).
- **Trees:** four simple trees for scale.
- **Controls:**
  - Drag to orbit (yaw and pitch); scroll to zoom (28–120).
  - Auto-rotate toggle: a lime chip with a spinning icon.
  - View presets in a white pill: `3D` · `Front` · `Top`.
  - Hint pill bottom-left: "Drag to turn · scroll to zoom".

---

## 7. Pages and routes

All pages share the Navbar and Footer except `/login`, which is a full-screen split layout. Scroll resets to the top on route change; `#hash` links scroll to their anchor.

| Route | Page | Auth |
|---|---|---|
| `/` | Home | public |
| `/search?q=&state=&type=&sort=` | Search results | public |
| `/property/:id` | Property report | public |
| `/map?area=&plot=&view=` | Land map | public |
| `/build`, `/build/:id` | Building planner (lazy chunk) | public |
| `/services` | Services | public |
| `/help` (`#words`, `#api`) | Help, glossary, API | public |
| `/applications` | My applications | signed in |
| `/applications/new?type=&property=` | New application wizard | signed in |
| `/applications/:id` | Application detail | signed in |
| `/account` | My account | signed in |
| `/office` | Office dashboard | officer |
| `/login?next=&role=` | Sign in | — |
| `*` | 404 | — |

Protected routes redirect to `/login?next=<current>` (plus `&role=officer` for `/office`).

### 7.1 Home (`/`)

1. **Hero:** a two-column grid, 1.05fr / 1fr.
   - **Left column:**
     - A "New" lime pill with the text "Bihar records are now live".
     - The h1: "Know your land *before* you buy, build or borrow." ("before" is the serif accent in forest).
     - Lead: "Saar brings every government record about a property into one simple report — owners, loans, court cases, tax and what you're allowed to build."
     - The SearchBox.
   - **Right column:**
     - A 4:5 rounded photo (modernHouse) with a live pill "Records updated today, 9:40 AM" (pinging green dot).
     - A floating white "Property report" card overlapping the bottom edge: House 104-B, Sector 22; "98% match" ok pill; four check rows (three green, one amber — "Home loan with HDFC — recorded"); a "See full report →" row.
2. **Source marquee:** a white band with top and bottom hairlines. "Records come directly from" followed by a scrolling list (Landmark icon plus a 20px display name) that fades at both edges: Revenue Department · Sub-Registrar offices · Municipal Corporations · Central loan registry · eCourts · Survey Department · Town Planning · Satellite imagery.
3. **Features bento** (6-column grid): "What you can do" / "Everything about a property, *in one place.*"
   - **Check before you buy** (4 columns): forest block with a keys photo at 25% opacity (luminosity blend), a lime icon tile, a ↗ circle, and a 48px white title.
   - **Explore the land map** (2 columns): a live AreaMap of Sector 22 at 1.35× zoom (1.45× on hover), with the title below.
   - **Plan your building** (3 columns): a white card with text on the left and the blueprint photo on the right.
   - **Track every application** (3 columns): a lime card with a mini tracker (five-segment progress bar, "Day 18 of 30", next step text).
4. **How it works:** white section. A sticky left column holds the heading "From search to *sorted* in four steps." and the siteTeam photo. The right column lists steps 01–04: mono number, 36px title, 18px body, hairline above each.
5. **Numbers:** a four-cell grid separated by 1px lines, inside a 32px-radius border:
   - "1,28,430" — properties with linked records
   - "11 days" — average name transfer, down from 45
   - "₹4.86 Cr" — unpaid tax found and recovered
   - "8 offices" — connected, updated every night
6. **Recently checked:** "See what a report *looks like.*" with an outline "Browse all properties →" button, followed by three PropertyCards (Plot 108, Survey 341/1, Shop 107).
7. **Online services:** `sand/60` section. Left: "Skip the queue. *Apply online.*" plus an "All services" button. Right: an Accordion of the six services (mono index, title; body has summary, Fee, Usually, and a dark "Start" button).
8. **People using Saar:** three quote cards (the middle one is forest with a lime quote icon; the others white with a clay quote icon), each with a 24px display quote, a name and a role.
9. **Coverage:** a split card — Jaipur photo left; right: "3 states live. *More every quarter.*" and a list of states (green or grey dot, name, local units, record count or "Coming …").
10. **Final CTA:** a lime block with a decorative forest ring. "Buying a property? Start with a free report." plus "Check a property" (primary) and "How we keep it safe" (white). Below: three trust points with icons.

### 7.2 Search (`/search`)

- Eyebrow "Check a property"; h1 "Find any property." or "Results for *“{q}”*"; a medium SearchBox.
- **Filter bar** (hairline below):
  - Type Tabs: All types · House · Plot · Farm land · Shop · Office.
  - A state select.
  - A sort select: Most relevant · Highest value · Problems first.
- **Summary line:** "N properties", then coloured dots with the clean / to check / with problems counts.
- **Results:** a 3-column grid of PropertyCards, staggered `rise`. Six skeleton cards while loading. EmptyState "No properties found" with a "Clear search" button.
- All filters live in the URL.

### 7.3 Property report (`/property/:id`)

- **Breadcrumb:** Properties › {locality} › {plotNo}.
- **Header:**
  - Mono "Property ID 10CH-0220-0104-01" (click copies it).
  - A 60px h1 with the plot number, and the locality line with a pin icon.
  - Actions: Save/Saved (bookmark; asks you to sign in if you aren't), Share (copies the link), and a dark "Download report" button.
- **Top grid** (1.6fr / 1fr):
  - **Left:** a large photo with type, land-use and area pills.
  - **Right, verdict card:** soft status background; mono "Our verdict" and "x/6 checks passed"; a 36px coloured verdict; one-line advice; six segmented bars, one per check.
  - **Right, facts card:** a 2×2 grid — Estimated market value, Government rate ("Used for stamp duty"), Area (m² and sq ft), Owner. Footnote: "Records last checked {n} days ago".
- **Sticky tab bar** under the navbar (paper, blurred). Tabs, with counts where relevant:
  - **Overview:**
    - A "Safety checks" card listing the six checks, each with an icon, label, detail and an OK / Check / Problem badge.
    - If the verdict isn't clean: a paper strip "Are you the owner? You can fix most of these online." with a "Request a correction" button.
    - Right column: a "Plot boundary" PlotOutline card, and a mini map card linking to `/map?area=…&plot=…`.
  - **Owners & history:**
    - Owner list: mint initials, name, relation, "since" date, share % and a share bar.
    - A warn card "Sold, but name not changed" with an "Apply for name transfer" button, if relevant.
    - A vertical timeline: 40px icon circles (the newest is forest with a lime icon), title, mono date, detail, and the office.
  - **Loans & court cases:** two cards.
    - Loans: "Still being repaid" / "Fully repaid", plus a "Missing from state records" badge where relevant.
    - Court cases: case number, court, summary, a red strip "Court has ordered that this property must not be sold", and the filed date.
    - Green empty messages when there's nothing to show.
  - **Property tax:**
    - Left: an amount-due block (ink when money is due, mint when clear) with a lime "Pay ₹x" button.
    - Right: tax details list (account number, ward, yearly tax, taxed for, last payment) and a warning if the building doesn't match what's taxed.
    - The pay modal has an amount summary, a UPI / Card / Net banking select and "Pay now". Paying updates the record and shows a receipt toast.
  - **Building rules:**
    - "What you can build here": a 2×3 grid — floors, height, total floor space, ground covered, front gap, sides/back gaps — plus "Open in 3D planner".
    - "What's there today": floors, height and built area, with an approved (green) or no-permission (red) note.
  - **Where this comes from:** a table of Record · Office · Last updated.
- **Loading:** a full-page skeleton. **Unknown ID:** the 404 page with property-specific text.

### 7.4 Land map (`/map`)

- h1 "Every plot, *at a glance.*". Area Tabs: Sector 22, Chandigarh · Alangudi, Pudukkottai · Mastipur, Darbhanga.
- **Map card** (fills 1fr): a floating toolbar with a Layers icon and "Land use" / "Record status" toggle (active is ink), plus a legend pill. Clicking a plot selects it; clicking again deselects it.
- **Selected-plot card** (bottom-left, `rise`): photo, plot number, type and area, verdict badge, "Open report →", close button.
- **Side panel** (340px): area name and "N plots on Saar", then a plot list (pin tile, plot number, owner, value, status dot; the selected row is mint). Footnote: "Grey plots are in the survey map but not yet linked to other records."

### 7.5 Building planner (`/build/:id?`)

- h1 "See what you can build — *before you hire anyone.*" A plot select lists all non-farm properties. Defaults to Plot 108.
- **Left:** the viewer (440/560px tall) with a floating info chip (plot number, area, zone). Below it, a four-cell metric strip: Footprint, Total floor space, Height, Rough build cost (₹2,400 per sq ft).
- **Right: "Adjust your design" sliders**
  - Sliders: Floors, Ground covered %, Gap at front, Gap at each side, Gap at back.
  - Each slider shows its value in display font and fills forest up to the value, or clay when the value breaks a rule.
  - Helper text under each: "Up to X allowed" / "At least X allowed".
- **Right: compliance card** (mint when every rule passes, clay-soft when one doesn't)
  - Title: "This design follows the rules" or "Some limits are crossed".
  - Five check rows: floors, height, total floor space, ground coverage, open space.
  - An "Apply for building permission" button.
- **Footnote:** "A guide, not an approval…" with a link to the glossary.
- **Maths:**
  - The plot is treated as a 1 : 1.3 rectangle.
  - Allowed building area = (width − 2 × side gap) × (depth − front gap − back gap).
  - Footprint = the smaller of the allowed building area and coverage % × plot area.
  - Height = floors × 3.2 m + 0.6 m.

### 7.6 Services (`/services`)

- Hero: "Land office work, *done from home.*" with a lead paragraph beside it.
- **Service cards** (3 columns): 16:10 photo with a mono index pill, 24px title, summary, and a footer showing fee and time with a round ↗ that fills forest on hover.
- **Support tiles** (three sand tiles): Call the helpline / WhatsApp us / Visit a help desk.

### 7.7 My applications (`/applications`)

- h1 "Where your files *are right now.*" plus a "New application" button.
- A warn banner "Action needed" (links to the first application that needs info).
- **Filter tabs:** All · In progress · Needs my action · Closed.
- **Rows** (3 columns):
  - Reference number, status badge, type title, submitted date and applicant.
  - A segmented progress bar: forest for done steps; for the current step, `forest/35` or warn; red for rejected.
  - Current step name and "Step x of y · expected by …".
  - A chevron.

### 7.8 Application detail (`/applications/:id`)

- Back link, reference number and status, h1 with the application type, "Download receipt".
- **Progress timeline:**
  - Steps are 36px circles joined by a line (forest once done).
  - Done: forest circle with a lime check. Current: a pulsing dot. Upcoming: a number.
  - Each step shows its office and date.
  - Office notes appear in paper boxes (warn box when the step needs info).
  - When the office has asked for something, an "Upload revised document" button opens a file picker. Uploading moves the application to "In review".
- **Side column:** a facts card (Applicant, Submitted, Expected by, Fee paid), a property row, and a documents list.

### 7.9 New application (`/applications/new`)

- **Stepper pills:** Service → Property → Documents → Review. Done steps are mint with a check; the current step is ink with a lime number.
- **Step 1 — Service:** a 2-column grid of selectable cards (2px forest border and mint background when chosen, with a radio tick).
- **Step 2 — Property:** a property select, the applicant's name (prefilled from the signed-in user), and an optional note.
- **Step 3 — Documents:**
  - A checklist of documents this service needs.
  - A dashed drop zone (turns mint while dragging; click to browse), then a file list with remove buttons.
  - Services with no required documents show a green "No documents needed" note.
- **Step 4 — Review:** a summary list, then "Pay ₹x & submit" or "Submit application". Submitting shows a toast and redirects to the new application.
- **Side column:** a property preview card (or a "Takes about 5 minutes" tip), and a lime fee card.
- Opening the page with `?type=` in the URL skips straight to step 2.

### 7.10 My account (`/account`)

- h1 "Namaste, *{first name}.*"
- **Three stat tiles:** saved properties, applications in progress, applications needing your action.
- **Saved properties:** a card of PropertyRows, each with a remove button.
- **Recent applications:** a card with status badges and "Start a new application".

### 7.11 Office dashboard (`/office`, officers only)

- Mono eyebrow with the office name; h1 "Good morning, *{first name}.*"; "Data as of {date}, 6:00 AM".
- **Four KPI tiles:** properties with linked records · records that don't match · unpaid tax that can be recovered (lime tile) · average days to approve.
- **Charts:** two single-series bar charts — "Applications approved each month" and "Tax recovered each month (₹ lakh)".
  - Forest bars with a 4px rounded top and 2px gaps.
  - Three hairline gridlines with mono tick labels; the axis maximum is rounded up to a clean value.
  - Hovering a bar dims the others and shows an ink tooltip. The latest month's label is bold.
- **"Pending by office":** a bar list showing the count and "n late" in red.
- **"Records to fix" worklist:**
  - Filter tabs: All / Open / Notice sent / Resolved.
  - Sorted High → Low priority.
  - Each row: priority badge with a dot, problem-type badge, mono ID and date found, title, detail, office, tax lost per year, and a "View property ↗" link.
  - Actions: "Send notice" (primary), "Mark resolved" (outline), or status badges once acted on.

### 7.12 Help (`/help`)

- h1 "Land records, *in words you know.*"
- **Common questions:** the heading on the left, an Accordion of seven FAQs on the right.
- **`#words` — "Land words, explained":**
  - A search pill and category tabs (All, Records, Process, Measurement, Offices, Building).
  - A 3-column grid of term cards: title, category chip, "Also called…", meaning, and a paper example box starting with a serif-italic "e.g.".
- **`#api` — "Use Saar in your own software.":** a forest split card with a darker `#16362A` code panel showing a sample JSON response in lime mono text, plus a copy button.

### 7.13 Sign in (`/login`)

- A split screen.
- **Left column:** logo, "Back to site", h1 "Sign in to *Saar*".
  - A role switch: Citizen / Government officer.
  - A +91 mobile field and a "Send code" button.
  - Then a 6-digit code field (centred mono, wide tracking; hint "Demo: any 6 digits will work"), "Verify & continue", and "Use a different number".
  - Privacy note with a shield icon.
- **Right column** (≥1024px): the siteTeam photo with a forest gradient and a citizen quote.
- After sign-in, officers go to `/office`; citizens go to `?next` or `/account`.

### 7.14 404

A lime compass tile, a large stone "404", "This page has moved plots", and "Go home" / "Search a property" buttons.

---

## 8. Language guide

| Never show | Show instead |
|---|---|
| ULPIN / Bhu-Aadhar | Property ID (formatted `10CH-0220-0104-01`) |
| RoR / Jamabandi / Khatauni (as labels) | Ownership record / land record |
| Mutation / Dakhil-Kharij / Inteqal | Name transfer (after sale) |
| Encumbrance / charge / CERSAI | Loans (and claims); "central loan registry" |
| Lis pendens / status-quo order | "Court has stopped any sale" |
| Integrity score | Record match (%) |
| Setback | Gap at front / sides / back |
| FAR / FSI | Total floor space |
| Ground coverage | Ground covered |
| Guideline / circle rate | Government rate ("used for stamp duty") |
| Anomaly / discrepancy | "Records that don't match", "Records to fix" |
| Zombie mutation | "Sold, but name not changed" |
| Unassessed construction | "3-floor house taxed as 1 floor" |
| Tahsildar sanction | Approval by Tehsildar |
| Patwari verification | Site visit by revenue officer |
| GoRT glossary | Land words, explained |

Verdict copy:
- **Clean record:** "All six checks passed. Records from every office agree."
- **Check before you buy:** "{n} thing(s) to look into before you pay any money."
- **Problems found:** "We found {n} problem(s). Talk to a lawyer before going ahead."

---

## 9. States and feedback

- **Loading:** a shaped skeleton for every async block (cards, rows, charts, map, the full property page).
- **Empty:** an EmptyState with an icon, a friendly sentence and a next action.
- **Errors:** an unknown property or application shows the 404 page with specific text; form errors appear under the field in `bad`; failed actions show an error toast.
- **Success:** every mutation shows a toast (saved, copied, paid, submitted, uploaded, notice sent, resolved).
- **Buttons:** show a spinner while working and are disabled until their form is valid.

---

## 10. Data contract (frontend ↔ backend)

The UI talks only to `src/api/client.ts`; its types are in `src/api/types.ts`. The mock client adds a 280–600ms delay and returns deep clones, like a real server. To connect a real backend, replace the function bodies with `fetch` calls that return the same types.

| Module | Functions |
|---|---|
| `auth` | `current()`, `sendOtp(phone)`, `verifyOtp(phone, otp, role)`, `signOut()`, `toggleSaved(propertyId)` (session is stored in `localStorage['saar.session']`) |
| `properties` | `search(q, {state, type})`, `get(id)`, `list(ids?)`, `payTax(id)` — all return a `PropertyReport` (Property + `checks[6]`, `verdict`, `area`) |
| `maps` | `areas()`, `area(id)` → `{ area: MapArea, plots: PropertyReport[] }` |
| `applications` | `list()`, `get(id)`, `create(NewApplication)`, and the `fees` / `days` tables |
| `office` | `stats()`, `issues()`, `updateIssue(id, status)` |
| `content` | `services()`, `terms()`, `faqs()` |
| `notifications` | `list()`, `markAllRead()` |

**The six checks** (`runChecks`):

| Check | Fail | Warn | Pass |
|---|---|---|---|
| Owner name is up to date | — | sale recorded but name not transferred | records match the last sale |
| Loans on this property | active loan missing from state records | active loan (recorded) | no active loans |
| Court cases | ongoing case blocking sale | other ongoing case | none |
| Area matches the map | — | recorded vs. mapped area differ by more than 5% | areas agree |
| Property tax | — | overdue | paid, or due but not overdue |
| Building approval | built without permission | — | approved, or nothing built |

Verdict: any fail → `risky`; else any warn → `caution`; else `safe`.

**Mock data:**
- 11 properties across Chandigarh (Sector 22), Tamil Nadu (Alangudi) and Bihar (Mastipur), including one of each planted problem.
- 3 map areas, 6 applications, 6 records to fix, 6 services, 18 glossary terms, 7 FAQs, 4 notifications.
- Two demo users: citizen *Rohan Mehta* and officer *Kavita Rana* (Tehsil Office, Chandigarh).

---

## 11. File map

```
src/
  api/        types.ts · client.ts
  data/       properties.ts · areas.ts · applications.ts · office.ts · content.ts
  lib/        format.ts · images.ts · session.tsx · toast.tsx · useAsync.ts
  components/
    ui/       Button.tsx · Badge.tsx · misc.tsx
    layout/   Navbar.tsx · Footer.tsx · Logo.tsx
    property/ AreaMap.tsx · PlotOutline.tsx · PropertyCard.tsx · SearchBox.tsx · BuildingViewer.tsx
  pages/      Home · Search · Property · Map · Build · Services · Applications · ApplicationDetail
              NewApplication · Account · Office · Help · Login · NotFound
  App.tsx (routes) · main.tsx (providers) · index.css (tokens)
```

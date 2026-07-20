# Full task backlog

Stable IDs for you + Cursor. Status: `pending` | `in_progress` | `done` | `cancelled`.

**Owners:** You · Cursor · Both · Client  

Say in chat: `start A-11` / `done B-03` to update.

| Package | Tasks | ~Days |
|---------|------:|------:|
| S0 Discovery & Stitch | 4 | 3 |
| A Core planner | 18 | ~12 |
| B Day-of | 19 | ~21 |
| C Public / gifts | 14 | ~18 |
| D Marketplace | 12 | ~18 |
| E Mobile | 7 | ~24 |
| Buffer | 3 | 10 |

---

## S0 — Discovery & Stitch

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| S0-01 | Confirm feature freeze: which packages (A–E) in v1 | You | S0 | 0.5 | pending |
| S0-02 | Stitch: design system + core screens (auth, dashboard, guests) | Both | S0 | 1 | pending |
| S0-03 | Stitch: seating, invite, public wedding, marketplace screens | Both | S0 | 1 | pending |
| S0-04 | Lock tokens: fonts, colors, spacing → DESIGN.md / CSS vars | Cursor | S0 | 0.5 | pending |

---

## Package A — Core planner

### Foundation

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| A-01 | Repo setup: Next.js + Spring Boot, env samples | Cursor | S1 | 0.5 | done |
| A-02 | DB schema baseline: users, weddings, memberships, roles | Cursor | S1 | 0.5 | done |
| A-03 | Auth: register / login / JWT (or session) + refresh | Cursor | S1 | 1 | done |
| A-04 | Roles: couple, crew, vendor, guest, admin + guards | Cursor | S1 | 0.5 | done |
| A-05 | Create / switch wedding (multi-wedding tenancy) | Cursor | S1 | 0.5 | done |
| A-06 | Next shell: layout, nav, wedding context provider | Cursor | S1 | 0.5 | done |
| A-07 | OpenAPI export from Spring + typed FE client | Cursor | S1 | 0.5 | pending |
| A-08 | Deploy staging: FE + BE + Postgres | You | S1 | 0.5 | pending |

### Checklist

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| A-10 | BE: checklist / task entity, CRUD, filters, assignee | Cursor | S1 | 0.5 | done |
| A-11 | FE: task list UI — status, due date, assignee, filters | Cursor | S1 | 1 | done |
| A-12 | Seed default wedding checklist templates (optional) | Cursor | S1 | 0.5 | pending |

### Crew

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| A-20 | BE: crew members + responsibilities + invite link | Cursor | S1 | 0.5 | done |
| A-21 | FE: crew management UI + responsibility assignment | Cursor | S1 | 1 | done |

### Guests

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| A-30 | BE: guest entity — household, meal, RSVP status, tags | Cursor | S2 | 0.5 | done |
| A-31 | FE: guest list table — search, filters, bulk edit | Cursor | S2 | 1.5 | done |
| A-32 | CSV import / export guests | Cursor | S2 | 1 | done |
| A-33 | Guest RSVP status sync hooks (invite/WA later) | Cursor | S2 | 0.5 | done |

### Wedding vendors (not marketplace)

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| A-40 | BE: wedding-scoped vendors (DJ/Band/Ashtaka/etc.) | Cursor | S2 | 0.5 | done |
| A-41 | FE: vendor list + contact + notes + category | Cursor | S2 | 1 | done |
| A-42 | Pkg A demo / UAT checklist with client | You | S2 | 0.5 | pending |

---

## Package B — Day-of

### Seating chart

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| B-01 | Pick canvas lib (Konva/Fabric) + floor-plan data model | You | S3 | 0.5 | done |
| B-02 | BE: seating plan JSON save/load + version | Cursor | S3 | 0.5 | done |
| B-03 | FE: canvas — add/move/resize tables (round/rect) | Cursor | S3 | 3 | done |
| B-04 | FE: table shapes library + labels + capacity | Cursor | S3 | 1.5 | done |
| B-05 | FE: assign guests to seats/tables + unassigned panel | Cursor | S4 | 2 | done |
| B-06 | Conflict checks: double-seat, over-capacity | Cursor | S4 | 0.5 | done |
| B-07 | Export seating snapshot (PNG/PDF optional) | Cursor | S4 | 1 | done |

### Invitation + QR

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| B-10 | BE: invitation token + guest binding + seat payload | Cursor | S4 | 0.5 | done |
| B-11 | FE: invitation page (branding, RSVP, seat reveal) | Cursor | S4 | 1.5 | done |
| B-12 | QR generate for invite / seat (print + digital) | Cursor | S4 | 0.5 | done |
| B-13 | Host mode: scan/show guest seat at entrance | Cursor | S4 | 0.5 | done |

### QR seat finder / check-in

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| B-20 | Public QR seat finder page (table no + name verify) | Cursor | S4 | 1 | done |
| B-21 | Attendance permission verify + check-in stamp | Cursor | S4 | 1 | done |
| B-22 | Crew tablet check-in UI (admit / reject) | Cursor | S4 | 0.5 | done |

### WhatsApp

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| B-30 | Client: Meta/WhatsApp Business + BSP account setup | Client | S5 | 0 | pending |
| B-31 | Integrate WA provider (send template messages) | Cursor | S5 | 2 | pending |
| B-32 | Templates: RSVP invite with seating tip | Both | S5 | 1 | pending |
| B-33 | Templates: vendor reminders (schedule + send jobs) | Cursor | S5 | 1.5 | pending |
| B-34 | Webhook: inbound RSVP replies → guest status | Cursor | S5 | 1.5 | pending |
| B-35 | Pkg B demo / day-of dry run | You | S5 | 0.5 | pending |

---

## Package C — Public / gifts / PayHere

### Public wedding site

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| C-01 | Public wedding microsite: slug, SEO, countdown | Cursor | S6 | 1.5 | done |
| C-02 | Story / couple section + photo strip | Cursor | S6 | 1 | done |
| C-03 | Public RSVP entry linked to guest record | Cursor | S6 | 1 | done |

### Gallery + video

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| C-10 | Local disk uploads (`uploads/` + file IDs); R2/S3 later | Cursor | S6 | 1 | done |
| C-11 | Photo gallery: upload, album, lightbox, permissions | Cursor | S6 | 1.5 | pending |
| C-12 | Video upload + playback (Stream/Mux or direct MP4) | Cursor | S7 | 2.5 | pending |
| C-13 | Guest contribution uploads (optional moderation) | Cursor | S7 | 1 | pending |

### Gifts + PayHere

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| C-20 | BE: gift registry items + cash fund goals | Cursor | S7 | 1 | pending |
| C-21 | FE: registry browse + claim/contribute UI | Cursor | S7 | 1.5 | pending |
| C-22 | Client: PayHere merchant account + sandbox keys | Client | S7 | 0 | pending |
| C-23 | PayHere checkout + webhook reconcile | Cursor | S7 | 2 | pending |
| C-24 | Cash fund contributions ledger + receipts | Cursor | S7 | 1 | pending |

### Thank-you cards

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| C-30 | Thank-you card upload / template store | Cursor | S8 | 1 | pending |
| C-31 | Send thank-you via WhatsApp to selected guests | Cursor | S8 | 1.5 | pending |
| C-32 | Pkg C UAT: public site + gifts + payments + cards | You | S8 | 0.5 | pending |

---

## Package D — Marketplace

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| D-01 | Vendor account model separate from wedding vendors | Cursor | S9 | 0.5 | pending |
| D-02 | Categories/locations like planawedding.lk browse | Cursor | S9 | 1 | pending |
| D-03 | Marketplace list/filter/search + vendor cards | Cursor | S9 | 2 | pending |
| D-04 | Request quote flow (couple → vendor) | Cursor | S9 | 1.5 | pending |
| D-05 | Admin: approve / reject vendor listings | Cursor | S9 | 1 | pending |
| D-10 | Subscription plans + entitlements matrix | You | S10 | 0.5 | pending |
| D-11 | PayHere subscription checkout + renewals | Cursor | S10 | 2.5 | pending |
| D-12 | Vendor portfolio / blog CMS (posts + media) | Cursor | S10 | 2.5 | pending |
| D-13 | Public vendor profile page (SEO) | Cursor | S10 | 1.5 | pending |
| D-14 | Admin moderation + audit basics | Cursor | S11 | 1.5 | pending |
| D-15 | Web harden: rate limits, backups, prod checklist | Both | S11 | 2 | pending |
| D-16 | Web v1 production release + handover notes | You | S11 | 0.5 | pending |

---

## Package E — Mobile (React Native)

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| E-01 | RN project init + auth against same Spring APIs | Cursor | S12 | 2 | pending |
| E-02 | Mobile: checklist + crew + guests | Cursor | S12 | 5 | pending |
| E-03 | Mobile: RSVP / invite view + QR scanner check-in | Cursor | S13 | 5 | pending |
| E-04 | Mobile: gallery browse + push notifications | Cursor | S13 | 4 | pending |
| E-05 | Mobile: seating view-only (no full canvas editor) | Cursor | S14 | 3 | pending |
| E-06 | App store / Play listing + TestFlight / internal track | You | S14 | 3 | pending |
| E-07 | Mobile UAT + store submission | Both | S14 | 2 | pending |

---

## Buffer

| ID | Task | Owner | Sprint | Days | Status |
|----|------|-------|--------|-----:|--------|
| X-01 | UAT bug bash all packages | Both | S11 | 4 | pending |
| X-02 | Docs: runbooks, env vars, WA/PayHere ops | Cursor | S11 | 2 | pending |
| X-03 | Scope-creep contingency / polish pass | Both | S11 | 4 | pending |

---

## Critical path (start week 1)

1. `S0-01` — feature freeze with client  
2. `B-30` — WhatsApp Business / BSP (client)  
3. `C-22` — PayHere merchant (client)  
4. `A-01` → `A-08` — repo + staging  

## Highest-risk build tasks

- `B-03` … `B-05` — seating canvas  
- `B-31` … `B-34` — WhatsApp  
- `C-12` — video storage  
- `D-11` — subscription billing  

## Lean path

Only **S0 + A + B** if budget is tight. Defer C / D / E.

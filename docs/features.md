# Features & packages

References: [planawedding.lk marketplace](https://app.planawedding.lk/vendor-marketplace?browse=all), [WedFlow Atelier (CodeCanyon)](https://codecanyon.net/item/wedflow-atelier-selfhosted-wedding-planning-platform/63532012).

## Feature map

| # | Feature | Package | Risk |
|---|---------|---------|------|
| 1 | Checklist & tasks | A | Low |
| 2 | Wedding crew & responsibilities | A | Low |
| 3 | Guest list | A | Med |
| 4 | Seating chart (canvas, tables, shapes) | B | High |
| 5 | Wedding vendors (DJ / Band / Ashtaka) | A | Low |
| 6 | Vendor marketplace + subscriptions + portfolios | D | High |
| 7 | RSVP via WhatsApp + seating tip + vendor reminders | B | High |
| 8 | Wedding invitation with QR (host shows seat) | B | Med |
| 9 | Public wedding web (countdown + photos) | C | Low |
| 10 | Gift registry / cash fund | C | Med |
| 11 | QR seat finder / attendance verify | B | Med |
| 12 | Gallery with video + storage | C | High |
| 13 | PayHere IPG | C | Med |
| 14 | Gifting thank-you card → WhatsApp | C | Med |

Plus foundation: auth, roles, multi-wedding, admin, mobile (E).

## Sell packages

### Package A — Core planner
Auth, multi-wedding, checklist, crew, guests (CSV), wedding-scoped vendors.

### Package B — Day-of
Seating canvas, invitation + seat QR, QR check-in, WhatsApp RSVP + vendor reminders.

### Package C — Public & money
Public microsite, gallery (+ video), gift registry / cash fund, PayHere, thank-you cards.

### Package D — Marketplace
Browse/filter (planawedding.lk style), quote requests, vendor subscriptions (PayHere), portfolio/blog pages, admin approve.

### Package E — Mobile (React Native)
Auth, checklist, crew, guests, RSVP/invite, QR scan check-in, gallery, seating **view-only** (no full canvas editor), push, store listing.

## Cut order if budget is tight

1. **Must:** A + seating + invite QR + public countdown (minimal)
2. **Next:** PayHere + gifts + photo gallery
3. **Defer:** Full marketplace, deep WA automation, video encoding, mobile

## UI design

Use **Stitch** ([stitch.withgoogle.com](https://stitch.withgoogle.com)) for screen drafts, then lock tokens into the Next.js design system. Bill design as sprint **S0** — free tool ≠ free labor.

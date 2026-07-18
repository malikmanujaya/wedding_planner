# Client proposal — packages & quote

**Product:** Wedding planner web platform (+ optional mobile)  
**Delivery:** Vibecode-assisted freelance (Next.js + Spring)  
**Day rate (internal):** LKR 5,000  

Use clean round numbers with clients. Internal cost detail: [effort-budget.md](effort-budget.md).

---

## Recommended packages

### Package A — Core wedding planner
**Suggest sell: LKR 100,000 – 120,000**

- Account / login
- Create & manage wedding
- Checklist & tasks
- Wedding crew + responsibilities
- Guest list (search, CSV import/export)
- Wedding vendors (DJ / Band / Ashtaka, etc.)

### Package B — Day-of experience
**Suggest sell: LKR 120,000 – 150,000**

- Interactive seating chart (tables, shapes, guest assign)
- Digital invitation + QR
- Host seat reveal / check-in
- Guest QR seat finder
- WhatsApp RSVP with seating tip
- Vendor reminder messages  

*Client must provide WhatsApp Business / BSP access.*

### Package C — Public site, gifts & payments
**Suggest sell: LKR 120,000 – 150,000**

- Public wedding page (countdown, story, photos)
- Photo gallery (+ video if in scope)
- Gift registry & cash fund
- PayHere payments
- Thank-you card upload + WhatsApp send  

*Client must provide PayHere merchant account.*

### Package D — Vendor marketplace
**Suggest sell: LKR 120,000 – 160,000**

- Public vendor directory (categories, location, filters)
- Request quote
- Vendor subscriptions via PayHere
- Vendor portfolio / blog pages
- Admin approve listings

### Package E — Mobile app (React Native)
**Suggest sell: LKR 160,000 – 200,000**

- Auth against same backend
- Checklist, crew, guests
- RSVP / invite + QR scan check-in
- Gallery + push notifications
- Seating view-only
- App Store / Play submission support

### Design sprint (S0)
**Suggest sell: LKR 15,000 – 25,000**

Stitch AI UI drafts + locked design tokens before build.

---

## Bundle options

| Bundle | Includes | Suggest sell |
|--------|----------|--------------|
| **MVP** | S0 + A + B | LKR 245,000 – 280,000 |
| **Full web** | S0 + A–D + buffer | LKR 500,000 – 600,000 |
| **Full + mobile** | All above + E | LKR 745,000 – 835,000 |

---

## Assumptions

1. One product owner available for weekly UAT.
2. Client owns WA Business, PayHere, domains, hosting accounts.
3. Scope changes = change request (new estimate).
4. Video encoding / full marketplace / mobile can be deferred without blocking MVP.
5. Timeline assumes continuous focus; Meta/PayHere approval delays extend calendar, not “free” coding time.

## Out of scope (unless added)

- Custom native iOS/Android without RN
- Physical print design (beyond QR/PDF export)
- On-site wedding day staffing
- Guaranteed Meta template approval timelines

## Next step

Confirm which packages for v1 → freeze `S0-01` → start Stitch + staging.

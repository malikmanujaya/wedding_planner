# Effort & budget (vibecode)

**Rate:** LKR 5,000 / day  
**Mode:** Solo SE + Cursor vibecoding (prompt / review), not classic hand-coding.  
**Updated:** Jul 2026

## Summary

| Scope | Vibecode days | Labor @ 5k |
|-------|---------------:|-----------:|
| Web (all packages A–D + foundation) | ~86 | LKR 430,000 |
| Mobile (Pkg E) | ~28 | LKR 140,000 |
| UAT / buffer | 10 | LKR 50,000 |
| **Total** | **~124** | **LKR 620,000** |

**Suggested client sell (1.2–1.35×):** LKR **745,000 – 835,000** all-in.

Classic hand-code estimate was ~210 days / LKR 1.05M. Vibecode cuts ~40% overall; CRUD compresses more than seating / WA / video / subscriptions.

## Module sheet

| Module | Vibecode d | Classic d | Compress | Phase |
|--------|----------:|----------:|----------|-------|
| Foundation | 5 | 10 | High | P1 |
| UI via Stitch + Cursor | 3 | 5 | High | P1 |
| Checklist & tasks | 2 | 5 | High | P1 |
| Wedding crew | 2 | 5 | High | P1 |
| Guest list | 3.5 | 7 | High | P1 |
| Wedding vendors | 2 | 5 | High | P1 |
| Seating chart canvas | 9 | 15 | Low | P2 |
| Invitation + seat QR | 3 | 6 | Med | P2 |
| QR seat finder / check-in | 2.5 | 5 | Med | P2 |
| WhatsApp RSVP + reminders | 6 | 10 | Low | P2 |
| Public wedding site | 3.5 | 7 | High | P3 |
| Gallery + video storage | 7 | 11 | Low | P3 |
| Gift registry / cash fund | 3.5 | 7 | Med | P3 |
| PayHere IPG | 3.5 | 6 | Low | P3 |
| Thank-you cards + WA | 3 | 6 | Med | P3 |
| Vendor marketplace | 7 | 14 | Med | P4 |
| Vendor subscriptions | 4.5 | 8 | Low | P4 |
| Vendor portfolios / blogs | 4.5 | 9 | Med | P4 |
| Admin + polish | 3.5 | 7 | Med | P4 |
| Mobile (RN) | 28 | 50 | Med | P5 |

## Package cost (your labor)

| Package | ~Days | Your cost | Suggested sell (~1.2–1.3×) |
|---------|------:|----------:|---------------------------:|
| A — Core | ~17.5 | LKR 87,500 | ~LKR 105k |
| B — Day-of | ~21 | LKR 105,000 | ~LKR 130k |
| C — Public/gifts | ~20.5 | LKR 102,500 | ~LKR 130k |
| D — Marketplace | ~20 | LKR 100,000 | ~LKR 130k |
| E — Mobile | ~28 | LKR 140,000 | ~LKR 175k |
| Buffer | 10 | LKR 50,000 | LKR 50k |
| S0 Design | 3 | LKR 15,000 | LKR 15–25k |

> Round package quotes cleanly for clients (e.g. A LKR 100–120k). See [client-proposal.md](client-proposal.md).

## What vibecode does / does not cut

**Compresses well:** CRUD, screens from Stitch, Spring entities, public microsite.

**Barely compresses:** Seating canvas, WhatsApp Business approval + webhooks, PayHere edge cases, video pipeline, subscription renewals.

## Third-party costs (not in day rate)

| Item | Notes | Rough |
|------|-------|-------|
| WhatsApp Business / BSP | Templates, RSVP, reminders | Usage-based |
| Object + video storage | R2/S3 + Stream/Mux | Traffic-based |
| PayHere | Merchant % on gifts / subscriptions | Per txn |
| Hosting | FE + Spring + DB + backups | LKR 4k–15k / mo |
| Apple / Google | When mobile ships | One-time + yearly |

## Lean offer

**S0 + A + B only** ≈ 41 days labor (~LKR 205k cost → suggest sell ~LKR 245–280k). Defer marketplace, video, mobile.

# Sprint plan

Vibecode model. Sprint lengths vary (6–9 focused days); calendar ~3.5–4.5 months for web if continuous, +~1.5 months mobile.

| Sprint | Days | Focus | Exit criteria |
|--------|-----:|-------|---------------|
| **S0** | 3 | Stitch boards + feature freeze | Screen map signed off |
| **S1** | 8 | Scaffold + checklist + crew | Core planner skeleton live |
| **S2** | 8 | Guests + wedding vendors + polish | **Pkg A MVP** demoable |
| **S3** | 9 | Seating canvas v1 | Tables + save/load |
| **S4** | 8 | QR invite + check-in + WA start | Day-of loop works |
| **S5** | 7 | WhatsApp templates finish | RSVP + reminders shipping |
| **S6** | 8 | Public site + gallery photos | Microsite + uploads |
| **S7** | 8 | Video + gifts + PayHere | Money flows work |
| **S8** | 7 | Thank-you cards + harden P3 | **Pkg C** done |
| **S9** | 8 | Marketplace browse + accounts | Directory usable |
| **S10** | 8 | Subscriptions + portfolios | Vendor monetization |
| **S11** | 6 | Admin + UAT buffer | **Web v1** production |
| **S12–S14** | 28 | React Native vs same APIs | App store subset |

## Phase → package mapping

| Phase | Packages | Sprints |
|-------|----------|---------|
| P1 Core | S0 + A | S0–S2 |
| P2 Day-of | B | S3–S5 |
| P3 Public/gifts | C | S6–S8 |
| P4 Marketplace | D | S9–S11 |
| P5 Mobile | E | S12–S14 |

## Rules so the plan holds

1. Start **WhatsApp Business** (`B-30`) and **PayHere** (`C-22`) in week 1 — approval delays are calendar blockers.
2. Photos-first gallery; treat video encoding as upgrade if schedule slips.
3. Mobile seating is **view-only**; full canvas stays on web.
4. Do not absorb Meta/PayHere wait time as free days — park other backlog or bill discovery.

## Dependencies

```
S0 design ──► S1 foundation
S1 ──► S2 guests/vendors ──► Pkg A demo
S2 ──► S3 seating (needs guests)
S3 ──► S4 QR (needs seating assign)
S4 ──► S5 WhatsApp (needs invite tokens)
S2 ──► S6 public site
S6 ──► S7 video / PayHere / gifts
S5 + S7 ──► S8 thank-you WA
S2 ──► S9 marketplace (separate vendor accounts)
S7 PayHere ──► S10 subscriptions
S11 web harden ──► S12 mobile (stable APIs)
```

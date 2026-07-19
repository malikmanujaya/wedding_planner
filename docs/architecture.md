# Architecture notes (planned)

No code yet — target architecture for vibecode implementation.

## Stack

| Layer | Choice |
|-------|--------|
| Web FE | Next.js (App Router preferred) |
| API | Spring Boot (REST + OpenAPI) |
| DB | PostgreSQL |
| Auth | JWT (or session) + refresh; role guards |
| Object storage | Cloudflare R2 or S3 |
| Video | Cloudflare Stream / Mux / or direct MP4 v1 |
| Payments | PayHere |
| Messaging | WhatsApp Business API via BSP |
| Mobile | React Native (shared Spring APIs) |
| UI drafts | Google Stitch → tokens in Next |

## Roles

| Role | Access |
|------|--------|
| Couple / host | Full wedding manage |
| Crew | Tasks, check-in, limited guest |
| Vendor (wedding-scoped) | Own booking notes / reminders |
| Marketplace vendor | Portfolio, subscription, quotes |
| Guest | Invite, RSVP, seat finder, gallery contrib |
| Admin | Approve vendors, moderation, audit |

## Multi-tenancy

- `Wedding` is the tenancy root.
- Users can belong to multiple weddings via memberships.
- Marketplace vendors are a separate account type (not the same as “wedding vendor” CRUD on a single wedding).

## Repo layout

```
wedding_planner/
  docs/          # planning docs
  fe/            # Next.js 15
  be/            # Spring Boot 4 API
  README.md
```

Mobile (`mobile/`) comes in Package E.

## Integration sketch

```
Next.js  ──REST/OpenAPI──►  Spring Boot  ──►  PostgreSQL
     │                           │
     │                           ├── PayHere webhooks
     │                           ├── WhatsApp BSP
     │                           └── R2 / Stream
React Native ────────────────────┘
```

## High-risk technical choices (decide early)

| Decision | Options | Owner task |
|----------|---------|------------|
| Seating canvas lib | **Konva + react-konva** (chosen) | `B-01` done |
| WA BSP provider | Meta Cloud API / local BSP | `B-30` |
| Video | Stream/Mux vs MP4-only v1 | `C-12` |
| Auth style | JWT vs cookie session | `A-03` |

## Vibecode workflow

1. Vertical slice per feature (BE entity → API → FE screen).
2. Export OpenAPI once; generate typed FE client.
3. Stitch screens → implement with shared design tokens.
4. You review/UAT; Cursor implements and fixes.

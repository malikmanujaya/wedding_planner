# Wedding Planner Platform

Freelance wedding planning product: web (Next.js + Spring Boot) and future mobile (React Native). Built with a **vibecode-first** workflow (Cursor + Stitch).

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/README.md](docs/README.md) | Doc index |
| [docs/features.md](docs/features.md) | Feature list & packages |
| [docs/effort-budget.md](docs/effort-budget.md) | Effort & budget (vibecode) |
| [docs/sprint-plan.md](docs/sprint-plan.md) | Sprint plan |
| [docs/task-backlog.md](docs/task-backlog.md) | Full task backlog (IDs) |
| [docs/architecture.md](docs/architecture.md) | Stack & system notes |
| [docs/client-proposal.md](docs/client-proposal.md) | Client-facing package quote |

## Stack (planned)

- **FE:** Next.js
- **BE:** Spring Boot
- **Mobile (later):** React Native
- **UI drafts:** [Stitch](https://stitch.withgoogle.com)
- **Payments:** PayHere
- **Messaging:** WhatsApp Business / BSP

## Code layout

| Folder | Stack |
|--------|--------|
| [`fe/`](fe/) | Next.js 15 (App Router) |
| [`be/`](be/) | Spring Boot 4 + JWT + H2 (local) |

### Run locally

```bash
# Backend (port 18080)
cd be
./mvnw spring-boot:run

# Frontend (port 3000)
cd fe
npm run dev
```

Open http://localhost:3000 → register → create a wedding.  
API: http://localhost:18080 · H2 console: http://localhost:18080/h2-console

### Current sprint focus (S1)

1. Repo + FE/BE scaffold ✅  
2. Auth (register / login / JWT) ✅  
3. Multi-wedding tenancy ✅  
4. App shell (dashboard / weddings) ✅  
5. **Landing + shadcn app shell** ✅  
6. **Next:** checklist tasks API (A-10 / A-11), then crew  

**Rate assumption:** LKR 5,000 / day  
**Model:** Vibecode (prompt + review)

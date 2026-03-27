# WasteTrade

Full-stack waste trading platform built with Angular 19 (frontend) and LoopBack 4 / Node.js (backend), backed by PostgreSQL and Redis.

## Project Structure

```
├── frontend/          Angular 19 with SSR
├── backend/           LoopBack 4 REST API (Node.js)
├── docker-compose.yml Local dev: PostgreSQL + Redis
└── README.md
```

## Local Development

### Prerequisites

- Node.js 20 or 22
- pnpm 10 (`corepack enable pnpm`)
- yarn 1.x (for frontend)
- Docker Desktop (for PostgreSQL + Redis)

### 1. Start databases

```bash
docker compose up -d
```

This starts PostgreSQL (port 5450) and Redis (port 6379).

### 2. Import the database

```bash
docker cp your-dump-file.sql wastetrade-postgres:/tmp/dump.sql
docker exec wastetrade-postgres pg_restore --no-owner --no-privileges --dbname=wastetrade --username=wastetrade /tmp/dump.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env    # then edit .env with your local values
pnpm install
pnpm dev                # runs on http://localhost:3001
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
yarn install
npx ng serve            # runs on http://localhost:4200
```

---

## Deploy to Railway

Railway auto-deploys on every push to `main`. The project uses four services:

| Service      | Type             | Source Directory |
|-------------|------------------|------------------|
| **backend**  | Dockerfile       | `backend/`       |
| **frontend** | Dockerfile (SSR) | `frontend/`      |
| **Postgres** | Railway add-on   | —                |
| **Redis**    | Railway add-on   | —                |

### Setup steps

1. **Create a Railway project** at [railway.com](https://railway.com) and connect the GitHub repo (`twdagency/WasteTradeAngular`).

2. **Add PostgreSQL** — click "New" → "Database" → "PostgreSQL". Railway provisions it and exposes connection variables automatically.

3. **Add Redis** — click "New" → "Database" → "Redis".

4. **Add the backend service** — click "New" → "GitHub Repo" → select this repo.
   - Set **Root Directory** to `backend`
   - Railway will detect the `Dockerfile` and `railway.toml` automatically
   - Add these **environment variables** (use Railway variable references where noted):

   | Variable | Value |
   |----------|-------|
   | `PORT` | `3000` |
   | `NODE_ENV` | `production` |
   | `POSTGRES_URL` | `${{Postgres.DATABASE_URL}}` |
   | `POSTGRES_HOST` | `${{Postgres.PGHOST}}` |
   | `POSTGRES_PORT` | `${{Postgres.PGPORT}}` |
   | `POSTGRES_USER` | `${{Postgres.PGUSER}}` |
   | `POSTGRES_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
   | `POSTGRES_DATABASE` | `${{Postgres.PGDATABASE}}` |
   | `REDIS_HOST` | `${{Redis.REDISHOST}}` |
   | `REDIS_PORT` | `${{Redis.REDISPORT}}` |
   | `REDIS_PASSWORD` | `${{Redis.REDISPASSWORD}}` |
   | `FE_BASE_URL` | *(your frontend Railway URL once deployed)* |
   | `BE_BASE_URL` | *(your backend Railway URL once deployed)* |

   Add any additional keys (SendGrid, AWS S3, Salesforce, DeepL) as needed.

5. **Add the frontend service** — click "New" → "GitHub Repo" → select this repo again.
   - Set **Root Directory** to `frontend`
   - Add this **build argument** (in Settings → Build):

   | Build Arg | Value |
   |-----------|-------|
   | `API_URL` | *(your backend Railway URL, e.g. `https://backend-production-xxxx.up.railway.app`)* |

6. **Import the database** — open the PostgreSQL service in Railway, go to the "Data" tab, and use the import tool to upload your `.sql` dump. Alternatively, connect via the Railway CLI:
   ```bash
   railway link
   railway connect postgres
   # then run pg_restore from your local machine
   ```

7. **Generate domains** — for both backend and frontend services, go to Settings → Networking → "Generate Domain" to get public URLs.

### After first deploy

- Backend is available at its Railway URL (e.g. `https://backend-production-xxxx.up.railway.app/ping`)
- Frontend is available at its Railway URL
- Every push to `main` triggers a new deploy automatically

# WasteTrade

Full-stack waste trading platform built with Angular 19 (frontend), LoopBack 4 / Node.js (backend), and Strapi 5 (CMS), backed by PostgreSQL and Redis.

## Project Structure

```
├── frontend/          Angular 19 with SSR
├── backend/           LoopBack 4 REST API (Node.js)
├── cms/               Strapi 5 CMS (articles, jobs, resources, materials)
│   └── migration/     WordPress → Strapi migration scripts
├── docker-compose.yml Local dev: PostgreSQL + Redis + MinIO
└── README.md
```

## Local Development

### Prerequisites

- Node.js 20 or 22
- pnpm 10 (`corepack enable pnpm`)
- yarn 1.x (for frontend)
- Docker Desktop (for PostgreSQL + Redis + MinIO)

### 1. Start databases

```bash
docker compose up -d
```

This starts PostgreSQL (port 5450), Redis (port 6379), and MinIO (S3-compatible storage, API on port 9000, console on port 9001). The `wastetrade` bucket is created automatically. A second database (`strapi`) is also created in the same PostgreSQL instance for the CMS.

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

### 5. CMS (Strapi)

```bash
cd cms
cp .env.example .env    # then edit .env with your local values
npm install
npm run develop         # runs on http://localhost:1337
```

On first run, Strapi will prompt you to create an admin user at `http://localhost:1337/admin`.

The `.env.example` defaults to the local Docker PostgreSQL instance (`DATABASE_CLIENT=postgres`, port 5450, database `strapi`). To use SQLite instead, set `DATABASE_CLIENT=sqlite`.

#### WordPress Migration

To migrate content from the old WordPress site into Strapi:

```bash
cd cms/migration
cp .env.example .env    # set WORDPRESS_URL, STRAPI_URL, STRAPI_API_TOKEN
npm install
npm run migrate         # or npm run migrate:dry-run to preview
```

---

## Deploy to Railway

Railway auto-deploys on every push to `main`. The project uses six services:

| Service      | Type             | Source Directory |
|-------------|------------------|------------------|
| **backend**  | Dockerfile       | `backend/`       |
| **frontend** | Dockerfile (SSR) | `frontend/`      |
| **cms**      | Dockerfile       | `cms/`           |
| **Postgres** | Railway add-on   | —                |
| **Redis**    | Railway add-on   | —                |
| **MinIO**    | Docker image     | —                |

### Setup steps

1. **Create a Railway project** at [railway.com](https://railway.com) and connect the GitHub repo (`twdagency/WasteTradeAngular`).

2. **Add PostgreSQL** — click "New" → "Database" → "PostgreSQL". Railway provisions it and exposes connection variables automatically.

3. **Add Redis** — click "New" → "Database" → "Redis".

4. **Add MinIO (file storage)** — click "New" → "Docker Image" → enter `minio/minio`.
   - Add a **volume** (Settings → Volumes) mounted at `/data`
   - Set the **start command** to: `server /data --console-address :9001`
   - Add these **environment variables**:

   | Variable | Value |
   |----------|-------|
   | `MINIO_ROOT_USER` | *(choose a username)* |
   | `MINIO_ROOT_PASSWORD` | *(choose a strong password)* |

   - Set **port** to `9000` (Settings → Networking)
   - **Generate a public domain** (Settings → Networking → "Generate Domain") — this is the URL browsers will use to load uploaded files

5. **Add the backend service** — click "New" → "GitHub Repo" → select this repo.
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
   | `AWS_S3_BUCKET` | `wastetrade` |
   | `AWS_S3_REGION` | `us-east-1` |
   | `AWS_S3_ACCESS_KEY_ID` | *(same as `MINIO_ROOT_USER` above)* |
   | `AWS_S3_SECRET_ACCESS_KEY` | *(same as `MINIO_ROOT_PASSWORD` above)* |
   | `AWS_S3_ENDPOINT` | `http://MinIO.railway.internal:9000` |
   | `AWS_S3_PUBLIC_URL` | *(MinIO's public Railway domain, e.g. `https://minio-production-xxxx.up.railway.app`)* |

   Add any additional keys (SendGrid, Salesforce, DeepL) as needed.

   > **Note:** `AWS_S3_ENDPOINT` uses Railway's private network (fast, free internal traffic). `AWS_S3_PUBLIC_URL` is the public domain that browsers use to fetch uploaded files. The backend auto-creates the bucket on first boot.

6. **Add the frontend service** — click "New" → "GitHub Repo" → select this repo again.
   - Set **Root Directory** to `frontend`
   - Add this **build argument** (in Settings → Build):

   | Build Arg | Value |
   |-----------|-------|
   | `API_URL` | *(your backend Railway URL, e.g. `https://backend-production-xxxx.up.railway.app`)* |

7. **Add the CMS service** — click "New" → "GitHub Repo" → select this repo again.
   - Set **Root Directory** to `cms`
   - Railway will detect the `Dockerfile` and `railway.toml` automatically
   - Add these **environment variables**:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_CLIENT` | `postgres` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `DATABASE_SSL` | `true` |
   | `APP_KEYS` | *(comma-separated random strings)* |
   | `API_TOKEN_SALT` | *(random string)* |
   | `ADMIN_JWT_SECRET` | *(random string)* |
   | `TRANSFER_TOKEN_SALT` | *(random string)* |
   | `JWT_SECRET` | *(random string)* |
   | `ENCRYPTION_KEY` | *(random string)* |
   | `CORS_ORIGINS` | *(your frontend Railway URL, e.g. `https://frontend-production-xxxx.up.railway.app`)* |

   > **Note:** Strapi uses the same Railway PostgreSQL add-on as the backend. By default it creates its own tables in the `public` schema. If you prefer schema isolation, set `DATABASE_SCHEMA=strapi` and create that schema in the database first.

8. **Import the database** — open the PostgreSQL service in Railway, go to the "Data" tab, and use the import tool to upload your `.sql` dump. Alternatively, connect via the Railway CLI:
   ```bash
   railway link
   railway connect postgres
   # then run pg_restore from your local machine
   ```

9. **Generate domains** — for backend, frontend, and CMS services, go to Settings → Networking → "Generate Domain" to get public URLs.

### After first deploy

- Backend is available at its Railway URL (e.g. `https://backend-production-xxxx.up.railway.app/ping`)
- Frontend is available at its Railway URL
- CMS admin panel is at its Railway URL + `/admin` — create your first admin user there
- Uploaded files are accessible via MinIO's public Railway URL
- Every push to `main` triggers a new deploy automatically

# Krishna Atta Chakki CRM

Phase 3 adds daily, weekly, and monthly sales reports with Excel export to the existing order-entry app. The Next.js client, Express API, and MongoDB database run as separate services.

## Requirements and setup

- Node.js 20.9 or newer and npm
- MongoDB running locally or a reachable MongoDB URI

From the project root:

```bash
npm install
```

Copy `client/.env.example` to `client/.env.local` and `server/.env.example` to `server/.env`, then set the values described below.

## Run the app

```bash
npm run dev            # client and server together
npm run dev:client     # client only
npm run dev:server     # server only
```

The client runs at <http://localhost:3000> and the API at <http://localhost:4000>. The API health endpoint is <http://localhost:4000/api/health>. Seed the catalog once with `npm run seed`.

## Demo report data

Demo records are never inserted automatically. Run `npm run seed:demo` to add 60 demo orders across the previous six weeks. Re-running the command replaces only the existing demo rows. Remove them with `npm run seed:demo:clear`; real orders are preserved. Reports include demo and real orders together while testing.

## Deploy to Vercel and Render

This repository is an npm-workspaces monorepo. Deploy the `client` workspace to Vercel and the `server` workspace to Render; keep the repository root as the install/build context so the shared workspace and root `package-lock.json` are available.

### Render API

1. Create a Render web service from this repository. The root-level `render.yaml` configures the API build, start command, and health check.
2. Set `MONGODB_URI` in Render's environment settings to the MongoDB Atlas connection string. Use the `krishna-atta-chakki` database name in the URI path, and keep this secret out of source control.
3. Set `CLIENT_URL` to the exact deployed Vercel origin, for example `https://your-project.vercel.app` (no trailing slash).
4. In Atlas Network Access, allow connections from Render. Prefer a fixed Render outbound IP allowlist where your plan supports it; avoid broad public access for production.

The API listens on Render's injected `PORT`. Its health check is `/api/health/`.

### Vercel frontend

1. Import the same repository as a Vercel project and set **Root Directory** to `client`. Enable **Include source files outside of the Root Directory in the Build Step** so the shared workspace is available.
2. Use the Next.js framework preset and leave the default build and install commands unless Vercel requests workspace-specific commands.
3. Add `NEXT_PUBLIC_API_URL` to the Vercel environment variables. Set it to the Render service's public origin, such as `https://your-api.onrender.com` (no trailing slash). Add it to each environment you deploy, then redeploy so the value is included in the frontend build.
4. Set Render's `CLIENT_URL` to the production Vercel origin. Update it if the production domain changes. Preview deployments need their own allowed origin if you want them to call the API.

### Seed the production catalog

After setting the Render `MONGODB_URI`, run `npm run seed` from the repository root with `server/.env` containing that same Atlas URI, or run the seed command in a one-off Render shell. Seeding upserts the catalog by item name and category; it does not create orders. Do not commit the local `.env` file.

## Reports API

- `GET /api/reports/daily?date=YYYY-MM-DD` (defaults to today in the configured shop timezone)
- `GET /api/reports/weekly?date=YYYY-MM-DD` (defaults to the current week)
- `GET /api/reports/monthly?month=YYYY-MM` (defaults to the current month)
- `GET /api/reports/export?type=daily|weekly|monthly&date=...` (use `month=YYYY-MM` for monthly reports)

All JSON report responses share the `ReportResponse` type from `shared/types/reports.d.ts`. MongoDB aggregation pipelines group sales using the configured timezone. Daily responses also include the day's order rows for the closing list; pass `summaryOnly=true` to omit them.

The order list remains backward compatible: `GET /api/orders?date=YYYY-MM-DD` returns the original array. Add pagination/filter parameters to receive `{ data, page, limit, total }`, for example `GET /api/orders?date=2026-10-05&page=1&limit=50&search=20261005&orderType=DELIVERY`.

## Environment variables

| Variable              | App    | Purpose                | Default                                         |
| --------------------- | ------ | ---------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | client | API base URL           | `http://localhost:4000`                         |
| `PORT`                | server | API port               | `4000`                                          |
| `MONGODB_URI`         | server | Mongoose connection    | `mongodb://localhost:27017/krishna-atta-chakki` |
| `CLIENT_URL`          | server | Allowed browser origin | `http://localhost:3000`                         |

Shop timezone, hours, and week start are declared in `server/src/config/shop.ts` and mirrored in `client/src/lib/shop.ts`.

## Quality commands

```bash
npm run build
npm run lint
npm run format
```

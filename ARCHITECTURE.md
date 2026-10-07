# Architecture

## Project areas

- `client/src/app` contains App Router routes and the shared layout.
- `client/src/features/orders`, `features/reports`, and `features/items` hold user-facing workflows. Add a feature component here, then expose it from an App Router page.
- `client/src/components/ui` contains shared buttons, cards, badges, inputs, dialogs, tabs, date inputs, empty/loading states, toasts, stat cards, and pagination.
- `client/src/lib` contains API, formatting, category, and shop configuration helpers; `client/src/services` contains typed API calls.
- `server/src/routes` maps endpoints to controllers; `controllers` handle HTTP; `services` contain business/report logic; `models` define MongoDB documents; `config` and `utils` hold infrastructure and shared server helpers.
- `shared/types` and `shared/utils` are imported by both workspaces for report contracts and money rounding.

## Adding a module

1. Add the Mongo model and indexes in `server/src/models` only when the module needs persistent data.
2. Add its service and controller, then register an Express router in `server/src/app.ts`.
3. Add API response/input types under `shared/types` when both workspaces need them.
4. Put the client workflow in `client/src/features/<module>`, call the backend through `client/src/services`, and add its link to `client/src/config/navigation.ts`.
5. Put shared visual elements in `client/src/components/ui`; keep module-specific elements inside the feature.

## Reports API

- `GET /api/reports/daily?date=YYYY-MM-DD` (date optional; defaults to today in the configured shop timezone).
- `GET /api/reports/weekly?date=YYYY-MM-DD` (date optional; defaults to the current week).
- `GET /api/reports/monthly?month=YYYY-MM` (month optional; defaults to the current month).
- `GET /api/reports/export?type=daily|weekly|monthly&date=...` returns an in-memory Excel workbook. For monthly exports use `month=YYYY-MM`; `date=YYYY-MM-DD` is also accepted.
- All report endpoints return the shared `ReportResponse`: `period`, order/sales totals split by Walk-in and Delivery, `itemsSold` grouped by saved item name/category/unit snapshots, and `categoryTotals`. Only daily reports include the day’s order list. Period boundaries use `Asia/Kolkata`; weeks run Monday through Sunday.
- Excel exports contain `Summary`, `Items Sold`, and `Orders` sheets. They use the same service aggregation as the report screen; item and order-line rows are not recalculated in the browser.
- `npm run seed:demo` inserts about 60 removable demo orders based on the active database catalog. It is manual only; `npm run seed:demo:clear` removes only orders marked `isDemo`.
- `GET /api/orders?date=...&page=1&limit=50&search=...&orderType=DELIVERY|WALK_IN` returns `{ data, page, limit, total }`. Legacy `GET /api/orders?date=...` continues returning an array.

# Persian Calendar for Apache Superset

A **community extension** that adds a Jalali (Shamsi) calendar to Apache Superset time filters.

This is the same kind of work as other community chart plugins and UI extensions: it adds one capability on top of Superset. You still run Superset. This repository ships that extension already wired into Explore and Dashboard time filters.

[راهنمای فارسی و نحوه استفاده](README.fa.md)

## What it adds

- **Persian Calendar** in the time-range **Range type** dropdown
- Relative ranges: Last 7 / 30 / 90 / 365 days
- Custom Jalali date picker (RTL)
- Queries stay Gregorian (`YYYY-MM-DD`) so the backend does not change

## Date column format

The database column must be a **Gregorian** temporal type, marked as Datetime in the dataset (clock icon). Do not store Jalali values such as `1403/01/01` in that column.

| Use | Do not use |
|-----|------------|
| `DATE`, `TIMESTAMP`, `TIMESTAMPTZ`, `DATETIME` | Jalali strings (`1403-01-01`, `1403/01/01`) |
| `2024-03-20` or `2024-03-20 08:00:00` | Persian digits only, with no Gregorian conversion |

The UI shows Jalali. The filter sent to SQL is Gregorian, for example `2024-03-20 : 2024-04-18`.

## Usage

1. Open a chart in **Explore**.
2. Click the temporal filter (for example `ts (No filter)`).
3. Open **Time Range** → **Range type** → **Persian Calendar**.
4. Pick a relative range or a custom Jalali range, then **Apply**.

Step-by-step screenshots: [README.fa.md](README.fa.md).

## Tests

### Jest

| Suite | Result |
|------|--------|
| Persian utilities, Jalali picker, Persian frame, `guessFrame`, DateFilterLabel | Passed |
| DateFilterControl + Persian files | 64/64 |
| Native filters + time comparison | 354 passed |
| `src/explore` + `src/filters` | 822 passed |

```bash
cd superset-frontend
npm run test -- spec/utils/persianCalendar.test.ts \
  spec/explore/components/controls/DateFilterControl/ \
  src/explore/components/controls/DateFilterControl/tests/
```

### Playwright (Google Chrome, Docker)

Against `http://localhost:8088` with `admin` / `admin`. **4/4 passed.**

| Spec | Test |
|------|------|
| `playwright/tests/auth/login.spec.ts` | Wrong password stays on login |
| `playwright/tests/auth/login.spec.ts` | Admin login reaches Welcome |
| `playwright/tests/explore/persian-calendar.spec.ts` | Persian Calendar → Last 30 days |
| `playwright/tests/explore/persian-calendar.spec.ts` | Persian Calendar → custom Jalali range |

```bash
cd superset-frontend
PLAYWRIGHT_BASE_URL=http://localhost:8088 \
SUPERSET_ADMIN_PASSWORD=admin \
PLAYWRIGHT_CHANNEL=chrome \
npx playwright test --headed playwright/tests
```

## Run

```bash
docker compose up -d
cd superset-frontend && npm run dev-server
```

App: `http://localhost:8088` (login `admin` / `admin`). Docker notes: [PERSIAN_CALENDAR.md](PERSIAN_CALENDAR.md).

## License

Apache License 2.0. This tree includes [Apache Superset](https://github.com/apache/superset) plus this extension. See [LICENSE.txt](LICENSE.txt).

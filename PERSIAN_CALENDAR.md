# Persian (Jalali) Calendar Date Filter

> **Community extension — not part of upstream Apache Superset**

This document describes a tested Persian calendar date filter for [Apache Superset](https://superset.apache.org). The feature lives in this fork and has **not** been merged into the official Superset project.

## Attribution & License

This fork is based on [Apache Superset](https://github.com/apache/superset), which is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

- **Original project:** [apache/superset](https://github.com/apache/superset)
- **Copyright:** The Apache Software Foundation
- **Extension author:** [mohammadreza-92](https://github.com/mohammadreza-92)

All new source files include the standard ASF license header. Modifications to existing Superset files remain under the Apache License 2.0.

## What This Adds

A **Persian Calendar** option in Explore's time range filter (`DateFilterControl`) and Dashboard time filters (same control) with:

- Jalali (Shamsi) calendar UI for date selection
- Relative ranges: Last 7 / 30 / 90 / 365 days (365 days is used instead of "Last year" so it does not collide with the built-in Common frame)
- Custom Jalali date range picker with RTL support
- Gregorian output for Superset queries (backend compatibility unchanged)
- Unit tests for utilities, frame detection, and components

## Branch

```
feat/persian-date-filter-clean
```

## Key Files

| File | Purpose |
|------|---------|
| `superset-frontend/src/utils/persianCalendar.ts` | Jalali ↔ Gregorian conversion utilities |
| `superset-frontend/src/explore/components/controls/DateFilterControl/components/JalaliDatePicker.tsx` | Jalali date picker component |
| `superset-frontend/src/explore/components/controls/DateFilterControl/components/PersianCalendarFrame.tsx` | Persian calendar filter frame |
| `superset-frontend/src/explore/components/controls/DateFilterControl/DateFilterLabel.tsx` | Wires the Persian frame into Explore and Dashboard time filters |

## Dependencies

- `jalaali-js` — accurate Jalali date math
- `dayjs-jalali` — Jalali support for dayjs
- `react-multi-date-picker` — Persian calendar UI

## Testing

Tests that have been run for this overlay, and how to repeat them.

### Jest (unit / component)

All of these passed on the host frontend:

| File | Tests |
|------|--------|
| `spec/utils/persianCalendar.test.ts` | Persian weekday names; Nowruz 1403 Gregorian ↔ Jalali round-trip; RTL; `fa` locale |
| `spec/explore/components/controls/DateFilterControl/JalaliDatePicker.test.tsx` | Empty range when conversion fails |
| `spec/explore/components/controls/DateFilterControl/PersianCalendarFrame.test.tsx` | Preset radios; custom Jalali range; persisted custom values; Jalali strings → Gregorian; Last 365 days checked; auto-apply Last 7 days; invert start/end; set start to today; custom defaults to today |
| `src/explore/components/controls/DateFilterControl/tests/guessFrame.test.ts` | Common `Last year` is not Persian; Last 7/30/90/365 days are Persian; date-only `YYYY-MM-DD : YYYY-MM-DD` is Persian; Custom ISO stays Custom; other built-in frames |
| `src/explore/components/controls/DateFilterControl/tests/DateFilterLabel.test.tsx` | Default DateFilter; global `time_filter`; open/close popover; opens Persian frame for Persian ranges; Range type dropdown → Persian Calendar |

Broader Jest runs in the same session:

- DateFilterControl + Persian files: **64/64** passed
- Native filters + time comparison: **354** passed
- `src/explore` + `src/filters`: **822** passed

Five pre-existing Explore suites still fail with an unrelated `blob/esm` `Function.prototype.apply` error. They are not caused by this overlay.

```bash
cd superset-frontend
npm run test -- spec/utils/persianCalendar.test.ts \
  spec/explore/components/controls/DateFilterControl/ \
  src/explore/components/controls/DateFilterControl/tests/
```

### Playwright (Google Chrome, Docker)

Ran headed against the Compose app at `http://localhost:8088` with `admin` / `admin`. **4/4 passed.**

| Spec | Test |
|------|------|
| `playwright/tests/auth/login.spec.ts` | Wrong password stays on `/login/` |
| `playwright/tests/auth/login.spec.ts` | Correct admin password reaches Welcome |
| `playwright/tests/explore/persian-calendar.spec.ts` | Explore time range → Persian Calendar → Last 30 days |
| `playwright/tests/explore/persian-calendar.spec.ts` | Explore → Persian Calendar → custom Jalali range |

Operational chart used: **Weekly Messages** (`main.messages`), temporal filter `ts (No filter)`.

## Usage

1. Check out branch `feat/persian-date-filter-clean`
2. Build and run Superset as usual
3. Open **Explore** or a Dashboard **time filter** → edit **Time range**
4. Select **Persian Calendar** from the range type dropdown
5. Choose a relative range or pick a custom Jalali date range

## Docker (operational)

`docker-compose.yml` is the source of truth for this environment:

| Service | Port | Role |
|---|---|---|
| `superset` (`superset_app`) | 8088 | Flask API and UI |
| `nginx` (`superset_nginx`) | 80 | Proxies `/static` to webpack on host `:9000` |
| `superset-node` | 9000 | In-container webpack when `BUILD_SUPERSET_FRONTEND_IN_DOCKER=true` |

Frontend sources are bind-mounted:

```yaml
- ./superset-frontend:/app/superset-frontend
```

If `superset-node` fails `npm install` (common when the host `node_modules` is Darwin and the container is Linux), skip in-container frontend build and run webpack on the host, which is the path documented in `docker-compose.yml`:

```bash
cd superset-frontend
npm run dev-server   # http://127.0.0.1:9000, proxies API to :8088
```

Default Docker login is `admin` / `admin` (`CYPRESS_CONFIG=false` in `docker/.env`). Open `http://localhost:8088` (nginx also on port 80).

Chrome Playwright against that instance (uses installed Google Chrome, not bundled Chromium):

```bash
cd superset-frontend
PLAYWRIGHT_BASE_URL=http://localhost:8088 \
SUPERSET_ADMIN_PASSWORD=admin \
PLAYWRIGHT_CHANNEL=chrome \
npx playwright test --headed playwright/tests
```

The Persian calendar spec tries `admin`/`admin`, then `admin`/`general`. Override with `SUPERSET_ADMIN_PASSWORD`.
Explore charts that use a temporal adhoc filter (for example `ts (No filter)`) are covered; the suite opens that filter, then **Persian Calendar**.

## Keeping this fork current with Apache Superset

This overlay is a small set of commits on top of upstream. After each official release:

```bash
git fetch upstream --tags
git rebase 6.0.0          # replace with the target release tag
cd superset-frontend
npm run test -- spec/utils/persianCalendar.test.ts \
  spec/explore/components/controls/DateFilterControl/ \
  src/explore/components/controls/DateFilterControl/tests/
```

Conflict risk is limited to `DateFilterLabel.tsx`, `types.ts`, `constants.ts`, and `dateFilterUtils.ts`. New Persian files should rebase cleanly.

## Status

| Item | Status |
|------|--------|
| Unit tests | Covered in this fork |
| Upstream Superset merge | Not submitted / not merged |
| Production-ready for fork users | Tested in this fork |

## Disclaimer

This is an independent community extension. It is not endorsed by the Apache Software Foundation or the Superset PMC. Use at your own discretion.

For upstream Superset issues and contributions, see [apache/superset](https://github.com/apache/superset).

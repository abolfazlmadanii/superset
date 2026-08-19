# Persian Calendar extension — technical notes

User guide (Persian, with screenshots): [README.fa.md](README.fa.md)

English overview and test list: [README.md](README.md)

## Files

| File | Purpose |
|------|---------|
| `superset-frontend/src/utils/persianCalendar.ts` | Jalali ↔ Gregorian |
| `superset-frontend/src/explore/components/controls/DateFilterControl/components/JalaliDatePicker.tsx` | Jalali picker |
| `superset-frontend/src/explore/components/controls/DateFilterControl/components/PersianCalendarFrame.tsx` | Persian filter frame |
| `superset-frontend/src/explore/components/controls/DateFilterControl/DateFilterLabel.tsx` | Wires the frame into time filters |

Dependencies: `jalaali-js`, `dayjs-jalali`, `react-multi-date-picker`.

## Docker

`docker-compose.yml` maps Flask to `8088`, nginx to `80`, and webpack to `9000`. Frontend is bind-mounted:

```yaml
- ./superset-frontend:/app/superset-frontend
```

If `superset-node` fails `npm install` (host `node_modules` vs Linux container), run webpack on the host:

```bash
cd superset-frontend
npm run dev-server
```

Login: `admin` / `admin` (`CYPRESS_CONFIG=false` in `docker/.env`).

Regenerate usage screenshots:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8088 SUPERSET_ADMIN_PASSWORD=admin \
  node docs/persian-calendar/capture-screenshots.mjs
```

## Upgrade overlay

After fetching an Apache Superset release, rebase this branch and re-run the Jest command in [README.md](README.md). Touch points: `DateFilterLabel.tsx`, `types.ts`, `constants.ts`, `dateFilterUtils.ts`.

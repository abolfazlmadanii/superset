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

A **Persian Calendar** option in Explore's time range filter (`DateFilterControl`) with:

- Jalali (Shamsi) calendar UI for date selection
- Relative ranges: Last 7 / 30 / 90 days, Last year
- Custom Jalali date range picker with RTL support
- Gregorian output for Superset queries (backend compatibility unchanged)
- Unit tests for utilities and components

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
| `superset-frontend/src/explore/components/controls/DateFilterControl/DateFilterLabel.tsx` | Wires the Persian frame into Explore |

## Dependencies

- `jalaali-js` — accurate Jalali date math
- `dayjs-jalali` — Jalali support for dayjs
- `react-multi-date-picker` — Persian calendar UI

## Testing

Frontend unit tests (all passing):

```bash
cd superset-frontend
npm run test -- spec/utils/persianCalendar.test.ts \
  spec/explore/components/controls/DateFilterControl/PersianCalendarFrame.test.tsx \
  spec/explore/components/controls/DateFilterControl/JalaliDatePicker.test.tsx
```

## Usage

1. Check out branch `feat/persian-date-filter-clean`
2. Build and run Superset as usual
3. Open **Explore** → edit a chart's **Time range**
4. Select **Persian Calendar** from the range type dropdown
5. Choose a relative range or pick a custom Jalali date range

## Status

| Item | Status |
|------|--------|
| Unit tests | ✅ Passing |
| Upstream Superset merge | ❌ Not submitted / not merged |
| Production-ready for fork users | ✅ Tested in this fork |

## Disclaimer

This is an independent community extension. It is not endorsed by the Apache Software Foundation or the Superset PMC. Use at your own discretion.

For upstream Superset issues and contributions, see [apache/superset](https://github.com/apache/superset).

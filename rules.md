# Spotistats Working Rules

## Architecture Notes

- SolidJS app bootstraps in `src/index.tsx`, mounting `App` which loads streaming history on mount and renders routes inside `AppLayout`.
- `historyModel` (Effector) fetches `/data/*.json`, aggregates them into artist trees, time indexes, and summary stats that drive all views.
- Views obtain data through `createSelect` schemas (e.g. `artistView`) which merge time buckets, run search filters, and return typed list items.
- UI state for filters (search, sort, time range) comes from a reusable `createFiltersModel`, consumed via shared filter components.
- Shared UI primitives (Card, Metric, TimeRangeControl, VirtualList, BaseLineChart) and theme tokens in `src/shared/styles/index.css` enforce consistent presentation.

## Response & Implementation Rules

- Always back page-level logic with Effector stores/gates; source underlying data from `historyModel`.
- For list views, define or extend a projector schema and drive it with the unified filters model to keep search/sort/range behaviour consistent.
- Reuse shared filter UI (`SearchFilter`, `SortFilter`, `TimeRangeFilter`) by wiring them to the page’s filters model via `useUnit`.
- Build charts through `ChartsModel` helpers and render with `BaseLineChart`, storing the active metric in Effector state.
- Compose UIs from shared components and theme tokens; virtualize large collections with `VirtualList`.
- Prefer `dateLib` utilities for date math and formatting to keep calculations aligned across features.
- When adding data transforms, extend aggregator/projector layers rather than mutating UI components directly.
- Maintain ASCII text, concise inline comments only when clarity demands; follow existing naming/style conventions.
- Never reintroduce or alter features that have been removed/declined unless explicitly requested.

# Code style / format

- Always format code according to `.prettierrc` rules.

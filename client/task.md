# Calendar Migration Task

Replace current custom calendar implementation with `BigCalendar` and `EventCalender` components, using real backend data.

## Status: In Progress

## Todo
### Phase 1: Environment & Data
- [x] Add `react-big-calendar`, `react-calendar`, and `moment` to `client/package.json`.
- [x] Update `Event` interface in `client/services/api/client.ts`.
- [x] Install dependencies.

### Phase 2: Component Updates
- [x] Convert `client/config/BigCalendar.jsx` to `BigCalendar.tsx`.
- [x] Convert `client/config/EventCalender.jsx` to `EventCalender.tsx`.
- [x] Fix missing `moreDark.png` in `EventCalender.tsx`.

### Phase 3: Page Refactor
- [x] Update `client/app/(dashboard)/calendar/page.tsx`:
    - [x] Import `BigCalendar` and `EventCalender`.
    - [x] Fetch events from `/api/events`.
    - [x] Implement `Dialog` (Centered) for event details.
    - [x] Update layout to a two-column responsive grid.

### Phase 4: Finalization
- [x] Verify functionality (fetching, clicking, displaying).
- [x] Cleanup unused calendar code (Kept by user request).

## Completed
- [x] Research and planning
- [x] Setup `task.md`
- [x] Dependency installation
- [x] Component refactoring and conversion to TSX
- [x] Page integration with real data fetching and Dialog

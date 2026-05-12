<!-- Copilot/agent bootstrap instructions for ssv_scheduling_website -->
# Copilot Instructions

Purpose: Make codebase onboarding and common tasks predictable for AI assistants and contributors.

Repository layout (key files):
- `src/` — React UI components (App.jsx, ScheduleApp.jsx, ScheduleBoard.jsx, etc.)
- `data/` — Static data: `chapters.js`, `schedule.json`
- `server/` — Simple Node/Express backend (server/index.js)
- `store/` — hooks for schedule state (`useSchedule.js`)

Quick start (from project root):
- Install: `npm install`
- Start dev client: `npm run dev`
- Start server: `npm run server` (runs `node server/index.js`)
- Build: `npm run build`

Agent workflow expectations:
- When changing UI behavior, update components under `src/components/` and any affected tests.
- When modifying schedule data, update `data/schedule.json` and ensure `useSchedule.js` still handles the shape.
- Preserve small files and existing style; prefer minimal, focused edits.

Architecture notes:
- Single-page React app built with Vite.
- Drag-and-drop uses `@dnd-kit` packages.
- Backend is minimal Express; used for simple API or static hosting during development.

Conventions & guidelines:
- Keep commits small and focused.
- Prefer descriptive variable and prop names; avoid single-letter names unless very local.
- Follow existing JS/JSX style (no enforced linter in repo currently).

Common tasks for the assistant:
- Add or refactor components in `src/components/`.
- Update schedule logic in `store/useSchedule.js`.
- Migrate or extend `data/schedule.json` format — include a migration note.
- Add tests or quick smoke checks when making behavioral changes.

Suggested example prompts for collaborators or AI:
- "Run the dev server and open the app; report any console errors."
- "Add a filter to `ScheduleBoard.jsx` to show only upcoming stages."
- "Refactor `useSchedule.js` to memoize computed schedule slices."

If you need more context, inspect `package.json`, `src/`, and `data/`.

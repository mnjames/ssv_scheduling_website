# SSV Scheduling Website

Simple single-page scheduling app built with React + Vite and a minimal Express server.

Quick start

Prerequisites:
- Node.js (16+ recommended)

Install and run locally:

1. Install dependencies

   npm install

2. Start the development client

   npm run dev

3. (Optional) Start the dev server

   npm run server

Build & deploy

- Build: `npm run build`
- Preview production build: `npm run preview`
- Deploy to GitHub Pages (configured): `npm run deploy`

Project structure (high level)
- `src/` — React components and app entry
- `data/` — schedule and chapter data
- `server/` — Express server for API or static hosting

Developer notes & example prompts
- The schedule data lives in `data/schedule.json` — modify carefully and update `useSchedule.js` if the schema changes.
- To ask the AI assistant to help: "Add a UI control to filter the schedule by stage type and preserve drag-and-drop behavior."
- For debugging: "Run the dev server and list any client console errors and server logs."

If you'd like, I can run the dev server and check for console errors now.

# CLAUDE.md

Guidance for Claude Code (and future contributors) working in this repository.

## Project

Helen Hamlyn Centre for Design Data Platform — a React 19 + D3.js knowledge-graph
visualization built with Create React App (`react-scripts`), deployed on Vercel.
Maps relationships between People, Partners, Projects, and Methods.

- Live site: https://helen-hamlyn-centre-platform.vercel.app
- GitHub: https://github.com/CBcbbb/Helen-Hamlyn-Centre-Platform
- See README.md for architecture and ADMIN_GUIDE.md for the admin panel.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server at http://localhost:3000 |
| `npm run dev` | Dev server + local admin API (`local-api-server.js` on :3001) — needed for admin panel saves in dev |
| `npm run data:build` | Regenerates `public/data/graphData.json` from `data/*.csv` via `scripts/convert.js` |
| `npm run build` | Production build |
| `npm test` | Test suite |

## Data pipeline — single source of truth

**Never hand-edit `public/data/graphData.json`.** It is generated. To change data:

1. Edit the CSVs in `data/` (PEOPLE, PARTNERS, PROJECTS, METHODS) — or use the `/admin` panel
2. Run `npm run data:build`
3. Commit both the CSV changes and the regenerated JSON

## Git & deploy workflow (hybrid)

Vercel auto-deploys from GitHub: pushes to `main` → **production**; pushes to any
other branch / PR → **preview** deployment with its own URL.

- **Before starting any work:** `git checkout main && git pull` (the remote may be
  ahead if a PR was merged on GitHub).
- **Small/content changes** (data updates, copy, README): commit directly on `main`
  and push. Vercel deploys production automatically.
- **Bigger or riskier changes** (features, refactors, dependency bumps): create a
  branch, push it, open a PR, check the Vercel *Preview* URL on the PR, then merge.
- **Before pushing to `main`:** run `npm run build` locally — if the build fails
  locally it will fail on Vercel.
- After merging a PR on GitHub, sync local (`git pull`) and delete the merged branch.

## Principles for future iterations

- **DRY — one definition, referenced everywhere.** Shared graph logic lives in
  `src/utils/graphUtils.js` (e.g. `getNodeColor`). Extend it there; never duplicate
  color maps, type lists, or data-processing logic inside components.
- **Adding a node type touches exactly three places** (see README "Adding Node
  Types"): `visibleTypes` in `RelationshipGraphApp.js`, `getNodeColor` in
  `graphUtils.js`, and the data schema. Don't scatter type constants elsewhere.
- **Keep the two save backends in sync.** Admin saves go through
  `api/save-data.js` (Vercel serverless, production) and `local-api-server.js`
  (Express, dev). A change to one must be mirrored in the other.
- **Accessibility is not optional.** Preserve ARIA attributes, keyboard navigation,
  and focus management when touching components; test with keyboard only.
- **Docs follow behavior.** If a change alters commands, data flow, or the admin
  panel, update README.md / ADMIN_GUIDE.md in the same commit.

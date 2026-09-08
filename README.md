# Paladin Woodworks

Fine woodworking portfolio and parametric watch-box planner, built with Next.js, React, TypeScript and Tailwind CSS.

## Development

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Routes: `/`, `/about`, `/portfolio`, `/planner` (watch box), `/planner/cabinet`.

## Validation

```sh
npm run build
npm run typecheck
npm start
```

## Vercel

Import this GitHub repository as a new Vercel project. Select the Next.js framework preset, keep the root directory at the repository root, and use `npm run build`. No environment variables or database are required. After deployment, attach your domain under the project's Domains settings.

Pushes to main deploy production when Git integration is enabled. Use branches and pull requests for preview deployments.

## Planner

The planner supports miter/butt corners, bottom grooves, interior dividers, a lift-off lid, an exploded technical preview, cut lists, CSV export, and JSON project import/export. Dimensions accept decimals and fractions. Saved projects use browser local storage, not an account or database. Export JSON from the old domain and import it on the new domain to transfer a project.

Core calculations: `lib/woodworking.ts`. Model rendering: `app/model.tsx` and `lib/model-rendering.ts`. Planner UI: `app/planner/`. Branding asset: `public/paladin-logo.png`.

## Cabinet builder

The cabinet builder supports one to six side-by-side cases with individual widths and shared height, depth, material and construction. Options include fixed shelves, shelf dados, separate flush face frames, single or paired inset/overlay plywood slab doors, and wall-hung or floor-standing installation. Floor mode includes a separate recessed plinth per cabinet. Case height excludes the plinth; case depth includes the applied back but excludes frame/overlay doors. Overall dimensions include those additions. Adjacent frames retain both stiles; there are no shared stiles, wall fillers or installation gaps.

The model, per-cabinet front summaries, CSV and printed cut list use the same run calculations. Old single-cabinet JSON files migrate to one open wall-hung case without changing cut dimensions. Hardware, swing clearances, mounting systems, countertops and load calculations are not included. The applied back is not specified as a mounting system.

Calculations: `lib/cabinet.ts` and `lib/cabinet-run.ts`. Geometry: `components/cabinet-model.tsx`. UI: `app/planner/cabinet/page.tsx`.

Run dimension regression checks with Node.js 22.13+:

```sh
node --experimental-strip-types --test tests/*.test.mjs
```

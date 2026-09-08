# Paladin Woodworks

Fine woodworking portfolio and parametric watch-box planner, built with Next.js, React, TypeScript and Tailwind CSS.

## Development

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Routes: `/`, `/about`, `/portfolio`, `/planner`.

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

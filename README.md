# Form & Field

A cinematic, responsive concept homepage for a premium AI-assisted manufacturing marketplace, built with Next.js App Router, TypeScript, Tailwind CSS v4 and React Three Fiber.

**All products, manufacturers, locations attributed to manufacturers, customers, stories and comments are explicitly fictional demo data.** There are no payments, real orders, sign-ups, engineering services or external AI integrations.

## Run locally

Requires Node.js 22.13+ (Node 24 recommended) and npm.

```bash
npm ci
npm run dev
```

Open http://localhost:3000 in your local browser. To preview the production website:

```bash
npm run build
npm start
```

For a remote workspace, forward port 3000 using your development environment's supported port forwarding. No API keys, database, accounts, fonts, images or other external services are needed at runtime. The npm cache is configured under `/tmp` for compatibility with restricted cloud home directories.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Explore the demo

- Select any of the three creation cards to update the large 3D model, title, material and fictional manufacturer. Models use low-complexity procedural Three.js geometry; only one canvas renders, with device pixel ratio capped at 1.5.
- Pause rotation with the scene control. System reduced-motion preferences disable automatic rotation and smooth scrolling; rendering switches to demand mode.
- Open the hamburger menu with a keyboard or pointer. The native modal dialog traps focus, supports Escape and close/backdrop dismissal, and returns focus to its trigger. Menu entries navigate to actual sections; Account explains that accounts are unavailable.
- Expand FAQs or follow the gallery and story links. No personal information is collected.
- When WebGL is unavailable, the gallery uses local CSS still-life illustrations. A render error boundary also provides the same fallback.
- Responsive styling supports narrow mobile screens through desktop. No external media assets or generated image downloads are required.

## Project structure

- `app/`: App Router layout, homepage and global styling/Tailwind import.
- `components/marketplace.tsx`: gallery state, dialog navigation, content and fallback illustrations.
- `components/creation-scene.tsx`: dynamically loaded React Three Fiber canvas and procedural models.

## Scope

Customise, Assemble and Engineer explain the envisioned workflow; they do not provide editors or manufacturing operations. The account notice is local UI only. The 3D models are performant visual placeholders rather than manufacturable CAD. Future backend, authentication and commerce work should be implemented and reviewed separately.

## Browser smoke tests

The included Playwright checks exercise creation selection and manufacturer updates, all menu entries, keyboard focus wrapping and Escape, account and FAQ notices, mobile overflow, reduced motion, WebGL fallback, and live 3D rendering with pause controls.

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

If Chromium is already installed, use it instead of downloading a browser:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

The test runner starts the production server automatically when port 3000 is free. The live 3D test requires a WebGL-capable browser (software rendering is sufficient).

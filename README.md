# Form & Field — The Community Exhibition

A cinematic black-background exhibition of imagined community creations, built with **Next.js App Router, TypeScript, Tailwind CSS v4 and React Three Fiber**. A luxury motorhome, scooter, chair and halo light use lightweight procedural placeholder geometry rather than external assets.

**Every creation, creator, manufacturer, attributed location, story and seeded comment is fictional demo content.** No real customers, manufacturers, AI services, payments, orders or manufacturing operations are represented or integrated.

## Run and preview

Node.js 22.13+ (Node 24 recommended) and npm are required. No API keys, database or external runtime services are needed.

```bash
npm ci
npm run dev
```

Open http://localhost:3000 locally, or use your development environment's supported port forwarding. For a production preview:

```bash
npm run build
npm start
```

The npm cache is configured under `/tmp` for restricted cloud home directories.

## Explore

- **Exhibition:** Atlas motorhome starts under a dramatic spotlight; other creations wait in the shadows. Every 10 seconds, objects ease into their new positions. Manual selection resets the 10-second interval. Pause stops both rotation and automatic advancement. Hidden browser tabs stop advancement and rendering; the full interval restarts when visible.
- **Customise:** enter the bright Atlas motorhome studio and change exterior colour, satin/polished finish and body length. All three modes deliberately use the Atlas prototype, regardless of the gallery selection.
- **Assemble:** toggle solar roof panels, an outdoor awning and rear storage. Geometry appears or disappears immediately.
- **Engineer:** adjust body length (5.5–8 m), clearance (180–450 mm), wheel diameter (16–26 in) and body wireframe. These change visual geometry, not validated calculations. This is not CAD, structural analysis, roadworthiness assessment or manufacturing-ready engineering.
- **Workspace:** the black backdrop slides away to reveal a white studio. Toggle the workshop backdrop/grid, pause rotation or reset the design. Settings persist across modes in page state; returning to the exhibition preserves its selected creation.
- **Community:** appreciate a concept or add a local comment. These are working browser-only interactions, explicitly unpublished. They are associated with each creation and reset on reload. No data is sent to a server.

## Accessibility and performance

- Semantic sections and labelled controls; native modal navigation with focus wrapping, Escape dismissal, focus restoration and focus movement into the studio.
- System reduced-motion preferences disable automatic cycling, rotation and animated transitions. Manual selection and all controls remain available. A single canvas uses demand rendering in reduced-motion/paused/hidden states.
- WebGL capability detection and a React error boundary provide local SVG illustrations when 3D is unavailable. Illustrations reflect colour, body length, wheel size and modules; polished shading and 3D wireframe/clearance are best explored with WebGL.
- One canvas, device pixel ratio capped at 1.5, simple mesh geometry and no external images, models, fonts, postprocessing or real-time shadow maps.
- Responsive gallery and stacked mobile configurator; controls remain accessible on narrow screens.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

If system Chromium is installed, avoid a browser download:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright starts a dedicated production server on **port 3100**, leaving a development server on 3000 undisturbed. Build first. Tests cover 10-second cycling, manual selection, pause, all three modes, visible canvas colour changes, retained/reset settings, modules and engineering controls, keyboard navigation, local comments, fictional disclosures, mobile layout, reduced motion and no-WebGL fallback. The live canvas test needs a WebGL-capable browser; software rendering is sufficient.

## Structure

- `app/`: App Router page/layout, metadata and Tailwind/global styling.
- `components/marketplace.tsx`: gallery, accessible navigation, studio controls, SVG fallback and local community state.
- `components/creation-scene.tsx`: procedural models, spotlight, scene positioning and animation.
- `components/exhibition-data.ts`: explicitly fictional content and typed configuration defaults.
- `tests/home.spec.ts`: browser integration tests.

The website is a visual prototype. Backend persistence, authentication, production engineering and commerce require separate implementation and review.

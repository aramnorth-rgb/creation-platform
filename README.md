# form&field — Community Carousel

A visual, nearly black 3D exhibition built with **Next.js App Router, TypeScript, Tailwind CSS v4 and React Three Fiber**. The existing form&field name is a placeholder. The bright Customise, Assemble and Engineer prototypes are preserved.

**All creations, designers, biographies, motivations, manufacturers, manufacturer ratings, attributed locations and seeded comments are explicitly fictional demo content.** This is not evidence of real customers, manufacturers or reviews. No payments, orders, external AI services, production engineering or backend persistence are integrated.

## Run and preview

Requires Node.js 22.13+ (Node 24 recommended) and npm. No API keys or database are needed.

```bash
npm ci
npm run dev
```

Open http://localhost:3000 locally or use your environment's supported port forwarding. Production preview:

```bash
npm run build
npm start
```

The npm cache uses `/tmp` for restricted cloud home directories. Models, illustrations and fonts need no external network requests at runtime.

## Carousel interactions

The initial viewport contains the header/mode navigation and the visual carousel, without a hero headline, creation list or information overlay. Additional accessible controls sit **below** the initial viewport.

Twelve distinct procedural demo creations sit around a large circular platform: an Atlas motorhome, Glide scooter, Fold chair, Halo light, Mira robotic arm, Orbit ring, Quiet Pavilion, Torque drill, Meridian watch, Aero Seed drone, Resonance speaker and Tidal Vessel. A fixed spotlight illuminates the front position; the other creations remain shadow silhouettes.

- **Automatic:** every 10 seconds the circular group turns to feature the next creation, including a smooth last-to-first wrap. The featured object rotates very slowly about its own axis. Auto advancement stops while interacting, while details are open, when paused or when the tab is hidden. Manual selection starts a fresh 10-second interval.
- **Carousel drag:** drag the surrounding space horizontally, then release to snap to a creation. The angular distance determines how many positions move. Pointer cancellation restores the current selection.
- **Object drag:** start on the spotlighted model to rotate it independently in pitch/yaw. Release to ease back to its original orientation, then resume slow rotation. This does not move the carousel or open details. Pointer movement over 8 CSS pixels counts as a drag; a tap/click opens details instead. Pausing automatic movement still allows manual interaction and animated return. Reduced motion uses an immediate return.
- **Keyboard:** focus the carousel with Tab. Left/Right selects creations; Home returns to Atlas; Enter or Space opens details; P pauses/resumes automatic movement. Shift + arrow keys rotates the object; releasing the arrow returns it. Previous/Next, Explore creation and Pause buttons below the canvas provide equivalent controls.
- **Details:** click/tap the featured object to reveal a compact panel below it. It contains the chosen object name, designer biography/motivation, fictional manufacturer and numeric star rating, a comments preview and a local comment-entry control. Full profile/story and full comments links open working accessible demo dialogs. Close with Escape or the labelled close buttons; focus returns to the opener.
- **Local comments:** additions belong to the selected creation, appear in its full comments view and are never sent to a server. Everything resets on refresh. Clear fictional and unpublished labels remain visible in all detail views.

## Three preserved studio modes

The black exhibition slides away into a white Atlas motorhome workspace. All three modes deliberately configure Atlas regardless of which gallery object was selected.

- **Customise:** exterior colour, satin/polished finish and body length.
- **Assemble:** optional solar roof, outdoor awning and rear storage geometry.
- **Engineer:** body length (5.5–8 m), clearance (180–450 mm), wheel diameter (16–26 in) and body wireframe.

Options are shared between modes. Workshop background/grid, pause and reset remain functional. These parameters change visual placeholders only: no CAD export, structural calculations, safety certification, roadworthiness assessment or real manufacturing services are provided.

## Accessibility and performance

- Semantic labelled controls, visible keyboard focus, screen-reader instructions, focus restoration and native dialogs with focus wrapping.
- Reduced-motion preferences disable automatic cycling, rotation and cinematic transitions. Manual selection, object rotation and all configurators remain available.
- One canvas, capped device pixel ratio (1.5), low-complexity geometry and demand rendering when paused/reduced-motion. Necessary return/snap frames are requested only until settled. No external assets, postprocessing or real-time shadow maps.
- When WebGL is unavailable or rendering fails, local SVG illustrations preserve selection, drag/tap details and studio options. Motorhome illustrations reflect colour, length, wheel size and modules; polished shading, body wireframe and clearance are best explored in 3D.
- Responsive layouts include a full mobile carousel and stacked studio controls. Horizontal scene drags and vertical object drags use pointer capture; page scrolling remains available outside the canvas.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

If system Chromium exists:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright starts a dedicated **production server on port 3100**, leaving a dev server on 3000 undisturbed. Build first. Browser coverage includes the 12-position timer/wrap, manual selection and pause, isolated object/carousel dragging, object return, on-demand information, fictional profile and rating, local comments, keyboard navigation, all three configurators, mobile real touch input, pointer cancellation, reduced motion and SVG fallback. WebGL checks work with software rendering.

## Structure

- `app/`: App Router page/layout, metadata and Tailwind/global styling.
- `components/marketplace.tsx`: pointer/keyboard interactions, details, dialogs, configurators, fallback illustrations and local state.
- `components/creation-scene.tsx`: procedural models, circular group animation, independent model orientation and studio rendering.
- `components/exhibition-data.ts`: explicitly fictional concepts, profiles, ratings and configuration defaults.
- `tests/home.spec.ts`: browser integration checks.

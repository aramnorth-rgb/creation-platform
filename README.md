# NITORIX — Homepage V5

A visual, nearly black 3D exhibition built with **Next.js App Router, TypeScript, Tailwind CSS v4 and React Three Fiber**. NITORIX is a provisional working name, not a registered-brand claim. Customise, Assemble and Engineer now expose one shared Contour desk-organiser engine. The original Atlas prototype remains available through the workshop product selector.

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

The initial viewport contains the header/mode navigation and the visual carousel, without a hero headline or creation list. Two narrow foreground promotional panels overlap the outer carousel on wide screens; on compact screens they move below the exhibition to keep the featured object clear. A compact floating information card appears beside the selected creation only after selection; on mobile it becomes a scrollable floating card above the lowered creation. Opening or closing it does not resize the canvas, scroll the page or reset the carousel. Additional accessible controls sit **below** the initial viewport.

Twelve distinct demo creations sit around a large circular platform (radius increased from 12 to 18 units in V5, 50% wider): an Atlas motorhome, Glide scooter, Fold chair, Halo light, Mira robotic arm, Orbit ring, Quiet Pavilion, Torque drill, Meridian watch, Aero Seed drone, Resonance speaker and Tidal Vessel. A fixed spotlight illuminates the front position; the other creations remain shadow silhouettes.

- **Automatic:** every 10 seconds the circular group turns to feature the next creation, including a smooth last-to-first wrap. The featured object rotates very slowly about its own axis. Auto advancement stops while interacting, while details are open, when paused or when the tab is hidden. Manual selection starts a fresh 10-second interval.
- **Carousel drag:** drag the surrounding space horizontally, then release to snap to a creation. The angular distance determines how many positions move. Pointer cancellation restores the current selection.
- **Object drag:** start on the spotlighted model to rotate it independently in pitch/yaw. Release to ease back to its original orientation, then resume slow rotation. This does not move the carousel or open details. Pointer movement over 8 CSS pixels counts as a drag; a tap/click opens details instead. Pausing automatic movement still allows manual interaction and animated return. Reduced motion uses an immediate return.
- **Keyboard:** focus the carousel with Tab. Left/Right selects creations; Home returns to Atlas; Enter or Space opens details; P pauses/resumes automatic movement. Shift + arrow keys rotates the object; releasing the arrow returns it. Previous/Next, Explore creation and Pause buttons below the canvas provide equivalent controls.
- **Details:** click/tap the featured object to reveal a compact floating panel beside it. It contains the chosen object name, designer biography/motivation, fictional manufacturer and numeric star rating, a comments preview and a local comment-entry control. Full profile/story and full comments links open working accessible demo dialogs. Close with Escape or the labelled close buttons; focus returns to the opener.
- **Local comments:** additions belong to the selected creation, appear in its full comments view and are never sent to a server. Everything resets on refresh. Clear fictional and unpublished labels remain visible in all detail views.

## Shared desk-organiser engine

The workshop opens on **Contour**, an original procedural modular desk organiser. All three modes consume the same `DeskConfiguration`, reducer, product definition, `deskGeometry()` and `priceDesk()`; mode switching does not copy or reset the design. Returning to the exhibition or selecting Atlas and back also retains the desk configuration during the page session.

- **Customise:** customer-friendly material families (recycled polymer, brushed aluminium, oak composite), four colours and compact/everyday/expansive footprints.
- **Assemble:** add/remove pen cups, small-parts trays and phone rests. Position modules by selecting one of six named connection points. Each accepts one module; phone rests require rear points. Repositioning snaps to the shared connection coordinates, including after resizing the base. Incompatible/occupied destinations are disabled and rejected by the reducer. This is discrete point placement, not drag-and-drop or a physics solver.
- **Engineer:** precise whole-millimetre width, depth, base/wall thickness, rim height and edge radius; wireframe, connection markers, coordinates and demonstration rail specification. Numeric edits commit on blur or Enter and clamp to supported ranges. JSON export contains the versioned product configuration, not manufacturing CAD.
- **Shared view controls:** preview rotation and connection markers. Existing workshop background and pause remain available. Reduced motion renders on demand.
- **One demo price:** fabrication + volume-based base material + module line items, calculated centrally in integer GBP pence. Colour and presentation changes do not affect price; geometry, material and attachments do. Prices are illustrative, excluding tax/delivery, and are never a manufacturer quote.

The same millimetre-based part description drives both the rounded PBR WebGL model and the projected SVG fallback. Rubber feet, tray walls, module floors, six rails and phone support/lip are generated locally. These are visual demo parts, not licensed scans or validated manufacturing geometry. Material families use lightweight PBR parameters; no high-resolution wood textures or CAD kernel are included. Rounding is capped per part thickness. SVG is an approximate projection and does not reproduce bevels, tilted surfaces or lighting exactly.

### Reuse and future embedding

`lib/configurator/desk.ts` contains the framework-independent product contract, versioned serialisable configuration, pure reducer, compatibility rules, geometry builder, descriptions and pricing. `components/use-desk-engine.ts` supplies the shared configuration/history and picker state to a host. Pass that engine object to `DeskControls` and its current configuration to `DeskModel`; mode changes never create separate product state. The definition is the first product adapter, not a complete arbitrary-product schema interpreter. All lengths are mm; money is GBP pence.

Open **http://localhost:3000/configure** for a minimal standalone host using exactly the same reducer, controls and rendering. It can serve as an iframe proof of concept on a trusted manufacturer site (for example `<iframe src="https://YOUR-DEPLOYMENT/configure" title="NITORIX desk organiser" width="100%" height="900"></iframe>`). The host layout adapts to its container viewport. No cross-origin messaging, account sharing, quote submission, embed authentication or marketplace API is implemented. Do not treat exported JSON as trusted server input: future ingestion needs schema validation/version migration and server-side repricing.

Each mounted host owns its configuration. State persists across mode changes, but not refreshes or separate pages/iframes. There is no localStorage, backend, CAD export, collision/strength/tolerance solver or real supplier quote. Footprints and connection spacing are bounded so supported module envelopes fit; this is not engineering certification. No new dependencies or remote assets were added.

## Workshop V2

- The catalogue always displays all three module families from the shared product definition. Previously selecting Phone rest left a front point selected, disabling Add; picker state also reset when controls unmounted. A typed catalogue and shared availability/connection rules now drive the UI and reducer. Selecting a module keeps a compatible free point or picks the first available one. Full/incompatible points and unavailable modules retain visible names and reasons; occupied points become available after removing their module. Unknown module IDs are rejected by the engine. No additional module families were invented.
- **Visual selectors:** scrollable radio lists replace the module and connection dropdowns, including repositioning installed modules. Arrow keys, Home/End, Tab and touch work. Thumbnails use cached SVG projections of the shared module geometry (animated with restrained CSS depth), rather than separate WebGL scenes. Connection previews show the actual dimension-dependent point locations, occupancy and a highlighted location; Assemble also highlights the selected point in the main preview. IntersectionObserver and document visibility pause thumbnail animations outside visible regions; reduced motion disables them. These are lightweight illustrations, not live shaded miniature 3D renderers.
- **Undo/Redo:** both hosts use the same bounded history reducer, retaining up to **50 product edits** across all three modes, including resets, materials, dimensions, modules and installed connection positions. Footprint presets are a single transaction. Invalid/no-op edits do not erase redo; a new valid edit after undo starts a new branch. Buttons disable when unavailable. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z redoes while the desk workshop is active. Text/number/select editing keeps native undo. History stays in memory and resets on reload. Catalogue selection, environment and background visibility are presentation state, outside product history; Atlas retains its legacy controls.
- **Environments:** Workshop Background starts on for new sessions. Visual swatches and Previous/Next cycle modern studio, warm woodworking workshop, industrial fabrication space and futuristic showroom. The same controls exist on `/configure`. Switching backgrounds never changes the product or price. Turning the toggle off restores a neutral studio; turning it on restores the selected environment. Backgrounds are original defocused CSS scenery with matching lightweight floor colours and a grid, not photographic panoramas or HDR lighting maps. No remote assets or added dependencies are required.
- **Lighting:** the desk has a neutral soft key, balanced fill and rim, local prefiltered reflections and a single 1024px shadow map, with reduced shadow bias for contact. No bloom or heavy screen-space effects. Scene accuracy remains a visual prototype: backgrounds do not provide physically matched lighting, and the original procedural material limitations still apply.
- The old Assemble headline was replaced with “Assembly studio.” The exhibition, community UI, shared price engine, configuration export and legacy Atlas controls remain available.

The 21-test suite (17 browser tests and four pure engine-rule tests) includes catalogue capacity, every module family, incompatibility, geometry bounds, history limits/branching, atomic presets, cross-mode keyboard undo/redo, pricing, visible WebGL undo results, visual radio selectors, off-screen animation pausing, environments and mobile/reduced-motion layouts, plus the existing exhibition tests. Tests use software Chromium rather than a physical Windows performance benchmark.

## Preserved Atlas studio modes

The black exhibition slides away into a predominantly white Atlas motorhome workspace. V5 adds brushed trims, frosted control cards, dimensional selected states, tactile hover/press feedback and a revision pulse when options change. Select **Atlas motorhome · legacy prototype** in the workshop product selector to access the original Atlas controls. They retain their separate legacy state and are not part of the new desk product contract.

- **Customise:** exterior colour, satin/polished finish and body length.
- **Assemble:** optional solar roof, outdoor awning and rear storage geometry.
- **Engineer:** body length (5.5–8 m), clearance (180–450 mm), wheel diameter (16–26 in) and body wireframe.

Options are shared between modes. Workshop background/grid, pause and reset remain functional. These parameters change visual placeholders only: no CAD export, structural calculations, safety certification, roadworthiness assessment or real manufacturing services are provided.

## Accessibility and performance

- Semantic labelled controls, visible keyboard focus, screen-reader instructions, focus restoration and native dialogs with focus wrapping.
- Reduced-motion preferences disable automatic cycling, rotation and cinematic transitions. Manual selection, object rotation and all configurators remain available.
- One canvas, capped device pixel ratio (1.5), demand rendering when paused/reduced-motion, and a single 1024px soft spotlight shadow map. Necessary return/snap frames are requested only until settled. Locally generated studio reflections require no external HDR download. Detailed geometry and GLBs load only for the featured creation; shadow silhouettes use the lightweight procedural models. A wider, feathered light covers the full creation and surrounding floor. The circular platform is lower and the camera is framed closer to floor level. All gallery lighting/model changes are isolated from the three configurators.
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

Playwright starts a dedicated **production server on port 3100**, leaving a dev server on 3000 undisturbed. Build first. The browser suite and pure engine rule tests cover shared desk state across all modes, price invariants, compatible/occupied connections, geometry bounds, module repositioning, JSON export, standalone mobile fallback, plus promotional-panel copy, dimensions, responsive placement and non-blocking input, NITORIX branding, the 12-position timer/wrap, manual selection and pause, isolated object/carousel dragging, object return, on-demand information, fictional profile and rating, local comments, keyboard navigation, all three configurators, mobile real touch input, pointer cancellation, reduced motion and SVG fallback. WebGL checks work with software rendering.

## Structure

- `app/`: App Router page/layout, metadata and Tailwind/global styling.
- `components/marketplace.tsx`: pointer/keyboard interactions, details, dialogs, configurators, fallback illustrations and local state.
- `components/creation-scene.tsx`: circular group animation, independent model orientation and unchanged studio rendering.
- `components/gallery-models.tsx`: gallery-only PBR details, licensed GLB loading and procedural fallbacks.
- `components/gallery-lighting.tsx`: local studio reflections, restored on leaving the exhibition.
- `components/exhibition-data.ts`: explicitly fictional concepts, profiles, ratings and configuration defaults.
- `lib/configurator/desk.ts`: shared desk product engine and demonstration price calculation.
- `components/desk-controls.tsx`, `desk-model.tsx`: controlled desk views; `desk-embed.tsx` / `app/configure/`: standalone host.
- `tests/home.spec.ts`, `desk.spec.ts`, `desk-engine.spec.ts`: exhibition/legacy, shared desk integration, and pure product rules.

## Assets and visual limitations

Two detailed **CC0** Khronos reference GLBs are shipped locally: **Sheen Chair** (Eric Chadwick / Wayfair) for Fold, and **BoomBox** (Microsoft) for Resonance. Geometry and PBR material definitions are preserved; embedded textures were resized to 512px. The chair's sample label is hidden at runtime. Combined binaries are approximately 3.15 MB and load on first selection, not on initial page display. Files then use the loader cache.

Full upstream sources, licences, modifications and SHA-256 checksums are recorded in [public/models/ATTRIBUTION.md](public/models/ATTRIBUTION.md), with retained licence notices beside the binaries. These real asset authors are separate from the exhibition's fictional designer/manufacturer stories. Source trademarks do not imply affiliation or endorsement.

The other ten creations remain **procedural demo placeholders**. V5 prioritises Atlas with additional coachwork, grille slats, recessed glazing, rubber seals, wheel arches, roof hardware, carbon sill trim and lighting. The ring, pavilion and watch have new recognisable gallery models with faceted stone/prongs, a pitched roof and frosted walls, and a correctly oriented detailed dial/strap respectively. Other gallery details include scooter brakes/grips, lamp diffuser, robot hardware, drill vents, drone landing rails/camera/rotors and a smooth glazed vessel. They are not photorealistic scans or production CAD. Procedural stand-ins are also used during GLB loading or failure; SVGs remain the no-WebGL fallback.

## V5 showroom and promotional panels

- Desktop uses two real bevelled 3D plaques in the foreground, with original locally generated text textures: **YOUR IMAGINATION. MADE REAL. / Design it. Make it yours.** and **THE NEXT BIG THING? YOURS. / Discover what our creators are building.**
- Width is fixed at 1.12 world units; height is 3.64 units, exactly 40% taller than the 2.6-unit baseline without widening. Text is vertically centred. Cherry metallic bodywork, gloss, electric-red border motion and three tiny yellow sparks per plaque provide depth without a bloom pass.
- Plaque meshes opt out of raycasting. The right plaque moves away when the creator card opens, leaving details clear. Accessible DOM copy supplies screen-reader content and a matching CSS 3D fallback. Below 1000px or in portrait, compact plaques sit below the canvas and never cover the object or its controls.
- A carbon-grain lacquer platform, brushed reflective rings, thin red perimeter illumination and sparse yellow index marks complete the showroom. Product key lighting is neutral soft white; panel emission does not cast a red light onto the product.
- Workshop controls remain fully functional and bright. Colour, finish, dimensions, modules, wireframe, workshop background, reset, local comments and profile dialogs remain available.
- Reduced motion freezes neon/spark motion and removes decorative transitions. Pause also stops WebGL promotional animation. No remote fonts, advertising service, tracking, AI API or commerce integration was added.

Performance choices: only the featured creation receives detailed geometry / licensed GLBs, a single 1024px spotlight map supplies shadows, the pixel ratio is capped at 1.5, and the generated grain texture is 64×64. Reflections use a local prefiltered studio environment; there are no live raytraced/planar product reflections or postprocessing bloom. Tests run with software Chromium, not a physical Windows hardware benchmark.

Model-source/licence details remain in `public/models/ATTRIBUTION.md`: two verified CC0 reference models, ten explicitly labelled procedural placeholders. The new panels, carbon grain and additional geometry are generated within this project and use no third-party artwork.

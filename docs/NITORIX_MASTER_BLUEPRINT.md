# NITORIX — integrated product platform blueprint
Status: architecture and sequencing agreed for development; this is **not** a claim that the features below are already implemented.

## Mission and differentiation
One manufacturer-controlled product record, one validated 3D configuration engine, and many customer experiences. Manufacturers deploy branded configurators to their own sites and optionally to the NITORIX marketplace. Customers can Customise (launch), later Assemble and Engineer, and eventually combine products in Spaces. The objective is easier buying *and* less manual work for manufacturers, not effects for their own sake.

## Core data model (production target)
- Tenant/manufacturer: verified business identity, members, RBAC, domains, branding, configuration, licences.
- Catalogue product: stable ID, SKU, variants, dimensions with units, materials, mounting/compatibility constraints, 2D artwork zones, 3D asset versions and rights, media provenance, prices, inventory/lead times, publication channels and moderation.
- Configurator recipe: schema version, parent product/version, selected variants/options, geometry parameters, optional artwork and source assets, validation result, displayed quotation and taxes.
- Design: immutable or versioned snapshot tied to product and rules version; customer may save/restore/share with explicit permissions.
- Customer/lead: tenant-scoped, consented contact record; engagements, quotations, enquiries, status, owner, tasks and notes. Privacy and data-minimisation requirements; no cross-manufacturer disclosure.
- Quote/order: itemised manufacturer-validated bill of materials and price, availability, delivery/tax, acceptance and payment state, production and delivery updates. Illustrative prices are NEVER orders or binding quotes.
- Deployment/embed: tenant/site-specific tokens/domains, catalogue selection and branding; marketplace opt-in independent of website embed.

## Shared engine
Customise, Assemble, Engineer and Spaces call the same versioned catalogue/configuration/rules/pricing APIs. Manufacturer publishing must not bypass validation. Studio makes constraints readable and easy to edit; generated models are *proposals* until validated by a manufacturer. The engine emits a portable configuration with units and source product version. Export/quote generation must preserve it.

## Customer experience
1. Exceptional photorealistic materials, textures, camera, lighting, shadows and fast load.
2. Intuitive options for colour, material, dimensions; compatible modules; draggable 2D text/image printing zones later.
3. Exact width/depth measurements, honest approximate derived dimensions, scale companions (person, hand, metre ruler, banana), eventually interactions with objects and AR.
4. Save, reopen, share permissioned designs and request quotes.
5. Age-appropriate, entertaining but accessible modes; unavailable Assemble/Engineer labelled under construction until ready.

## Manufacturer Studio
- Product catalogue CRUD; import spreadsheet of products, SKUs, prices, dimensions, variants; upload photos; AI-assisted drafting from reference photos plus manual dimensions and reviewer approval.
- Rule builder: materials, prices, options, constraints, attachment points, compatibility, validation.
- Preview the exact configuration engine used in embedded and marketplace experiences.
- Website-branded, white-label embed independent from marketplace. Explicit per-product channel choice.
- Production specs, bill of materials, quotes, payments and order lifecycle only after verified back-end integration.
- Asset library with versioning, intellectual-property permissions, quality checks and export formats.
- AI marketing tools (later): distinguish promotional generated imagery from certified product renders.

## CRM: integral, not bolted on
A request for quote links to a *specific versioned configuration snapshot*. A tenant-scoped pipeline runs new enquiry -> qualified -> quoted -> approved -> in production -> fulfilled (with lost/closed). Tasks, ownership, customer communication, approval history and after-sales feed into the same product/design history. No tracking without appropriate disclosure/consent. Optional sync with HubSpot/Salesforce, rather than forcing replacement of existing CRM. Manufacturer CRM and NITORIX's own partner CRM are separate tenants and data.

## Extensions and marketplace
- Multi-manufacturer discovery, designer stories, ratings and community with quality moderation.
- NITORIX Spaces: combine multiple manufacturers' verified products into a shared room, retain each supplier/price/spec; designer presentations; eventually client approval and package quotes.
- Augmented reality and virtual try-on only where tracking and source dimensions are reliable.
- AI configurator assistant and agent-readable tools, permissioned and validated; do not lock the business to one nascent protocol.
- Creator collaboration, optional home-manufacturer fulfilment for cross-supplier assemblies.
- Manufacturer-owned buyer relationships by default; avoid exploiting data.

## Development sequence
**Phase 1, V2 working browser demo:** keep original demo engine; enhance dimensions, saved design and copyable summary; connect explicitly created local demo enquiries to a Studio pipeline; catalogue preview tied to locally stored drafts. All demo state stays in this browser, is not private or shared; no customer PII or automatic analytics. Keep V1/main untouched.
**Phase 2, first manufacturer pilot:** server-side authentication/RBAC, tenant separation, encrypted assets, secure object storage and database, catalogue ingestion, validated high-quality real product, preview on manufacturer's own domain, actual messages/quotes with clear consent and audit logs.
**Phase 3, sellable platform:** reliable production BOM/quoting, orders, integrations, customer account tools, observability, revenue pricing and SLAs.
**Phase 4, differentiators:** Spaces, deeper Assemble/Engineer, AI model onboarding, AR and AI content tools.

## Non-negotiables
- Validated product geometry/specifications; distinguish approximations from manufacturer-approved data.
- Only explicit user actions create leads. Do not collect contact details in public localStorage demo or pretend simulated enquiries are sent.
- Platform must remain responsive, reduced-motion safe, keyboard accessible, and useful on mid-range laptops.
- Avoid copycat competitor designs; compete on unified workflow, delightful experience and low manufacturer setup friction.
- V1 main and backup remain untouched until explicitly approved.

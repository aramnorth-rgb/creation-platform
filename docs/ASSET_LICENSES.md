# NITORIX V2 visual assets and provenance

## Scale human figure
- Repository: https://github.com/UMRAM-Bilkent/supine-human-model
- Asset: assets/human_posed.glb, used as public/models/cc0-human-posed.glb
- Upstream author/source: Quaternius original public-domain figure; UMRAM Bilkent adapted/posed the model
- Licence: Creative Commons CC0 1.0, per upstream README and LICENSE (verified 2026-10-30)
- App treatment: rendered in off-white matte material; scale based on documented 5.54-unit long axis
- Limitations: low-poly simplified silhouette, not a photogrammetry scan or anatomically certified body; should be replaced with a high-fidelity CC0 or appropriately licensed commercial scan after quality review

## Other size references
- Hand, metre ruler and banana: original procedurally defined meshes in components/scale-reference-model.tsx.
- Sizes are nominal illustration references rather than certification-grade dimensions; banana sizes naturally vary.
- Hand and banana are not hyperrealistic commercial assets. Acquire and verify higher-quality source geometry and texture licences before calling the comparisons photorealistic.

## Important performance and licensing considerations
- Store verified binary assets locally where possible; avoid third-party runtime dependency.
- Record creator, license type, applicable restrictions, provenance, dimensions, and asset version for every imported 3D model.
- Render comparisons on the same scale as the product; avoid implied precision without verified measurements.

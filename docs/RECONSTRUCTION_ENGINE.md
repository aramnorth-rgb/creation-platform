# NITORIX Reconstruction Studio (pilot)

V2 adds a **genuine image-to-3D workflow** in Manufacturer Studio → Reconstruction Studio. It is an orchestration layer using Meshy's documented multi-image AI API, **not a locally trained or self-hosted NITORIX foundation model**. No API costs are incurred until an authorised user explicitly clicks Generate.

## Activation
On the Vercel project, configure these **server-only** environment variables (never `NEXT_PUBLIC_*`):
- `MESHY_API_KEY`: a valid Meshy API key with sufficient generation credits; verify API access and commercial rights.
- `NITORIX_RECONSTRUCTION_ACCESS_KEY`: an independent cryptographically random access key of **at least 32 characters**. Enter this key in the Studio pilot interface only when generating.

Redeploy the V2 preview after configuration. With either variable missing, the service is deliberately **disabled**, no request is sent to Meshy, and the UI explains why. Never put API keys in a public GitHub repository.

The shared pilot access key is **not a replacement for manufacturer sign-in, quotas, billing, rate limiting or per-tenant access controls**. Do not deploy to untrusted public users with a shared secret or unlimited provider credits. Before production, implement authenticated accounts, quotas, request audit, explicit credit cost/confirmation and secure storage per manufacturer.

## User journey
1. Create/save a product in Studio.
2. Go to Reconstruction Studio and select the saved product.
3. Upload 1–4 photos of the **same physical object**, front first, preferably all sides. Browser resizes the uploads before the API call.
4. Optional: supply measured width/height/depth in mm for comparison later. **This pilot does not enforce those measurements during mesh generation.** A shape match and scale are not guaranteed.
5. Optional: add rights-cleared material close-up photographs to the local reference library. The UI suggests colour/tonal similarity to saved reference swatches, not semantic material identity. Select a matching approved reference to guide AI texturing. Geometric product photos and material reference images are deliberately distinct.
6. Enter the private access key and explicitly click Generate. A **paid remote Meshy task** is created. Task progress is polled through authenticated NITORIX server routes.
7. Download the result through the protected proxy and inspect the GLB in the premium PBR viewer. Check unseen sides, surfaces and measurement discrepancies.
8. Approve for the product's browser-local IndexedDB model library. The Create page loads this model by product ID. No catalogue publication, financial transaction or engineering certification occurs.

## Engineering boundaries
- Input: JPEG/PNG/WebP resized client-side. Meshy processes images and material references externally; disclose that transfer to manufacturers and obtain rights/consent.
- Provider: Meshy Multi-Image to 3D API, model `meshy-7.1` and standard geometry, 2k PBR textures, GLB-only target. Verify documentation before changing the model identifier or API.
- Model download: server-side authenticated proxy with host allowlist, request timeouts and a 30 MB stream cap. The local model validator enforces glTF 2.0 plus embedded buffers/images.
- Generated assets: may have invented hidden surfaces, inconsistent proportions, poor topology, lighting baked into textures and incorrect scale. Materials are visual approximations, **not manufacturer-certified**.
- The preview is **Customise-only** and does not unlock Assemble or Engineer. Capability evidence remains independent of the model upload.
- Photo storage: ephemeral React state. Reusable material photos in this browser's localStorage; approved models in IndexedDB. Nothing is stored in a shared manufacturer cloud catalogue yet.
- Generated jobs, model URLs and input images are not retained in a cloud database. A browser refresh loses current capture/task state. Production requires private persistent task tracking and access control.
- This release does not contain on-device LiDAR capture, self-hosted inference, 3D confidence estimation or automatic component segmentation.

## Follow-up engineering
- Add proper product-specific accounts/consent, provider expense controls and audit.
- Test photographs of furniture, textiles, reflective metal and glass; compare to measured geometry.
- Add model orientation, unit calibration and controlled 3D corrections before final sign-off.
- Replace colour-only reference retrieval with permissioned, material-semantic embeddings after enough labelled, manufacturer-approved examples are available.
- Add a self-hosted reconstruction worker based on a separately audited open-source model, with optional photogrammetry and depth/LiDAR ingest. Avoid coupling the core UI to a single vendor.
- Add batch job queue and product-family master model/variant detection; **do not** generate a separate full 3D model for every SKU.

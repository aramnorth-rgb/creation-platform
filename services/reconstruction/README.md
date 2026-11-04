# NITORIX Reconstruction GPU Worker

NITORIX has a self-hosted, model-agnostic reconstruction interface. **This repository does not contain model weights or a GPU.** Installing and running open-source models is a separate infrastructure step. Vercel hosts the web UI and server proxy, not GPU inference.

## Modes

| Studio choice | Backend | Memory-oriented configuration | Texture capability |
| --- | --- | --- | --- |
| Fast | TripoSR | `--chunk-size 2048 --mc-resolution 128` | Vertex colour geometry; lower-fidelity preview |
| Balanced | trellis.cpp | Q4 GGUF weights, `--res 512`, GPU required | PBR texture generation |
| Premium | trellis.cpp | Q8 GGUF weights, `--res 1024`, GPU required | Higher-detail PBR generation |

Actual memory depends on device, backend and chosen quantised weights. Q4 does not guarantee operation on every 8 GB GPU. Try Balanced first, then Fast if resources are insufficient. These are **separate models routed through a shared NITORIX workflow**, not a genetically merged network, custom retrained weights, or a new foundational AI.

## Installation

1. Set up a compatible GPU host and install [TripoSR](https://github.com/VAST-AI-Research/TripoSR) and/or [trellis.cpp](https://github.com/pwilkin/trellis.cpp) from their respective repositories, following their installation instructions. Review upstream notices, subdependencies and model-weight licences.
2. For TripoSR, set `TRIPOSR_ROOT` to the checked-out repository containing `run.py`. Optionally set `TRIPOSR_PYTHON` to the Python executable with its dependencies installed.
3. For trellis.cpp, set `TRELLIS_CLI` to the built `trellis-cli` executable. Point `TRELLIS_Q4` and/or `TRELLIS_Q8` to downloaded compatible model directories. Use upstream GGUF conversion instructions. Model files are not hosted by NITORIX.
4. Create a random 32+ character secret: `NITORIX_GPU_TOKEN`. Run `node services/reconstruction/worker.mjs` on the GPU machine. It binds to `127.0.0.1:8765` by default, configurable through `NITORIX_GPU_BIND` and `NITORIX_GPU_PORT`. Never expose the worker directly to the public internet.
5. On the Next.js deployment, set `NITORIX_GPU_URL` to the **private HTTPS reverse-proxied** worker base URL. Set `NITORIX_GPU_TOKEN` to the same worker secret.
6. Separately configure `NITORIX_RECONSTRUCTION_ACCESS_KEY`, a different random secret of at least 32 characters. Enter **only this second pilot key** in Manufacturer Studio. Do not use any `NEXT_PUBLIC_` prefix. Restart/redeploy after configuring server environment variables.
7. In Studio, create and save a product, open Reconstruction Studio, select Fast / Balanced / Premium, upload photos, and submit a job. Inspect the result and approve it into the browser-local product model library.

The Next.js server validates the pilot access key and calls the worker with its server-only token. This is a **pilot gate, not multi-tenant security**. Production requires manufacturer authentication, quotas, audit logs, isolated workspaces, durable job storage, GPU worker management and billing controls.

## Deliberate v1 limitations

- TripoSR and TRELLIS.2 are currently single-image inference models in this implementation. NITORIX accepts additional photographs for review but **only the first image drives generation**. No multi-view fusion, geometric consistency between views, depth integration or scale-constrained modelling is implemented.
- Material-library matching works locally using colour and tonal similarity. Reference-guided texture transfer, AI material identification and direct PBR texture conditioning are **not yet implemented** in these local backends. Selecting a reference material disables generation until product-photo mode is chosen. This prevents deceptive claims about transfer.
- Reported dimensions are measurements of generated mesh geometry, *not* accuracy-validated physical dimensions. They may be wildly different from the supplier's measurements.
- Model weights, GPU hardware, successful inference and sufficient VRAM are prerequisites. No end-to-end local GPU inference has been validated in the current repository.
- The job queue is in-memory and expires jobs after two hours. Restarts lose jobs. This is not production infrastructure.

## Licences

TripoSR code: MIT, copyright Tripo AI and Stability AI. trellis.cpp implementation: MIT, copyright Piotr Wilkin (2026). The upstream TRELLIS.2 weights and dependencies have their own terms. Preserve applicable upstream licence/copyright notices with distributed copies. NITORIX's independent code can remain proprietary, but modifying upstream MIT code **does not remove the requirement to preserve its notices**.

Do not ship model weights until their specific licence and commercial-use permissions have been reviewed.

Upstream references:
- https://github.com/VAST-AI-Research/TripoSR
- https://github.com/pwilkin/trellis.cpp
- https://github.com/microsoft/TRELLIS.2

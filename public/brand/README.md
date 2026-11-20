# Approved NITORIX logo

- `nitorix-logo.png`: original 2069 × 760 PNG from the supplied ZIP, untouched master (1,029,823 bytes). SHA-256: `07affe16a544709628bd482ceaab2af5eaf4753ab58975c2ade12c48ce7f2ac7`.
- `nitorix-logo.webp`: lossless web derivative (228,042 bytes; about 78% smaller). Crop: left 438, top 140, width 1175, height 439, with no resizing, colour conversion, quantisation or redesign. SHA-256: `f9c8b8f2fd2c46a048e414811da7d38169051477024b84edf413a73024ea84ac`.
- Crop retains the lettering, coloured border and glow with surrounding breathing room. The original opaque background is retained to protect the glow. No transparency has been fabricated.
- Generated with Sharp's `extract({ left: 438, top: 140, width: 1175, height: 439 }).webp({ lossless: true, effort: 6 })`. Decoded RGB pixels match the same region of the master exactly; the browser test verifies decoded RGBA equality as well.
- V2 displays the web derivative directly with optimisation disabled and automatic proportional height. The master is never used as an optimisation output.

## Pastel header refinement

- `nitorix-logo-pastel.webp` is a separate header-only visual refinement generated from the approved web logo: connected buttery yellow, baby pink, pale lavender and icy turquoise border sections with restrained softness. The approved PNG and original web derivative above remain untouched backups; footers and product previews still use the approved derivative.
- The generated artwork was cropped at left 78, top 126, width 1895, height 500, then downsampled proportionally to 1137 × 300 and encoded as lossless WebP. This is a visually refined derivative, not a pixel-identical recolouring of the approved master.
- The tight crop reduces external padding. Header-only proportional sizing and darken blending integrate the opaque light background with the warm header, without attempting destructive glow/background removal. The original dark lettering, four-section layout and rounded frame design are retained visually. No runtime animation or additional request library is required.

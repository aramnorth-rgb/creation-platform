"use client";

import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

/**
 * A single perspective-correct grid. Its opacity fades to zero in world space,
 * so no square boundary or false horizon can meet the CSS studio backdrop.
 */
export default function FadingWorkshopGrid() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const fades: number[] = [];
    const half = 34;

    const fadeAt = (x: number, z: number) => {
      // Full clarity near the product; disappear well before the mesh edge.
      const t = Math.max(0, Math.min(1, (Math.hypot(x, z) - 9) / 17));
      return 1 - t * t * (3 - 2 * t);
    };
    const segment = (x0: number, z0: number, x1: number, z1: number) => {
      positions.push(x0, -0.018, z0, x1, -0.018, z1);
      fades.push(fadeAt(x0, z0), fadeAt(x1, z1));
    };

    for (let axis = -half; axis <= half; axis++) {
      for (let step = -half; step < half; step++) {
        segment(axis, step, axis, step + 1);
        segment(step, axis, step + 1, axis);
      }
    }

    const grid = new BufferGeometry();
    grid.setAttribute("position", new Float32BufferAttribute(positions, 3));
    grid.setAttribute("aFade", new Float32BufferAttribute(fades, 1));
    return grid;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry} renderOrder={2}>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={`
          attribute float aFade;
          varying float vFade;
          void main() {
            vFade = aFade;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying float vFade;
          void main() {
            gl_FragColor = vec4(0.55, 0.62, 0.61, 0.42 * vFade);
          }
        `}
      />
    </lineSegments>
  );
}

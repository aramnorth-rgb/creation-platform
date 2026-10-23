"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import {
  PROMOTION_WIDTH,
  PROMOTION_HEIGHT,
  promotions,
} from "./promotion-content";
const ignoreRaycast = () => {};
function createFace(index: 0 | 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1664;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 512, 1664);
  gradient.addColorStop(0, "#400011");
  gradient.addColorStop(0.38, "#750b24");
  gradient.addColorStop(0.68, "#39000d");
  gradient.addColorStop(1, "#180008");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 1664);
  const shine = ctx.createLinearGradient(0, 0, 512, 300);
  shine.addColorStop(0, "#ffffff18");
  shine.addColorStop(0.45, "#ffffff00");
  shine.addColorStop(1, "#ffffff0b");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 512, 1664);
  // Original, locally generated artwork; no remote images or fonts.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f3c95c";
  ctx.font = "bold 19px Arial";
  ctx.fillText("N I T O R I X   /   V 5", 256, 160);
  const p = promotions[index];
  let y = 640;
  ctx.font = "900 72px Arial";
  p.lines.forEach((line, i) => {
    ctx.fillStyle = i === 2 ? "#ffdf62" : "#fffaf0";
    ctx.fillText(line, 256, y, 428);
    y += 84;
  });
  ctx.fillStyle = "#efc752";
  ctx.fillRect(206, y + 10, 100, 3);
  y += 80;
  ctx.font = "34px Arial";
  ctx.fillStyle = "#f5eee6";
  p.caption.forEach((line) => {
    ctx.fillText(line, 256, y, 414);
    y += 48;
  });
  ctx.font = "17px Arial";
  ctx.fillStyle = "#dda7ab";
  ctx.fillText("IMAGINATION  ×  POSSIBILITY", 256, 1500, 408);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}
function Plaque({
  index,
  reduced,
  detailsOpen,
}: {
  index: 0 | 1;
  reduced: boolean;
  detailsOpen: boolean;
}) {
  const root = useRef<Group>(null);
  const neon = useRef<MeshStandardMaterial>(null);
  const sparks = useRef<Mesh[]>([]);
  const { camera, viewport, size } = useThree();
  const face = useMemo(() => createFace(index), [index]);
  const geometry = useMemo(
    () =>
      new RoundedBoxGeometry(PROMOTION_WIDTH, PROMOTION_HEIGHT, 0.24, 3, 0.075),
    [],
  );
  useEffect(
    () => () => {
      face.dispose();
      geometry.dispose();
    },
    [face, geometry],
  );
  const at = viewport.getCurrentViewport(camera, new Vector3(0, 2.15, 5));
  const side = index === 0 ? -1 : 1;
  const x = side * (at.width / 2 - PROMOTION_WIDTH * 0.5 - 0.45);
  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const target = x + (index === 1 && detailsOpen ? PROMOTION_WIDTH * 2.3 : 0);
    root.current.position.x = reduced
      ? target
      : root.current.position.x +
        (target - root.current.position.x) *
          (1 - Math.exp(-Math.min(delta, 0.05) * 10));
    if (reduced) return;
    const t = clock.elapsedTime;
    if (neon.current)
      neon.current.emissiveIntensity = 1.65 + Math.sin(t * 1.7 + index) * 0.35;
    sparks.current.forEach((spark, i) => {
      const phase = (t * 0.095 + i * 0.27 + index * 0.15) % 1;
      spark.position.set(
        (i % 2 ? 1 : -1) * (PROMOTION_WIDTH / 2 + 0.035),
        -PROMOTION_HEIGHT / 2 + phase * PROMOTION_HEIGHT,
        0.18,
      );
      spark.scale.setScalar(0.6 + Math.sin(phase * Math.PI) * 0.6);
    });
  });
  if (size.width < 1000 || size.width / size.height < 1) return null;
  return (
    <group
      ref={root}
      position={[x, 2.15, 5]}
      rotation={[
        0.015,
        index === 0 ? 0.14 : -0.14,
        index === 0 ? -0.015 : 0.015,
      ]}
    >
      <mesh raycast={ignoreRaycast}>
        <primitive object={geometry} attach="geometry" />
        <meshPhysicalMaterial
          color="#47000f"
          metalness={0.85}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.13}
          envMapIntensity={1.3}
        />
      </mesh>
      <mesh raycast={ignoreRaycast} position={[0, 0, 0.127]}>
        <planeGeometry
          args={[PROMOTION_WIDTH - 0.1, PROMOTION_HEIGHT - 0.12]}
        />
        <meshPhysicalMaterial
          map={face}
          emissiveMap={face}
          emissive="#ffffff"
          emissiveIntensity={0.65}
          metalness={0.42}
          roughness={0.23}
          clearcoat={1}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            raycast={ignoreRaycast}
            position={[side * (PROMOTION_WIDTH / 2 - 0.035), 0, 0.15]}
          >
            <boxGeometry args={[0.018, PROMOTION_HEIGHT - 0.14, 0.025]} />
            <meshStandardMaterial
              ref={side === 1 ? neon : undefined}
              color="#ed001f"
              emissive="#ff102d"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          <mesh
            raycast={ignoreRaycast}
            position={[0, side * (PROMOTION_HEIGHT / 2 - 0.04), 0.15]}
          >
            <boxGeometry args={[PROMOTION_WIDTH - 0.07, 0.018, 0.025]} />
            <meshStandardMaterial
              color="#ed001f"
              emissive="#ff102d"
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh
          key={i}
          raycast={ignoreRaycast}
          ref={(node) => {
            if (node) sparks.current[i] = node;
          }}
          position={[
            (i % 2 ? 1 : -1) * (PROMOTION_WIDTH / 2 + 0.035),
            i - 1,
            0.18,
          ]}
        >
          <sphereGeometry args={[0.013, 6, 6]} />
          <meshBasicMaterial color="#ffe380" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
export function PromotionMeshes({
  reduced,
  detailsOpen,
}: {
  reduced: boolean;
  detailsOpen: boolean;
}) {
  const { size } = useThree();
  if (size.width < 1000 || size.width / size.height < 1) return null;
  return (
    <group>
      <Plaque index={0} reduced={reduced} detailsOpen={detailsOpen} />
      <Plaque index={1} reduced={reduced} detailsOpen={detailsOpen} />
    </group>
  );
}

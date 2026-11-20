"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  connections,
  deskGeometry,
  deskProduct,
  type DeskConfiguration,
  type DeskPart,
  type Slot,
} from "@/lib/configurator/desk";
function Part({ part, config }: { part: DeskPart; config: DeskConfiguration }) {
  const geometry = useMemo(
    () =>
      new RoundedBoxGeometry(
        ...(part.size.map((n) => n / 100) as [number, number, number]),
        2,
        Math.min(config.radius, ...part.size.map((n) => n * 0.3)) / 100,
      ),
    [part.size, config.radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = deskProduct.materials[config.material];
  return (
    <group
      position={part.position.map((n) => n / 100) as [number, number, number]}
      rotation={[0, part.yaw ?? 0, 0]}
    >
      <mesh rotation={part.rotation} castShadow receiveShadow>
        <primitive attach="geometry" object={geometry} />
        <meshStandardMaterial
          color={part.accent ? "#525c60" : deskProduct.colours[config.colour]}
          metalness={part.accent ? 0.6 : material.metalness}
          roughness={part.accent ? 0.4 : material.roughness}
          wireframe={config.wireframe}
        />
      </mesh>
    </group>
  );
}
export default function DeskModel({
  config,
  reduced,
  paused,
  highlightSlot,
}: {
  config: DeskConfiguration;
  reduced: boolean;
  paused?: boolean;
  highlightSlot?: Slot;
}) {
  const group = useRef<Group>(null);
  const parts = useMemo(() => deskGeometry(config), [config]);
  useFrame((_, dt) => {
    if (group.current && !reduced && !paused)
      group.current.rotation.y += Math.min(dt, 0.05) * 0.035;
  });
  return (
    <group position={[0.7, 0.02, 0]} scale={1.65}>
      <group ref={group} rotation={[0, (config.angle * Math.PI) / 180, 0]}>
        {parts.map((part) => (
          <Part key={part.id} part={part} config={config} />
        ))}
        {(config.showConnections || highlightSlot) &&
          connections(config).map((p) => (
            <mesh
              key={p.id}
              position={[p.x / 100, (config.thickness + 4) / 100, p.z / 100]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry
                args={
                  p.id === highlightSlot ? [0.15, 0.18, 24] : [0.06, 0.09, 20]
                }
              />
              <meshBasicMaterial
                color={
                  p.id === highlightSlot
                    ? "#e02653"
                    : config.modules.some((m) => m.slot === p.id)
                      ? "#c36736"
                      : "#16866c"
                }
              />
            </mesh>
          ))}
      </group>
    </group>
  );
}

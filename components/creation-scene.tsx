"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Sculpture({
  variant,
  reduced,
}: {
  variant: number;
  reduced: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current && !reduced) {
      const step = Math.min(delta, 0.05);
      group.current.rotation.y += step * 0.16;
      const scale =
        group.current.scale.x +
        (1 - group.current.scale.x) * (1 - Math.exp(-step * 7));
      group.current.scale.setScalar(scale);
    }
  });
  return (
    <group ref={group} rotation={[0.12, 0.35, -0.08]} scale={reduced ? 1 : 0.8}>
      {variant === 0 ? (
        <>
          {Array.from({ length: 18 }, (_, i) => (
            <mesh
              key={i}
              position={[0, (i - 8.5) * 0.13, 0]}
              rotation={[Math.PI / 2, 0, i * 0.025]}
            >
              <torusGeometry
                args={[
                  0.72 + Math.sin((i / 17) * Math.PI) * 0.36,
                  0.105,
                  10,
                  64,
                ]}
              />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#b58b5a" : "#d0ad7b"}
                roughness={0.48}
                metalness={0.25}
              />
            </mesh>
          ))}
          <mesh position={[0, -1.21, 0]}>
            <cylinderGeometry args={[0.69, 0.71, 0.14, 48]} />
            <meshStandardMaterial color="#493b2d" roughness={0.7} />
          </mesh>
        </>
      ) : variant === 1 ? (
        <>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.82, 0.27, 24, 64, Math.PI * 1.6]} />
            <meshStandardMaterial color="#b7b8a9" roughness={0.72} />
          </mesh>
          <mesh position={[0, -1.1, 0]}>
            <cylinderGeometry args={[0.72, 0.85, 0.16, 48]} />
            <meshStandardMaterial color="#777e70" roughness={0.9} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.48, 0]}>
            <coneGeometry args={[1.15, 1.1, 64, 1, true]} />
            <meshStandardMaterial
              color="#bd713f"
              roughness={0.45}
              metalness={0.35}
              side={2}
            />
          </mesh>
          <mesh position={[0, -0.48, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 1.5, 16]} />
            <meshStandardMaterial
              color="#bc9e62"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -1.23, 0]}>
            <cylinderGeometry args={[0.65, 0.7, 0.12, 48]} />
            <meshStandardMaterial color="#493c30" roughness={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}
export default function CreationScene({
  variant,
  reduced,
}: {
  variant: number;
  reduced: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [4, 2.3, 6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 5, 4]} intensity={4} color="#ffdfac" />
      <directionalLight
        position={[-4, 2, -2]}
        intensity={2.5}
        color="#b5caba"
      />
      <Sculpture key={variant} variant={variant} reduced={reduced} />
    </Canvas>
  );
}

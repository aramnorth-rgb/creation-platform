"use client";
import { useEffect, useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useSurfaceTexture } from "./showroom-floor";
function Trim({
  position,
  size,
  color = "#858d92",
  metal = 0.8,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  metal?: number;
}) {
  const [x, y, z] = size;
  const geometry = useMemo(
    () => new RoundedBoxGeometry(x, y, z, 2, Math.min(x, y, z) * 0.22),
    [x, y, z],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={position}>
      <primitive object={geometry} attach="geometry" />
      <meshPhysicalMaterial
        color={color}
        metalness={metal}
        roughness={0.26}
        clearcoat={0.6}
      />
    </mesh>
  );
}
/** Bespoke, recognisable coachwork detail; this remains procedural demo geometry. */
export default function HeroCoachwork() {
  const weave = useSurfaceTexture(4);
  return (
    <group>
      <Trim
        position={[1.99, 0.73, 0]}
        size={[0.045, 0.26, 1.22]}
        color="#11191d"
      />
      {Array.from({ length: 6 }, (_, i) => (
        <Trim
          key={i}
          position={[2.02, 0.64 + i * 0.032, 0]}
          size={[0.035, 0.009, 1.01]}
          color={i % 2 ? "#313c42" : "#8b9499"}
        />
      ))}
      <Trim
        position={[2.025, 0.51, 0]}
        size={[0.065, 0.085, 1.44]}
        color="#848e91"
      />
      <Trim
        position={[-1.99, 0.57, 0]}
        size={[0.07, 0.13, 1.42]}
        color="#6f777c"
      />
      {[-0.805, 0.805].map((z) => (
        <group key={z}>
          <Trim
            position={[-0.35, 1.55, z]}
            size={[1.69, 0.65, 0.014]}
            color="#111a1e"
            metal={0.25}
          />
          <mesh position={[-0.35, 1.55, z * 1.015]}>
            <boxGeometry args={[1.57, 0.53, 0.013]} />
            <meshPhysicalMaterial
              color="#182b34"
              metalness={0.42}
              roughness={0.075}
              clearcoat={1}
              clearcoatRoughness={0.04}
            />
          </mesh>
          <Trim
            position={[1.35, 1.56, z * 1.015]}
            size={[0.7, 0.68, 0.014]}
            color="#10191e"
            metal={0.3}
          />
          <mesh position={[1.35, 1.56, z * 1.03]}>
            <boxGeometry args={[0.6, 0.57, 0.015]} />
            <meshPhysicalMaterial
              color="#1c303b"
              metalness={0.45}
              roughness={0.08}
              clearcoat={1}
            />
          </mesh>
          <Trim
            position={[-0.32, 0.79, z]}
            size={[2.9, 0.12, 0.025]}
            color="#343b40"
          />
          <mesh position={[-0.3, 0.81, z * 1.02]}>
            <boxGeometry args={[2.72, 0.07, 0.009]} />
            <meshStandardMaterial
              color="#283036"
              metalness={0.55}
              roughness={0.4}
              bumpMap={weave}
              bumpScale={0.003}
            />
          </mesh>
          <Trim
            position={[0.69, 1.1, z * 1.03]}
            size={[0.012, 0.94, 0.016]}
            color="#6b7478"
          />
          <Trim
            position={[0.87, 1.12, z * 1.05]}
            size={[0.15, 0.045, 0.025]}
            color="#bdc4c5"
          />
          <Trim
            position={[-1.6, 1.12, z * 1.02]}
            size={[0.27, 0.16, 0.017]}
            color="#434c50"
          />
          {[-1.22, 1.25].map((x) => (
            <mesh key={x} position={[x, 0.36, z * 1.035]}>
              <torusGeometry args={[0.405, 0.034, 8, 32, Math.PI]} />
              <meshPhysicalMaterial
                color="#363e43"
                metalness={0.7}
                roughness={0.27}
                clearcoat={0.65}
              />
            </mesh>
          ))}
          <mesh position={[-1.98, 1.05, z * 0.82]}>
            <boxGeometry args={[0.03, 0.22, 0.095]} />
            <meshStandardMaterial
              color="#760f1e"
              emissive="#d52638"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[1.984, 1.51, 0]}>
        <boxGeometry args={[0.025, 0.77, 1.39]} />
        <meshPhysicalMaterial
          color="#172b35"
          metalness={0.4}
          roughness={0.065}
          clearcoat={1}
        />
      </mesh>
      <Trim
        position={[1.99, 1.1, 0]}
        size={[0.035, 0.03, 1.32]}
        color="#0e171b"
      />
      <Trim
        position={[2.015, 0.95, 0]}
        size={[0.035, 0.026, 1.13]}
        color="#b6bdc0"
      />
      <Trim
        position={[0.95, 2.18, 0]}
        size={[0.57, 0.095, 0.55]}
        color="#4e5a62"
      />
      <Trim
        position={[-1.55, 2.15, 0]}
        size={[0.3, 0.05, 0.85]}
        color="#bbc1bf"
      />
    </group>
  );
}

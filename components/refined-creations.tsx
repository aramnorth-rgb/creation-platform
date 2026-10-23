"use client";
import { useEffect, useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
function Solid({
  position,
  size,
  color,
  metal = 0.5,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metal?: number;
  rotation?: [number, number, number];
}) {
  const [x, y, z] = size;
  const geometry = useMemo(
    () => new RoundedBoxGeometry(x, y, z, 2, Math.min(x, y, z) * 0.18),
    [x, y, z],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={position} rotation={rotation}>
      <primitive attach="geometry" object={geometry} />
      <meshPhysicalMaterial
        color={color}
        metalness={metal}
        roughness={0.28}
        clearcoat={0.55}
      />
    </mesh>
  );
}
export function RefinedRing() {
  return (
    <group position={[0, 0.94, 0]}>
      <mesh>
        <torusGeometry args={[0.76, 0.11, 16, 64]} />
        <meshPhysicalMaterial
          color="#d6b66e"
          metalness={1}
          roughness={0.14}
          clearcoat={1}
        />
      </mesh>
      {[-0.065, 0.065].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <torusGeometry args={[0.78, 0.018, 8, 64]} />
          <meshStandardMaterial color="#ead29a" metalness={1} roughness={0.2} />
        </mesh>
      ))}
      <group position={[0, 0.83, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.37, 0.2, 12, 1]} />
          <meshPhysicalMaterial
            color="#ebf9ff"
            roughness={0.025}
            metalness={0.05}
            clearcoat={1}
            ior={2.42}
          />
        </mesh>
        <mesh position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.37, 0.3, 12, 1]} />
          <meshPhysicalMaterial
            color="#d7e9ed"
            roughness={0.035}
            metalness={0.2}
            clearcoat={1}
          />
        </mesh>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Solid
              key={`${x}${z}`}
              position={[x * 0.25, -0.04, z * 0.2]}
              size={[0.035, 0.3, 0.035]}
              color="#d6b46b"
              metal={1}
            />
          )),
        )}
      </group>
      {[-0.31, 0.31].map((x) => (
        <mesh key={x} position={[x, 0.68, 0.02]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshPhysicalMaterial
            color="#e8f5f8"
            metalness={0.15}
            roughness={0.08}
            clearcoat={1}
          />
        </mesh>
      ))}
    </group>
  );
}
export function RefinedPavilion() {
  return (
    <group>
      <Solid
        position={[0, 0.07, 0]}
        size={[3.25, 0.14, 2.25]}
        color="#68706f"
        metal={0.2}
      />
      {Array.from({ length: 15 }, (_, i) => (
        <Solid
          key={i}
          position={[-1.42 + i * 0.2, 0.16, 0]}
          size={[0.18, 0.035, 1.98]}
          color={i % 2 ? "#a38c6b" : "#907957"}
          metal={0}
        />
      ))}
      {[-1.4, 1.4].flatMap((x) =>
        [-0.9, 0.9].map((z) => (
          <Solid
            key={`${x}${z}`}
            position={[x, 0.97, z]}
            size={[0.075, 1.6, 0.075]}
            color="#ae9571"
            metal={0}
          />
        )),
      )}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            position={[0, 1.93, side * 0.51]}
            rotation={[side * 0.5, 0, 0]}
            size={[3.34, 0.075, 1.24]}
            color="#665e51"
            metal={0.55}
          />
          <Solid
            position={[0, 1.72, side * 0.96]}
            size={[3.33, 0.055, 0.055]}
            color="#9b8870"
          />
          <mesh position={[0, 0.95, side * 0.86]}>
            <boxGeometry args={[2.7, 1.45, 0.018]} />
            <meshPhysicalMaterial
              color="#a7bcbf"
              transparent
              opacity={0.2}
              roughness={0.34}
              metalness={0.1}
              clearcoat={0.6}
            />
          </mesh>
        </group>
      ))}
      <Solid
        position={[0, 2.25, 0]}
        size={[3.36, 0.055, 0.07]}
        color="#a49b88"
      />
      <Solid
        position={[-1.4, 1.72, 0]}
        size={[0.06, 0.06, 1.8]}
        color="#b49a74"
        metal={0}
      />
      <Solid
        position={[1.4, 1.72, 0]}
        size={[0.06, 0.06, 1.8]}
        color="#b49a74"
        metal={0}
      />
    </group>
  );
}
export function RefinedWatch() {
  return (
    <group position={[0, 1.55, 0]} rotation={[-0.12, 0.08, -0.12]}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            position={[0, side * 1.04, 0]}
            size={[0.57, 0.95, 0.13]}
            color="#7b604d"
            metal={0}
          />
          {Array.from({ length: 6 }, (_, i) => (
            <Solid
              key={i}
              position={[0, side * (0.74 + i * 0.12), 0.071]}
              size={[0.51, 0.01, 0.008]}
              color="#493e35"
              metal={0}
            />
          ))}
        </group>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.64, 0.64, 0.19, 48]} />
        <meshPhysicalMaterial
          color="#aeb6b7"
          metalness={0.9}
          roughness={0.21}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0, 0.105]}>
        <circleGeometry args={[0.56, 48]} />
        <meshStandardMaterial
          color="#e8e4d3"
          metalness={0.12}
          roughness={0.47}
        />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <torusGeometry args={[0.585, 0.027, 8, 48]} />
        <meshPhysicalMaterial
          color="#d5c6a1"
          metalness={0.9}
          roughness={0.22}
        />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <Solid
            key={i}
            position={[Math.sin(a) * 0.46, Math.cos(a) * 0.46, 0.12]}
            rotation={[0, 0, -a]}
            size={[0.018, 0.07, 0.008]}
            color="#263b3d"
          />
        );
      })}
      <Solid
        position={[-0.11, 0.12, 0.14]}
        rotation={[0, 0, 0.73]}
        size={[0.025, 0.35, 0.015]}
        color="#233d42"
      />
      <Solid
        position={[0.12, 0.15, 0.15]}
        rotation={[0, 0, -0.65]}
        size={[0.018, 0.43, 0.012]}
        color="#9d723d"
      />
      <mesh position={[0, 0, 0.16]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color="#aa8950" metalness={1} />
      </mesh>
      <mesh position={[0.67, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 0.13, 16]} />
        <meshStandardMaterial
          color="#adb7b5"
          metalness={0.85}
          roughness={0.24}
        />
      </mesh>
    </group>
  );
}

"use client";
import { useEffect, useMemo } from "react";
import {
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
  UnsignedByteType,
} from "three";

/** Original low-resolution carbon weave / machining grain, generated locally. */
export function useSurfaceTexture(repeat = 24) {
  const texture = useMemo(() => {
    const width = 64,
      data = new Uint8Array(width * width * 4);
    for (let y = 0; y < width; y++)
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const warp = ((x >> 3) + (y >> 3)) % 2;
        const stripe = warp ? (x % 8) / 7 : (y % 8) / 7;
        const grain = ((x * 13 + y * 7) % 11) / 11;
        const value = Math.round(90 + stripe * 65 + grain * 12);
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = 255;
      }
    const t = new DataTexture(data, width, width, RGBAFormat, UnsignedByteType);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.needsUpdate = true;
    return t;
  }, [repeat]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
export default function ShowroomFloor() {
  const texture = useSurfaceTexture();
  return (
    <group>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[20, 112]} />
        <meshPhysicalMaterial
          color="#101215"
          metalness={0.55}
          roughness={0.36}
          roughnessMap={texture}
          bumpMap={texture}
          bumpScale={0.006}
          clearcoat={0.65}
          clearcoatRoughness={0.25}
          envMapIntensity={0.22}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.014, 0]}>
        <ringGeometry args={[17.8, 17.86, 112]} />
        <meshStandardMaterial
          color="#5b0715"
          emissive="#ef1433"
          emissiveIntensity={0.65}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.016, 0]}>
        <ringGeometry args={[18.02, 18.18, 112]} />
        <meshStandardMaterial
          color="#485056"
          metalness={0.9}
          roughness={0.32}
          envMapIntensity={0.55}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.013, 0]}>
        <ringGeometry args={[19.9, 19.94, 112]} />
        <meshStandardMaterial
          color="#6b1522"
          emissive="#e02d42"
          emissiveIntensity={0.32}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 18.1, -0.009, Math.cos(a) * 18.1]}
            rotation={[-Math.PI / 2, 0, -a]}
          >
            <planeGeometry args={[0.025, 0.22]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#c7a456" : "#62676c"} />
          </mesh>
        );
      })}
    </group>
  );
}

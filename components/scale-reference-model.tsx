"use client";

import { useMemo, useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import type { DeskConfiguration } from "@/lib/configurator/desk";
import {
  MM_TO_WORLD,
  personHeightCm,
  type ScaleReferenceKind,
} from "@/lib/configurator/scale-reference";

function BodyPart({
  position, size, colour = "#929ca5",
}: {
  position: [number, number, number];
  size: [number, number, number];
  colour?: string;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={colour} roughness={0.8} />
    </mesh>
  );
}

/**
 * CC0 anatomical human mesh (original Quaternius, posed by UMRAM Bilkent).
 * Source/licence: github.com/UMRAM-Bilkent/supine-human-model (CC0-1.0).
 * The model is centred at origin and 5.54 local units tall.
 */
function Person({ heightCm }: { heightCm: number }) {
  const [figure, setFigure] = useState<Object3D | null>(null);
  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();
    loader.load("/models/cc0-human-posed.glb", (gltf) => {
      if (!active) return;
      const figure = gltf.scene.clone(true);
      figure.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = new MeshStandardMaterial({
            color: "#f6f7f5",
            roughness: 0.86,
            metalness: 0,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setFigure(figure);
    });
    return () => { active = false; };
  }, []);
  const height = personHeightCm(heightCm) * 10;
  const factor = height / 5.54;
  if (!figure) return null;
  return (
    <group position={[0, height / 2, 0]} scale={factor}>
      <primitive object={figure} />
    </group>
  );
}

/**
 * Soft white anatomical proxy, kept at a measured 180 mm overall length.
 * This needs a proper licensed photogrammetry/scan asset before release.
 */
function Hand() {
  const fingers = [
    { x: -52, height: 61, width: 15, z: -1 },
    { x: -22, height: 77, width: 15, z: 3 },
    { x: 9, height: 85, width: 14, z: 4 },
    { x: 38, height: 69, width: 13, z: -1 },
  ];
  const ivory = "#eff0ed";
  return (
    <group>
      <mesh position={[0, 50, 0]} scale={[67, 54, 19]} castShadow>
        <sphereGeometry args={[1, 32, 22]} />
        <meshStandardMaterial color={ivory} roughness={0.85} />
      </mesh>
      {fingers.map((finger) => (
        <group key={finger.x} position={[finger.x, 94, finger.z]}>
          <mesh position={[0, finger.height / 2, 0]} castShadow>
            <capsuleGeometry args={[finger.width, Math.max(1, finger.height - finger.width * 2), 10, 16]} />
            <meshStandardMaterial color={ivory} roughness={0.84} />
          </mesh>
          <mesh position={[0, 3, 0]} scale={[finger.width * 1.15, 14, finger.width]} castShadow>
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color={ivory} roughness={0.86} />
          </mesh>
        </group>
      ))}
      <mesh position={[-72, 67, 12]} rotation={[0, 0, 0.66]} castShadow>
        <capsuleGeometry args={[20, 54, 12, 20]} />
        <meshStandardMaterial color={ivory} roughness={0.85} />
      </mesh>
      <mesh position={[-1, 7, 0]} scale={[50, 21, 18]} castShadow>
        <sphereGeometry args={[1, 22, 16]} />
        <meshStandardMaterial color={ivory} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Ruler() {
  // One metre, 10 mm divisions, 100 mm major lines on an aluminium surface.
  return (
    <group>
      <BodyPart position={[0, 500, 0]} size={[54, 1000, 7]} colour="#cbd0cf" />
      <BodyPart position={[-25, 500, 5]} size={[4, 1000, 4]} colour="#8f9695" />
      {Array.from({ length: 101 }, (_, i) => (
        <mesh key={i} position={[i % 10 === 0 ? 9 : i % 5 === 0 ? 15 : 21, i * 10, 4.2]}>
          <boxGeometry args={[i % 10 === 0 ? 35 : i % 5 === 0 ? 23 : 12, 1.6, 1]} />
          <meshStandardMaterial color="#343839" roughness={0.74} />
        </mesh>
      ))}
      <BodyPart position={[0, 1000, 0]} size={[55, 5, 9]} colour="#a8ada9" />
    </group>
  );
}

function Banana() {
  const curve = useMemo(() =>
    new CatmullRomCurve3([
      new Vector3(-89, 55, 0),
      new Vector3(-63, 80, 0),
      new Vector3(-19, 85, 0),
      new Vector3(25, 68, 0),
      new Vector3(66, 55, 0),
      new Vector3(89, 73, 0),
    ]), []);
  const geometry = useMemo(() => new TubeGeometry(curve, 48, 19, 12, false), [curve]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const spots = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const t = (i * 0.61803398875) % 1;
    const a = i * 2.3999632297;
    const p = curve.getPoint(t);
    return {
      position: [p.x, p.y + Math.sin(a) * 16, Math.cos(a) * 16] as [number, number, number],
      radius: 0.6 + (i % 5) * 0.43,
    };
  }), [curve]);
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#e9c95c" roughness={0.71} metalness={0} />
      </mesh>
      {spots.map((spot, i) => (
        <mesh key={i} position={spot.position}>
          <sphereGeometry args={[spot.radius, 6, 6]} />
          <meshStandardMaterial color={i % 4 === 0 ? "#9d8537" : "#c6aa4c"} roughness={0.86} />
        </mesh>
      ))}
      <BodyPart position={[-91, 55, 0]} size={[8, 10, 8]} colour="#564c32" />
      <BodyPart position={[92, 74, 0]} size={[10, 17, 8]} colour="#695b37" />
    </group>
  );
}

export function ScaleReference({
  kind, personHeight, desk,
}: {
  kind: ScaleReferenceKind;
  personHeight: number;
  desk: DeskConfiguration;
}) {
  if (kind === "none") return null;
  // Align reference bottoms with the desk's floor in the same 3D coordinate system.
  const x = 0.7 + (desk.width / 200) * 1.65 + (kind === "person" ? 5.4 : 2.0);
  return (
    <group
      name="Size comparison reference"
      position={[x, 0, 0]}
      scale={MM_TO_WORLD}
    >
      {kind === "person" && <Person heightCm={personHeight} />}
      {kind === "hand" && <Hand />}
      {kind === "ruler" && <Ruler />}
      {kind === "banana" && <Banana />}
    </group>
  );
}

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

function Hand() {
  // 18 cm illustrated adult hand, palm and raised fingers.
  const fingers = [
    { x: -55, height: 62 }, { x: -25, height: 77 },
    { x: 6, height: 84 }, { x: 36, height: 72 },
  ];
  return (
    <group>
      <BodyPart position={[0, 47.5, 0]} size={[128, 95, 30]} colour="#cba99c" />
      {fingers.map((f) => (
        <mesh key={f.x} position={[f.x, 95 + f.height / 2, 0]}>
          <capsuleGeometry args={[13, Math.max(1, f.height - 26), 6, 10]} />
          <meshStandardMaterial color="#cba99c" />
        </mesh>
      ))}
      <mesh position={[-79, 80, 0]} rotation={[0, 0, 0.55]}>
        <capsuleGeometry args={[17, 63, 6, 10]} />
        <meshStandardMaterial color="#cba99c" />
      </mesh>
    </group>
  );
}

function Ruler() {
  // One metre, with decimetre markings in true positions.
  return (
    <group>
      <BodyPart position={[0, 500, 0]} size={[65, 1000, 18]} colour="#e4c997" />
      {Array.from({ length: 11 }, (_, i) => (
        <BodyPart
          key={i}
          position={[i % 5 === 0 ? 13 : 21, i * 100 + 1, 11]}
          size={[i % 5 === 0 ? 33 : 17, 4, 2]}
          colour="#4a4a43"
        />
      ))}
    </group>
  );
}

function Banana() {
  const curve = useMemo(() =>
    new CatmullRomCurve3([
      new Vector3(-86, 60, 0),
      new Vector3(-45, 72, 0),
      new Vector3(0, 58, 0),
      new Vector3(45, 78, 0),
      new Vector3(86, 116, 0),
    ]), []);
  const geometry = useMemo(() => new TubeGeometry(curve, 32, 19, 9, false), [curve]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#e3ca55" roughness={0.73} />
      </mesh>
      <BodyPart position={[-88, 60, 0]} size={[17, 17, 17]} colour="#716239" />
      <BodyPart position={[90, 117, 0]} size={[15, 22, 15]} colour="#716239" />
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

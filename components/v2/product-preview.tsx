"use client";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import DeskModel from "../desk-model";
import GalleryLighting from "../gallery-lighting";
import type { DeskConfiguration } from "@/lib/configurator/desk";
function Camera() {
  useFrame(({ gl }) => {
    gl.domElement.dataset.sceneReady = "true";
  });
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const { camera, invalidate } = get();
    const factor = Math.max(1, 1.35 / (size.width / size.height));
    camera.position.set(5 * factor, 4.8 * factor, 7 * factor);
    camera.lookAt(0.5, 0.2, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, size.width, size.height]);
  return null;
}
export default function ProductPreview({
  config,
}: {
  config: DeskConfiguration;
}) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      shadows="soft"
      frameloop="demand"
      camera={{ position: [5, 4.8, 7], fov: 36 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <Camera />
      <GalleryLighting intensity={0.5} />
      <ambientLight intensity={0.3} />
      <spotLight
        position={[-3, 6, 5]}
        intensity={85}
        angle={0.6}
        penumbra={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-normalBias={0.012}
      />
      <directionalLight position={[4, 3, -3]} intensity={1.3} />
      <DeskModel config={config} reduced paused />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.03, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e7e2d8" roughness={0.95} />
      </mesh>
    </Canvas>
  );
}

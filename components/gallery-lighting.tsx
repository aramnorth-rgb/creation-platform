"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Local studio reflections; no HDR download. Restores the prior environment on exit. */
export default function GalleryLighting({
  intensity: level = 0.18,
}: {
  intensity?: number;
}) {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const { gl, scene, invalidate } = get();
    const previous = scene.environment,
      intensity = scene.environmentIntensity;
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = level;
    invalidate();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = intensity;
      target.dispose();
      room.dispose();
      generator.dispose();
      invalidate();
    };
  }, [get, level]);
  return null;
}

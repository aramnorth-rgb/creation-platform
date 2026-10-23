"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Group } from "three";
import { defaults, type Configuration } from "./exhibition-data";

function Box({
  position,
  size,
  color,
  metal = 0.2,
  wire = false,
  rough = 0.5,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metal?: number;
  wire?: boolean;
  rough?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={rough}
        wireframe={wire}
      />
    </mesh>
  );
}
function Wheel({
  x,
  z,
  radius = 0.36,
}: {
  x: number;
  z: number;
  radius?: number;
}) {
  return (
    <group position={[x, radius, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.21, 24]} />
        <meshStandardMaterial color="#14191a" roughness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.56, radius * 0.56, 0.23, 16]} />
        <meshStandardMaterial
          color="#a7aca8"
          metalness={0.8}
          roughness={0.28}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, 0.24, 12]} />
        <meshStandardMaterial color="#22282c" />
      </mesh>
    </group>
  );
}
function CoachBody({ config: c }: { config: Configuration }) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(3.9, 1.55, 1.55, 3, 0.12),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={[0, 1.28, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={c.color}
        wireframe={c.wireframe}
        metalness={0.45}
        roughness={c.finish === "polished" ? 0.17 : 0.55}
      />
    </mesh>
  );
}
function Motorhome({ config: c }: { config: Configuration }) {
  const lift = (c.clearance - 240) / 1000;
  return (
    <group scale={[c.length / 6.8, 1, 1]}>
      <group position={[0, lift, 0]}>
        <CoachBody config={c} />
        <Box
          position={[0, 0.63, 0]}
          size={[4.04, 0.23, 1.61]}
          color="#414c4b"
        />
        <Box
          position={[0.05, 2.09, 0]}
          size={[3.65, 0.13, 1.5]}
          color={c.color}
          wire={c.wireframe}
        />
        <Box
          position={[1.97, 1.51, 0]}
          size={[0.035, 0.75, 1.37]}
          color="#172e36"
          metal={0.7}
          rough={0.15}
        />
        {[-0.79, 0.79].map((z) => (
          <group key={z}>
            <Box
              position={[1.35, 1.56, z]}
              size={[0.66, 0.64, 0.025]}
              color="#1d3740"
              metal={0.6}
              rough={0.14}
            />
            <Box
              position={[-0.35, 1.55, z]}
              size={[1.6, 0.55, 0.025]}
              color="#1d3740"
              metal={0.7}
              rough={0.14}
            />
            <Box
              position={[0.7, 1.1, z]}
              size={[0.02, 1.04, 0.03]}
              color="#73817e"
            />
            <Box
              position={[0.89, 1.1, z * 1.02]}
              size={[0.13, 0.035, 0.03]}
              color="#b9b8aa"
            />
            <Box
              position={[-0.45, 0.94, z * 1.01]}
              size={[2.6, 0.035, 0.025]}
              color="#a18c62"
            />
          </group>
        ))}
        {[-0.58, 0.58].map((z) => (
          <group key={z}>
            <Box
              position={[2.03, 0.9, z]}
              size={[0.045, 0.1, 0.28]}
              color="#f6e7b5"
            />
            <Box
              position={[-2.0, 0.9, z]}
              size={[0.035, 0.19, 0.15]}
              color="#b84832"
            />
          </group>
        ))}
        <Box
          position={[2.01, 0.68, 0]}
          size={[0.07, 0.08, 0.75]}
          color="#161d20"
        />
        {c.solar &&
          [-0.8, 0.25].map((x) => (
            <group key={x}>
              <Box
                position={[x, 2.19, 0]}
                size={[0.91, 0.055, 1.19]}
                color="#182e49"
                metal={0.7}
              />
              {[-0.35, 0, 0.35].map((z) => (
                <Box
                  key={z}
                  position={[x, 2.222, z]}
                  size={[0.85, 0.008, 0.012]}
                  color="#5d7e96"
                />
              ))}
            </group>
          ))}
        {c.awning && (
          <group>
            <Box
              position={[-0.1, 1.99, 1.35]}
              size={[2.8, 0.06, 1.2]}
              color="#c2b28a"
            />
            <Box
              position={[-1.4, 1.05, 1.91]}
              size={[0.035, 1.9, 0.035]}
              color="#8b9290"
            />
            <Box
              position={[1.2, 1.05, 1.91]}
              size={[0.035, 1.9, 0.035]}
              color="#8b9290"
            />
          </group>
        )}
        {c.storage && (
          <Box
            position={[-2.16, 1.03, 0]}
            size={[0.4, 0.72, 1.15]}
            color="#47544e"
            wire={c.wireframe}
          />
        )}
      </group>
      {[-1.22, 1.25].flatMap((x) =>
        [-0.8, 0.8].map((z) => (
          <Wheel key={`${x}${z}`} x={x} z={z} radius={c.wheelSize / 55} />
        )),
      )}
    </group>
  );
}
function Product({ index, config }: { index: number; config: Configuration }) {
  if (index === 0) return <Motorhome config={config} />;
  if (index === 1)
    return (
      <group scale={1.2}>
        <Wheel x={-0.85} z={0} radius={0.3} />
        <Wheel x={0.95} z={0} radius={0.3} />
        <Box
          position={[-0.05, 0.42, 0]}
          size={[1.65, 0.13, 0.42]}
          color="#879b8c"
        />
        <group rotation={[0, 0, 0.17]}>
          <Box
            position={[0.92, 1.1, 0]}
            size={[0.1, 1.5, 0.12]}
            color="#a1b1a4"
          />
          <Box
            position={[0.98, 1.85, 0]}
            size={[0.14, 0.09, 0.85]}
            color="#3a4641"
          />
        </group>
        <Box
          position={[-0.5, 0.9, 0]}
          size={[0.07, 0.9, 0.08]}
          color="#56605a"
        />
        <Box
          position={[-0.5, 1.37, 0]}
          size={[0.65, 0.13, 0.4]}
          color="#323d35"
        />
      </group>
    );
  if (index === 2)
    return (
      <group scale={1.35}>
        {[-0.42, 0.42].flatMap((x) =>
          [-0.43, 0.43].map((z) => (
            <Box
              key={`${x}${z}`}
              position={[x, 0.45, z]}
              size={[0.06, 0.9, 0.06]}
              color="#9fa6a3"
            />
          )),
        )}
        <Box
          position={[0, 0.94, 0]}
          size={[1.12, 0.12, 1.12]}
          color="#ae8660"
        />
        <Box
          position={[-0.49, 1.44, 0]}
          size={[0.12, 0.92, 1.12]}
          color="#b89068"
        />
      </group>
    );
  return (
    <group>
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[0.7, 0.07, 12, 48]} />
        <meshStandardMaterial
          color="#c6ad79"
          metalness={0.75}
          roughness={0.28}
          emissive="#e7cc8c"
          emissiveIntensity={0.18}
        />
      </mesh>
      <Box position={[0, 0.7, 0]} size={[0.035, 1.4, 0.035]} color="#c6ad79" />
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.52, 0.56, 0.12, 40]} />
        <meshStandardMaterial
          color="#756648"
          metalness={0.65}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
function Exhibit({
  index,
  selected,
  reduced,
  workspace,
  config,
}: {
  index: number;
  selected: number;
  reduced: boolean;
  workspace: boolean;
  config: Configuration;
}) {
  const root = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const active = index === selected;
  const slot = (index - selected + 4) % 4;
  const target: [number, number, number] = workspace
    ? [0, 0, 0]
    : active
      ? [0, 0, 0]
      : slot === 1
        ? [-5, 0, 1]
        : slot === 2
          ? [-5.6, 0, -3.3]
          : [3.5, 0, -3.5];
  const { viewport } = useThree();
  const responsiveScale = viewport.aspect < 1 ? 0.66 : 1;
  useFrame((_, delta) => {
    if (!root.current || !turn.current) return;
    const step = Math.min(delta, 0.05);
    const t = 1 - Math.exp(-step * 9);
    root.current.position.x += (target[0] - root.current.position.x) * t;
    root.current.position.z += (target[2] - root.current.position.z) * t;
    const desired = (active ? 1.4 : 0.7) * responsiveScale;
    root.current.scale.setScalar(
      root.current.scale.x + (desired - root.current.scale.x) * t,
    );
    if (active && !reduced)
      turn.current.rotation.y += step * (workspace ? 0.035 : 0.045);
  });
  return (
    <group
      ref={root}
      position={reduced ? target : undefined}
      scale={reduced ? (active ? 1.4 : 0.7) * responsiveScale : undefined}
      visible={!workspace || index === 0}
    >
      <group ref={turn} rotation={[0, -0.25, 0]}>
        <Product index={index} config={config} />
      </group>
    </group>
  );
}
export default function CreationScene({
  selected,
  reduced,
  workspace,
  workshop,
  config,
}: {
  selected: number;
  reduced: boolean;
  workspace: boolean;
  workshop: boolean;
  config: Configuration;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [6.6, 3.8, 8.8], fov: 39 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={workspace ? 2 : 0.22} />
      <spotLight
        position={[1, 7, 3]}
        angle={0.47}
        penumbra={0.75}
        intensity={170}
        distance={18}
        color="#fff2d3"
      />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={workspace ? 3 : 1.4}
        color={workspace ? "#ffffff" : "#6f879d"}
      />
      <directionalLight position={[4, 3, 1]} intensity={workspace ? 2 : 0.5} />
      {[0, 1, 2, 3].map((index) => (
        <Exhibit
          key={index}
          index={index}
          selected={workspace ? 0 : selected}
          reduced={reduced}
          workspace={workspace}
          config={workspace ? config : defaults}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        {workspace ? (
          <planeGeometry args={[200, 200]} />
        ) : (
          <circleGeometry args={[4.4, 64]} />
        )}
        <meshStandardMaterial
          color={workspace ? "#f0f1ed" : "#080b0d"}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]}>
        <planeGeometry args={[7, 4]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }"
          fragmentShader="varying vec2 vUv; void main(){ float a=1.0-smoothstep(0.05,0.5,length(vUv-0.5)); gl_FragColor=vec4(0.0,0.0,0.0,a*0.45); }"
        />
      </mesh>
      {workspace && workshop && (
        <gridHelper
          args={[24, 24, "#a7a89e", "#c9ccc4"]}
          position={[0, -0.02, 0]}
        />
      )}
    </Canvas>
  );
}

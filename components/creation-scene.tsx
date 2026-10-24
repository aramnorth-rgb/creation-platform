"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Group } from "three";
import GalleryProduct from "./gallery-models";
import GalleryLighting from "./gallery-lighting";
import DeskModel from "./desk-model";
import type { DeskConfiguration } from "@/lib/configurator/desk";
import ShowroomFloor from "./showroom-floor";
import { PromotionMeshes } from "./promotion-panels";
import { creations, defaults, type Configuration } from "./exhibition-data";

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
  if (index >= 4) return <OtherProduct index={index} />;
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
function OtherProduct({ index }: { index: number }) {
  if (index === 4)
    return (
      <group>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.75, 0.9, 0.2, 24]} />
          <meshStandardMaterial color="#697783" metalness={0.6} />
        </mesh>
        <Box position={[0, 0.7, 0]} size={[0.48, 1.2, 0.48]} color="#d6dbd5" />
        <group position={[0, 1.2, 0]} rotation={[0, 0, -0.6]}>
          <Box
            position={[0, 0.48, 0]}
            size={[0.35, 1.15, 0.35]}
            color="#dbded5"
          />
          <mesh>
            <sphereGeometry args={[0.3, 16, 12]} />
            <meshStandardMaterial color="#d9a76c" metalness={0.5} />
          </mesh>
          <group position={[0, 1, 0]} rotation={[0, 0, -0.75]}>
            <Box
              position={[0, 0.4, 0]}
              size={[0.25, 0.85, 0.25]}
              color="#a8b6b3"
            />
            <Box
              position={[-0.18, 0.9, 0]}
              size={[0.12, 0.4, 0.12]}
              color="#b0b9b3"
            />
            <Box
              position={[0.18, 0.9, 0]}
              size={[0.12, 0.4, 0.12]}
              color="#b0b9b3"
            />
          </group>
        </group>
      </group>
    );
  if (index === 5)
    return (
      <group position={[0, 1, 0]}>
        <mesh>
          <torusGeometry args={[0.72, 0.12, 12, 48]} />
          <meshStandardMaterial
            color="#d7b36c"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.85, 0]} rotation={[0, 0.6, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#bce1e5"
            metalness={0.4}
            roughness={0.1}
          />
        </mesh>
      </group>
    );
  if (index === 6)
    return (
      <group>
        <Box position={[0, 0.09, 0]} size={[3.2, 0.18, 2.2]} color="#a1a396" />
        {[-1.35, 0, 1.35].map((x) => (
          <group key={x}>
            <Box
              position={[x, 1, -0.85]}
              size={[0.09, 1.8, 0.09]}
              color="#b5936d"
            />
            <Box
              position={[x, 1, 0.85]}
              size={[0.09, 1.8, 0.09]}
              color="#b5936d"
            />
            <mesh position={[x, 2.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.18, 1.18, 0.08, 3]} />
              <meshStandardMaterial color="#bc9a72" />
            </mesh>
          </group>
        ))}
      </group>
    );
  if (index === 7)
    return (
      <group rotation={[0, 0, -0.2]}>
        <Box
          position={[-0.2, 1.55, 0]}
          size={[1.65, 0.65, 0.65]}
          color="#b3aa69"
        />
        <Box position={[0, 0.8, 0]} size={[0.42, 1.1, 0.48]} color="#6c756b" />
        <Box position={[0, 0.25, 0]} size={[0.8, 0.35, 0.75]} color="#303b39" />
        <mesh position={[0.85, 1.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.22, 0.55, 20]} />
          <meshStandardMaterial color="#aab7b6" metalness={0.8} />
        </mesh>
        <Box
          position={[1.3, 1.55, 0]}
          size={[0.55, 0.06, 0.06]}
          color="#c2c8c4"
        />
      </group>
    );
  if (index === 8)
    return (
      <group rotation={[-0.35, 0, 0.15]} position={[0, 1.2, 0]}>
        <Box
          position={[0, -0.95, 0]}
          size={[0.65, 1.3, 0.12]}
          color="#977a5d"
        />
        <Box position={[0, 0.95, 0]} size={[0.65, 1.3, 0.12]} color="#977a5d" />
        <mesh>
          <cylinderGeometry args={[0.68, 0.68, 0.24, 40]} />
          <meshStandardMaterial color="#c2c3b5" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.56, 40]} />
          <meshStandardMaterial color="#f0e8cb" />
        </mesh>
        <Box
          position={[0, 0.16, 0.18]}
          size={[0.035, 0.03, 0.4]}
          color="#313d3a"
        />
      </group>
    );
  if (index === 9)
    return (
      <group position={[0, 1.15, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 20, 12]} />
          <meshStandardMaterial color="#b5b4a9" metalness={0.4} />
        </mesh>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <group key={`${x}${z}`}>
              <Box
                position={[x * 0.48, 0, z * 0.48]}
                size={[1.2, 0.09, 0.1]}
                color="#6f827c"
              />
              <mesh
                position={[x * 0.95, 0, z * 0.8]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[0.48, 0.035, 8, 32]} />
                <meshStandardMaterial color="#c2d0c9" metalness={0.4} />
              </mesh>
              <Box
                position={[x * 0.95, 0, z * 0.8]}
                size={[0.8, 0.035, 0.06]}
                color="#73877b"
              />
            </group>
          )),
        )}
      </group>
    );
  if (index === 10)
    return (
      <group>
        <Box position={[0, 1.2, 0]} size={[1.35, 2.4, 0.9]} color="#a57f59" />
        {[0.65, 1.6].map((y) => (
          <mesh key={y} position={[0, y, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[y < 1 ? 0.4 : 0.26, y < 1 ? 0.4 : 0.26, 0.045, 32]}
            />
            <meshStandardMaterial color="#223432" roughness={0.85} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0.15 + i * 0.19, 0]}>
          <cylinderGeometry
            args={[
              0.5 + Math.sin(i * 0.4) * 0.25,
              0.5 + Math.sin((i + 1) * 0.4) * 0.25,
              0.2,
              32,
            ]}
          />
          <meshStandardMaterial
            color={i % 2 ? "#6d9e9d" : "#9dbbb1"}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
type ObjectDown = (
  event: PointerEvent,
  orientation?: { x: number; y: number },
) => void;
export type ObjectRotation = {
  x: number;
  y: number;
  dragging: boolean;
  returning: boolean;
};
function CameraRig({
  workspace,
  onReady,
}: {
  workspace: boolean;
  onReady?: () => void;
}) {
  const { camera, invalidate } = useThree();
  const ready = useRef(false);
  useFrame(({ gl }) => {
    if (!ready.current) {
      gl.domElement.dataset.sceneReady = "true";
      ready.current = true;
      onReady?.();
    }
  });
  useEffect(() => {
    if (workspace) camera.position.set(6.6, 3.8, 8.8);
    else camera.position.set(0, 3.5, 14.5);
    camera.lookAt(0, workspace ? 0 : 1.4, -1);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, workspace]);
  return null;
}
function CarouselItem({
  index,
  active,
  reduced,
  scale,
  turn,
  rotation,
  config,
  onObjectDown,
  angle,
}: {
  index: number;
  active: boolean;
  reduced: boolean;
  scale: number;
  turn: React.RefObject<Group | null>;
  rotation: ObjectRotation;
  config: Configuration;
  onObjectDown?: ObjectDown;
  angle: number;
}) {
  const root = useRef<Group>(null);
  const { invalidate } = useThree();
  useFrame((_, delta) => {
    if (
      root.current &&
      !reduced &&
      Math.abs(root.current.scale.x - scale) > 0.001
    ) {
      invalidate();
      root.current.scale.setScalar(
        root.current.scale.x +
          (scale - root.current.scale.x) *
            (1 - Math.exp(-Math.min(delta, 0.05) * 6)),
      );
    }
  });
  return (
    <group
      position={
        onObjectDown
          ? [Math.sin(angle) * 18, 0, Math.cos(angle) * 18]
          : [0, 0, 0]
      }
      rotation={[0, angle, 0]}
    >
      <group ref={root} scale={reduced ? scale : undefined}>
        <group
          ref={active ? turn : undefined}
          rotation={
            reduced && active
              ? [
                  rotation.dragging ? rotation.x : 0,
                  rotation.dragging ? rotation.y : -0.45,
                  0,
                ]
              : [0, -0.45, 0]
          }
          onPointerDown={(e) => {
            if (active && onObjectDown) {
              e.stopPropagation();
              onObjectDown(e.nativeEvent, {
                x: turn.current?.rotation.x ?? 0,
                y: turn.current?.rotation.y ?? -0.45,
              });
            }
          }}
        >
          {onObjectDown ? (
            <GalleryProduct index={index} active={active}>
              <Product index={index} config={config} />
            </GalleryProduct>
          ) : (
            <Product index={index} config={config} />
          )}
        </group>
      </group>
    </group>
  );
}
function Carousel({
  selected,
  offset,
  reduced,
  paused,
  workspace,
  config,
  rotation,
  onObjectDown,
}: {
  selected: number;
  offset: number;
  reduced: boolean;
  paused?: boolean;
  workspace: boolean;
  config: Configuration;
  rotation: ObjectRotation;
  onObjectDown: ObjectDown;
}) {
  const ring = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const returning = useRef(false);
  const { size, invalidate, get } = useThree();
  const step = (Math.PI * 2) / creations.length;
  const target = -selected * step + offset;
  useEffect(() => {
    get().gl.domElement.dataset.carouselSettled = "false";
    invalidate();
  }, [target, get, invalidate]);
  const activeScale = workspace
    ? 1.4
    : size.width / size.height < 1
      ? 0.86
      : 1.4;
  useEffect(() => {
    if (rotation.returning) {
      returning.current = true;
      invalidate();
    }
  }, [rotation.returning, invalidate, selected]);
  useFrame(({ gl }, delta) => {
    const dt = Math.min(delta, 0.05),
      t = 1 - Math.exp(-dt * 7);
    if (ring.current) {
      const diff = Math.atan2(
        Math.sin(target - ring.current.rotation.y),
        Math.cos(target - ring.current.rotation.y),
      );
      ring.current.rotation.y += diff * t;
      gl.domElement.dataset.carouselSettled = String(
        reduced || Math.abs(diff) < 0.003,
      );
      if (!reduced && Math.abs(diff) > 0.001) invalidate();
    }
    if (!turn.current) return;
    if (rotation.dragging) {
      turn.current.rotation.set(rotation.x, rotation.y, 0);
      return;
    }
    if (returning.current) {
      if (reduced) {
        turn.current.rotation.set(0, -0.45, 0);
        returning.current = false;
        return;
      }
      invalidate();
      turn.current.rotation.x += (0 - turn.current.rotation.x) * t;
      const dy = Math.atan2(
        Math.sin(-0.45 - turn.current.rotation.y),
        Math.cos(-0.45 - turn.current.rotation.y),
      );
      turn.current.rotation.y += dy * t;
      turn.current.rotation.z *= 1 - t;
      if (Math.abs(turn.current.rotation.x) < 0.003 && Math.abs(dy) < 0.003) {
        turn.current.rotation.set(0, -0.45, 0);
        returning.current = false;
      }
    } else if (!reduced && !paused) {
      turn.current.rotation.y += dt * 0.035;
    }
  });
  const item = (i: number) => (
    <CarouselItem
      key={i}
      index={i}
      active={workspace || i === selected}
      reduced={reduced}
      scale={workspace || i === selected ? activeScale : 0.7}
      turn={turn}
      rotation={rotation}
      config={workspace ? config : defaults}
      onObjectDown={workspace ? undefined : onObjectDown}
      angle={workspace ? 0 : i * step}
    />
  );
  return workspace ? (
    item(0)
  ) : (
    <group
      ref={ring}
      position={[0, -0.6, -18]}
      rotation={reduced ? [0, target, 0] : undefined}
    >
      {creations.map((_, i) => item(i))}
      <ShowroomFloor />
    </group>
  );
}
export default function CreationScene({
  selected,
  desk,
  detailsOpen = false,
  onReady,
  reduced,
  paused,
  workspace,
  workshop,
  config,
  offset = 0,
  rotation = { x: 0, y: -0.45, dragging: false, returning: false },
  onObjectDown = () => {},
}: {
  selected: number;
  desk?: DeskConfiguration;
  detailsOpen?: boolean;
  onReady?: () => void;
  reduced: boolean;
  paused?: boolean;
  workspace: boolean;
  workshop: boolean;
  config: Configuration;
  offset?: number;
  rotation?: ObjectRotation;
  onObjectDown?: ObjectDown;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows="soft"
      camera={{ position: [0, 4.5, 13], fov: 39 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={reduced || paused ? "demand" : "always"}
      aria-hidden="true"
    >
      <CameraRig workspace={workspace} onReady={onReady} />
      {!workspace && (
        <>
          <GalleryLighting />
          <PromotionMeshes
            reduced={reduced || Boolean(paused)}
            detailsOpen={detailsOpen}
          />
        </>
      )}
      {workspace && desk && <GalleryLighting intensity={0.45} />}
      <ambientLight intensity={workspace ? (desk ? 0.55 : 2) : 0.06} />
      <spotLight
        position={[0, 7, 3]}
        angle={workspace ? 0.43 : 0.85}
        penumbra={workspace ? 0.7 : 1}
        castShadow={!workspace || Boolean(desk)}
        shadow-mapSize={[1024, 1024]}
        shadow-normalBias={0.035}
        shadow-bias={-0.00015}
        shadow-radius={4}
        intensity={workspace ? (desk ? 65 : 150) : 260}
        distance={workspace ? 20 : 24}
        color={workspace ? "#fff0d2" : "#f9fbff"}
      />
      <directionalLight
        position={[-5, 3, -4]}
        intensity={workspace ? (desk ? 1.5 : 3) : 0.2}
        color={workspace ? "#ffffff" : "#7a8b9b"}
      />
      {workspace && (
        <directionalLight position={[4, 3, 1]} intensity={desk ? 0.8 : 2} />
      )}
      {workspace && desk ? (
        <DeskModel config={desk} reduced={reduced} paused={paused} />
      ) : (
        <Carousel
          selected={selected}
          offset={offset}
          reduced={reduced}
          paused={paused}
          workspace={workspace}
          config={config}
          rotation={rotation}
          onObjectDown={onObjectDown}
        />
      )}
      <mesh
        receiveShadow={!workspace || Boolean(desk)}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, workspace ? -0.03 : -0.63, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={workspace ? "#f0f1ed" : "#050708"}
          envMapIntensity={workspace ? 1 : 0}
          roughness={0.9}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, workspace ? -0.008 : -0.608, 0]}
      >
        <planeGeometry args={[7, 4]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
          fragmentShader="varying vec2 vUv;void main(){float a=1.0-smoothstep(0.05,0.5,length(vUv-0.5));gl_FragColor=vec4(0.,0.,0.,a*.45);}"
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

"use client";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useLoader } from "@react-three/fiber";
import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

class AssetBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function ReferenceAsset({
  name,
  active,
}: {
  name: "SheenChair" | "BoomBox";
  active: boolean;
}) {
  const gltf = useLoader(GLTFLoader, `/models/${name}.glb`);
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.traverse((node) => {
      if (node.name.toLowerCase().includes("label")) node.visible = false;
    });
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const factor =
      (name === "SheenChair" ? 2.05 : 2.1) / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(factor);
    scene.position.set(
      -(box.min.x + size.x / 2) * factor,
      -box.min.y * factor,
      -(box.min.z + size.z / 2) * factor,
    );
    return scene;
  }, [gltf, name]);
  useEffect(() => {
    model.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = active;
        node.receiveShadow = true;
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material])
          if (material instanceof MeshStandardMaterial) {
            material.envMapIntensity = active ? 0.8 : 0.025;
            // Keep surrounding creations as silhouettes even inside the wider pool.
            const base =
              material.userData.galleryBaseColor ?? material.color.clone();
            material.userData.galleryBaseColor = base;
            material.color.copy(base).multiplyScalar(active ? 1 : 0.08);
            const glow =
              material.userData.galleryBaseGlow ?? material.emissiveIntensity;
            material.userData.galleryBaseGlow = glow;
            material.emissiveIntensity = active ? glow : 0;
          }
      }
    });
  }, [model, active]);
  return <primitive object={model} dispose={null} />;
}
function Part({
  position,
  size,
  color = "#a9b0ad",
  metal = 0.65,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  metal?: number;
}) {
  const [x, y, z] = size;
  const geometry = useMemo(
    () => new RoundedBoxGeometry(x, y, z, 2, Math.min(x, y, z) * 0.18),
    [x, y, z],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={position}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color={color} metalness={metal} roughness={0.29} />
    </mesh>
  );
}
function Disk({
  position,
  radius,
  color = "#a9b0ad",
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  radius: number;
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, 0.045, 24]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.24} />
    </mesh>
  );
}
function Details({ index }: { index: number }) {
  if (index === 0)
    return (
      <>
        {[-0.86, 0.86].map((z) => (
          <group key={z}>
            <Part
              position={[1.56, 1.42, z]}
              size={[0.18, 0.22, 0.13]}
              color="#4c585b"
            />
            <Part
              position={[1.57, 1.38, z * 1.05]}
              size={[0.11, 0.16, 0.02]}
              color="#b6cbcc"
            />
            <Part
              position={[-0.4, 2.22, z * 0.78]}
              size={[3.1, 0.035, 0.035]}
            />
            {[-1.22, 1.25].map((x) => (
              <group key={x}>
                <mesh position={[x, 0.36, z * 0.99]}>
                  <torusGeometry args={[0.31, 0.065, 10, 32]} />
                  <meshStandardMaterial color="#11191a" roughness={0.93} />
                </mesh>
                {Array.from({ length: 6 }, (_, i) => (
                  <mesh
                    key={i}
                    position={[
                      x + Math.cos((i * Math.PI) / 3) * 0.13,
                      0.36 + Math.sin((i * Math.PI) / 3) * 0.13,
                      z * 1.03,
                    ]}
                  >
                    <sphereGeometry args={[0.025, 8, 6]} />
                    <meshStandardMaterial
                      color="#d8dddc"
                      metalness={0.85}
                      roughness={0.22}
                    />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ))}
        {[-0.52, 0.52].map((z) => (
          <mesh key={z} position={[2.025, 0.9, z]}>
            <boxGeometry args={[0.025, 0.06, 0.22]} />
            <meshStandardMaterial
              color="#f9e8bc"
              emissive="#ffe4a5"
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
        <Part
          position={[1.995, 0.78, 0]}
          size={[0.025, 0.06, 0.8]}
          color="#151d21"
        />
      </>
    );
  if (index === 1)
    return (
      <group scale={1.2}>
        <Part
          position={[0.1, 0.5, 0]}
          size={[1.3, 0.035, 0.28]}
          color="#3d4943"
        />
        {[-0.85, 0.95].map((x) => (
          <Disk
            key={x}
            position={[x, 0.3, 0.12]}
            radius={0.19}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
        <mesh position={[1.08, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.1, 20]} />
          <meshStandardMaterial
            color="#efdfb6"
            emissive="#ffe5b4"
            emissiveIntensity={0.8}
          />
        </mesh>
        {[-0.34, 0.34].map((z) => (
          <Part
            key={z}
            position={[0.98, 1.85, z]}
            size={[0.16, 0.11, 0.23]}
            color="#1e2926"
            metal={0}
          />
        ))}
        <Part
          position={[-0.7, 0.56, 0]}
          size={[0.24, 0.07, 0.44]}
          color="#28342f"
        />
      </group>
    );
  if (index === 3)
    return (
      <mesh position={[0, 1.6, 0.025]}>
        <torusGeometry args={[0.7, 0.035, 12, 64]} />
        <meshPhysicalMaterial
          color="#fae7af"
          emissive="#ffce7c"
          emissiveIntensity={0.75}
          roughness={0.32}
          clearcoat={0.7}
        />
      </mesh>
    );
  if (index === 4)
    return (
      <>
        {[0.35, 0.65, 0.95].map((y) => (
          <Part
            key={y}
            position={[0.246, y, 0]}
            size={[0.018, 0.08, 0.25]}
            color="#546561"
          />
        ))}
        <Disk position={[0, 0.22, 0]} radius={0.54} color="#344944" />
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.22, 0.25]}>
            <sphereGeometry args={[0.038, 10, 8]} />
            <meshStandardMaterial color="#b5c3c1" metalness={0.8} />
          </mesh>
        ))}
        <Part
          position={[0, 0.84, 0.25]}
          size={[0.24, 0.16, 0.018]}
          color="#a18456"
        />
      </>
    );
  if (index === 5)
    return (
      <group position={[0, 1, 0]}>
        <mesh>
          <torusGeometry args={[0.72, 0.025, 10, 64]} />
          <meshPhysicalMaterial
            color="#e9c980"
            metalness={1}
            roughness={0.13}
            clearcoat={1}
          />
        </mesh>
        <mesh position={[0, 0.85, 0.012]} rotation={[0, 0.6, 0]}>
          <octahedronGeometry args={[0.405, 0]} />
          <meshPhysicalMaterial
            color="#e5fbff"
            metalness={0}
            roughness={0.035}
            transmission={0.72}
            thickness={0.45}
            ior={2.42}
            clearcoat={1}
          />
        </mesh>
        {[-0.2, 0.2].map((x) => (
          <Part
            key={x}
            position={[x, 0.71, 0]}
            size={[0.045, 0.28, 0.045]}
            color="#d6b46c"
          />
        ))}
      </group>
    );
  if (index === 6)
    return (
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Part
            key={i}
            position={[-1.35 + i * 0.3, 0.2, 0]}
            size={[0.26, 0.03, 1.8]}
            color={i % 2 ? "#95795a" : "#aa8d69"}
            metal={0}
          />
        ))}
        {[-0.85, 0.85].map((z) => (
          <mesh key={z} position={[0, 1.05, z]}>
            <boxGeometry args={[2.5, 1.55, 0.025]} />
            <meshPhysicalMaterial
              color="#a4c3bd"
              transmission={0.72}
              opacity={0.2}
              transparent
              roughness={0.08}
              metalness={0}
            />
          </mesh>
        ))}
        <Part
          position={[0, 0.02, 0]}
          size={[3.35, 0.12, 2.35]}
          color="#626e68"
          metal={0}
        />
      </>
    );
  if (index === 7)
    return (
      <group rotation={[0, 0, -0.2]}>
        {[-0.22, 0, 0.22].map((x) => (
          <Part
            key={x}
            position={[x, 0.86, 0.248]}
            size={[0.035, 0.6, 0.025]}
            color="#25342f"
            metal={0}
          />
        ))}
        {[-0.65, -0.45, -0.25].map((x) => (
          <Part
            key={x}
            position={[x, 1.62, 0.33]}
            size={[0.07, 0.22, 0.025]}
            color="#27352e"
          />
        ))}
        <Disk
          position={[0.81, 1.55, 0]}
          radius={0.23}
          rotation={[0, 0, Math.PI / 2]}
        />
        <Part
          position={[0.26, 1.2, 0.24]}
          size={[0.12, 0.18, 0.13]}
          color="#a3603e"
        />
      </group>
    );
  if (index === 8)
    return (
      <group rotation={[-0.35, 0, 0.15]} position={[0, 1.2, 0]}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <Part
              key={i}
              position={[Math.sin(a) * 0.46, 0.17, Math.cos(a) * 0.46]}
              size={[0.018, 0.012, 0.045]}
              color="#32423e"
            />
          );
        })}
        <Part
          position={[0.13, 0.18, 0]}
          size={[0.3, 0.02, 0.022]}
          color="#a3733e"
        />
        {[-1.25, -1, -0.75, 0.75, 1, 1.25].map((y) => (
          <Part
            key={y}
            position={[0, y, 0.065]}
            size={[0.56, 0.025, 0.012]}
            color="#665448"
            metal={0}
          />
        ))}
        <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.15, 16]} />
          <meshStandardMaterial
            color="#b4b9af"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      </group>
    );
  if (index === 9)
    return (
      <group position={[0, 1.15, 0]}>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <group key={`${x}${z}`}>
              <mesh
                position={[x * 0.95, 0.03, z * 0.8]}
                rotation={[0, x * z * 0.7, 0]}
              >
                <boxGeometry args={[0.65, 0.012, 0.06]} />
                <meshStandardMaterial color="#283a35" metalness={0.35} />
              </mesh>
              <Part
                position={[x * 0.95, -0.08, z * 0.8]}
                size={[0.13, 0.15, 0.13]}
                color="#929e98"
              />
            </group>
          )),
        )}
        <mesh position={[0, -0.42, 0.18]}>
          <sphereGeometry args={[0.19, 16, 12]} />
          <meshStandardMaterial color="#3e504c" metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.42, 0.34]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshPhysicalMaterial
            color="#1c3e50"
            metalness={0.55}
            clearcoat={1}
            roughness={0.08}
          />
        </mesh>
      </group>
    );
  return null;
}
function Vessel() {
  const points = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const t = i / 35;
        return new Vector2(
          0.43 +
            Math.sin(t * Math.PI) * 0.28 +
            Math.sin(t * Math.PI * 12) * 0.018,
          t * 1.85,
        );
      }),
    [],
  );
  return (
    <mesh>
      <latheGeometry args={[points, 64]} />
      <meshPhysicalMaterial
        color="#659b91"
        roughness={0.23}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.14}
        side={2}
      />
    </mesh>
  );
}
export default function GalleryProduct({
  index,
  active,
  children,
}: {
  index: number;
  active: boolean;
  children: ReactNode;
}) {
  const root = useRef<Group>(null);
  useEffect(() => {
    root.current?.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = active;
        node.receiveShadow = true;
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material])
          if (material instanceof MeshStandardMaterial) {
            material.envMapIntensity = active ? 0.8 : 0.025;
            // Keep surrounding creations as silhouettes even inside the wider pool.
            const base =
              material.userData.galleryBaseColor ?? material.color.clone();
            material.userData.galleryBaseColor = base;
            material.color.copy(base).multiplyScalar(active ? 1 : 0.08);
            const glow =
              material.userData.galleryBaseGlow ?? material.emissiveIntensity;
            material.userData.galleryBaseGlow = glow;
            material.emissiveIntensity = active ? glow : 0;
          }
      }
    });
  }, [index, active]);
  return (
    <group ref={root}>
      {!active ? (
        children
      ) : index === 2 || index === 10 ? (
        <AssetBoundary fallback={children}>
          <Suspense fallback={children}>
            <ReferenceAsset
              name={index === 2 ? "SheenChair" : "BoomBox"}
              active={active}
            />
          </Suspense>
        </AssetBoundary>
      ) : index === 11 ? (
        <Vessel />
      ) : (
        children
      )}
      {active && <Details index={index} />}
    </group>
  );
}

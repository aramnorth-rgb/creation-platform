"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Box3, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ModelUnits } from "@/lib/studio/model-assets";

export type PresentationFinish = "original" | "chalk" | "graphite" | "champagne";
const finishColours = { chalk: "#f5eee2", graphite: "#4d5858", champagne: "#c3a17c" } as const;
const MM_TO_SCENE = 0.0165;
const unitInMM: Record<ModelUnits, number> = {m:1000,cm:10,mm:1};

function StudioObject({
  url, units, finish, onDimensions, onError,
}: {
  url: string; units: ModelUnits; finish: PresentationFinish;
  onDimensions?: (dimensions: [number,number,number]) => void;
  onError?: (message: string) => void;
}) {
  const { camera, invalidate } = useThree();
  const [object, setObject] = useState<Object3D | null>(null);
  const [bounds, setBounds] = useState<{center: Vector3; min: Vector3; size: Vector3}|null>(null);
  const scale = unitInMM[units] * MM_TO_SCENE;
  useEffect(() => {
    let active = true;
    setObject(null);
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      if (!active) return;
      const original = gltf.scene;
      original.updateWorldMatrix(true,true);
      const box = new Box3().setFromObject(original);
      const size = box.getSize(new Vector3());
      if (!(size.length()>0) || !Number.isFinite(size.length())) {
        onError?.("This model has no usable dimensions.");
        return;
      }
      original.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setBounds({center:box.getCenter(new Vector3()),min:box.min.clone(),size});
      setObject(original);
      onDimensions?.([
        Math.round(size.x * unitInMM[units]),
        Math.round(size.y * unitInMM[units]),
        Math.round(size.z * unitInMM[units]),
      ]);
    }, undefined, () => onError?.("This 3D asset could not be opened. Export a standard GLB with embedded textures."));
    return () => {active=false;};
  }, [url,units,onDimensions,onError]);

  const display = useMemo(() => {
    if (!object) return null;
    const clone = object.clone(true);
    if (finish !== "original") {
      clone.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = new MeshStandardMaterial({
            color: finishColours[finish], roughness: finish === "graphite" ? 0.46 : 0.62,
            metalness: finish === "champagne" ? 0.64 : finish === "graphite" ? 0.24 : 0.02,
          });
        }
      });
    }
    return clone;
  },[object,finish]);

  useEffect(() => {
    if (!bounds) return;
    const size = bounds.size.clone().multiplyScalar(scale);
    const span = Math.max(2,size.length());
    const focus = new Vector3(0,size.y*0.48,0);
    camera.position.set(span*0.74,size.y*0.54+span*0.3,span*1.3);
    camera.lookAt(focus);
    camera.near = 0.04;
    camera.far = Math.max(300,span*25);
    camera.updateProjectionMatrix();
    invalidate();
  },[camera,bounds,scale,invalidate]);

  if (!display || !bounds) return null;
  return (
    <group scale={scale} position={[
      -bounds.center.x*scale,
      -bounds.min.y*scale,
      -bounds.center.z*scale,
    ]}>
      <primitive object={display} />
    </group>
  );
}

function CameraControls({height}:{height:number}) {
  const {camera,gl,invalidate} = useThree();
  const controls = useMemo(() => new OrbitControls(camera,gl.domElement),[camera,gl.domElement]);
  useEffect(() => {
    controls.enablePan=false;
    controls.enableDamping=true;
    controls.dampingFactor=0.085;
    controls.minDistance=1.8;
    controls.maxDistance=350;
    controls.maxPolarAngle=Math.PI*0.49;
    controls.target.set(0,height*0.48,0);
    controls.update();
    const change=()=>invalidate();
    controls.addEventListener("change",change);
    return () => {controls.removeEventListener("change",change);controls.dispose();};
  },[controls,height,invalidate]);
  useFrame(() => controls.update());
  return null;
}

/** A real GLB asset viewer; original PBR materials are preserved unless a presentation finish is chosen. */
export default function ImportedModelViewer({
  url,units="m",finish="original",onDimensions,onError,
}:{
  url:string;units?:ModelUnits;finish?:PresentationFinish;
  onDimensions?:(size:[number,number,number])=>void;
  onError?:(message:string)=>void;
}) {
  const [dimensions,setDimensions]=useState<[number,number,number]>([0,0,0]);
  const receiveDimensions=(size:[number,number,number])=>{
    setDimensions((old)=>old[0]===size[0]&&old[1]===size[1]&&old[2]===size[2]?old:size);
    onDimensions?.(size);
  };
  return (
    <Canvas dpr={[1,1.75]} shadows camera={{position:[7,6,12],fov:42,near:0.04,far:500}}
      gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} aria-label="Interactive 3D model">
      <color attach="background" args={["#eff3ef"]}/>
      <ambientLight intensity={0.9}/>
      <hemisphereLight args={["#fffaf2","#9cb7b4",2.1]}/>
      <directionalLight position={[-12,20,15]} intensity={2.8} castShadow shadow-mapSize={[2048,2048]}/>
      <directionalLight position={[11,9,-7]} intensity={1.15} color="#dce7ff"/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.03,0]} receiveShadow>
        <planeGeometry args={[1000,1000]}/>
        <meshStandardMaterial color="#ecf0e9" roughness={0.82}/>
      </mesh>
      <StudioObject url={url} units={units} finish={finish} onDimensions={receiveDimensions} onError={onError}/>
      <CameraControls height={dimensions[1]*MM_TO_SCENE}/>
    </Canvas>
  );
}

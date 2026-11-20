"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect,useMemo,useRef } from "react";
import { Group,MathUtils } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {gateFinishes,type GateConfiguration} from "@/lib/gates/config";

function CameraRig(){
 const {camera,gl,invalidate}=useThree();
 const controls=useMemo(()=>new OrbitControls(camera,gl.domElement),[camera,gl.domElement]);
 useEffect(()=>{
  controls.target.set(0,1.55,0);
  controls.enablePan=false;
  controls.enableDamping=true;
  controls.dampingFactor=.08;
  controls.minDistance=3.5;
  controls.maxDistance=15;
  controls.minPolarAngle=.35;
  controls.maxPolarAngle=Math.PI/2.04;
  controls.minAzimuthAngle=-1.3;
  controls.maxAzimuthAngle=1.3;
  controls.update();
  const moved=()=>invalidate();
  controls.addEventListener("change",moved);
  return ()=>{controls.removeEventListener("change",moved);controls.dispose();};
 },[controls,invalidate]);
 useFrame(()=>controls.update());
 return null;
}
function Beam({position,size,color,metalness=.28,roughness=.46}:{
 position:[number,number,number];size:[number,number,number];color:string;
 metalness?:number;roughness?:number;
}){
 return <mesh position={position} castShadow receiveShadow>
  <boxGeometry args={size}/>
  <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/>
 </mesh>;
}
function GateLeaf({config,hinge,gateWidth,leafWidth,height,finish}:{
 config:GateConfiguration;hinge:-1|1;gateWidth:number;leafWidth:number;height:number;finish:string;
}){
 const ref=useRef<Group>(null);
 const target=config.openPreview ? (hinge===-1?-.93:.93):0;
 useFrame((_state,delta)=>{
  if(!ref.current)return;
  ref.current.rotation.y=MathUtils.damp(ref.current.rotation.y,target,3.6,delta);
 });
 const frame=.062;
 const innerWidth=leafWidth-2*frame;
 const innerHeight=height-2*frame;
 // At zero rotation, each leaf ends on the central seam. Hinge pivots at the outer side.
 const relX=hinge===-1?leafWidth/2:-leafWidth/2;
 return <group position={[hinge*(gateWidth/2),0,.1]} ref={ref}>
  <group position={[relX,0,0]}>
   {[-1,1].map(side=><Beam key={side} position={[side*(leafWidth/2-frame/2),height/2,0]}
    size={[frame,height,.079]} color={finish}/>)}
   {[frame/2,height-frame/2].map(y=><Beam key={y}
    position={[0,y,0]} size={[leafWidth,frame,.079]} color={finish}/>)}
   {config.line==="veil"
     ? <Beam position={[0,height/2,0]} size={[innerWidth,innerHeight,.043]} color={finish} roughness={.34}/>
     : config.line==="horizon"
      ? Array.from({length:Math.max(5,Math.round(innerHeight/.16))},(_,index)=>{
       const count=Math.max(5,Math.round(innerHeight/.16));
       const rowHeight=innerHeight/count;
       return <Beam key={index} position={[0,frame+(index+.5)*rowHeight,0]}
          size={[innerWidth,rowHeight*.84,.039]} color={finish} metalness={.51} roughness={.36}/>;
      })
      : Array.from({length:Math.max(6,Math.round(innerWidth/.105))},(_,index)=>{
       const count=Math.max(6,Math.round(innerWidth/.105));
       const colWidth=innerWidth/count;
       return <Beam key={index} position={[-innerWidth/2+(index+.5)*colWidth, height/2,0]}
         size={[colWidth*.7,innerHeight,.049]} color={finish} metalness={.44} roughness={.39}/>;
      })}
   {/* Physical hinge knuckles, left and right leaf simulated for concept visualisation. */}
   {[.3,height-.3].map(y=><group key={y} position={[hinge*-(leafWidth/2),y,.065]}>
    <mesh castShadow>
     <cylinderGeometry args={[.044,.044,.14,12]}/>
     <meshStandardMaterial color="#6c6c68" metalness={.76} roughness={.25}/>
    </mesh>
   </group>)}
   <Beam position={[hinge*-1*(leafWidth/2-.13),height*.51,.083]}
    size={[.12,.026,.035]} color="#aeaea6" metalness={.81} roughness={.25}/>
  </group>
 </group>;
}
function GateGeometry({config}:{config:GateConfiguration}){
 const span=config.width/1000;
 const height=config.height/1000;
 const gap=.036;
 const width=span-gap*2;
 const single=config.opening==="single";
 const count=single?1:2;
 const leafWidth=width/count;
 const finish=gateFinishes[config.finish].hex;
 return <group>
  <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-.04,0]}>
   <planeGeometry args={[90,90]}/>
   <meshStandardMaterial color="#b4b9ad" roughness={.9}/>
  </mesh>
  {/* Roadway laid perpendicular to the gates, outdoor scene remains understated. */}
  <Beam position={[0,-.034,2.1]} size={[span+2,.035,6.4]} color="#b5b8b1" metalness={0} roughness={.96}/>
  <Beam position={[0,-.009,.65]} size={[span+.15,.018,.045]} color="#d3d2c9" metalness={0} roughness={.91}/>
  {[-1,1].map(side=><group key={side}>
   <Beam position={[side*(span/2+.2),height/2+.15,0]} size={[.31,height+.42,.37]}
    color="#c6c3b9" metalness={0} roughness={.88}/>
   <Beam position={[side*(span/2+.2),height+.38,0]} size={[.4,.08,.46]}
    color="#dedbd0" metalness={0} roughness={.84}/>
   <Beam position={[side*(span/2+.2+1.04),.57,0]} size={[1.9,1.15,.4]}
    color="#bdbab0" metalness={0} roughness={.91}/>
  </group>)}
  {single?<GateLeaf config={config} hinge={-1} gateWidth={width}
   leafWidth={leafWidth} height={height} finish={finish}/>:<>
    <GateLeaf config={config} hinge={-1} gateWidth={width}
      leafWidth={leafWidth} height={height} finish={finish}/>
    <GateLeaf config={config} hinge={1} gateWidth={width}
      leafWidth={leafWidth} height={height} finish={finish}/>
  </>}
  <group position={[0,0,-2.6]}>
   <Beam position={[0,1.3,0]} size={[span+3,2.6,.1]} color="#e4e1d8" metalness={0} roughness={1}/>
   <Beam position={[0,2.7,0]} size={[span+3.2,.18,.25]} color="#d2c9b9" metalness={0} roughness={.9}/>
  </group>
  {[-(span/2+1.6),span/2+1.6].map(x=><group key={x}>
   <mesh position={[x,.68,-1.5]} castShadow>
    <cylinderGeometry args={[.22,.28,1.36,14]}/>
    <meshStandardMaterial color="#607b66" roughness={.9}/>
   </mesh>
   <mesh position={[x,1.48,-1.5]} castShadow>
    <sphereGeometry args={[.47,15,12]}/>
    <meshStandardMaterial color="#536f55" roughness={.92}/>
   </mesh>
  </group>)}
 </group>;
}
export function GateElevation({config}:{config:GateConfiguration}){
 const span=config.width/1000,height=config.height/1000;
 const w=span*110, h=height*110, frame=6.5;
 const line=gateFinishes[config.finish].hex;
 const count=config.opening==="double"?2:1;
 const number=config.line==="horizon"?Math.round(height/.16):Math.round(span/.12);
 const shapes=config.line==="veil"?<rect x={frame} y={frame} width={w-2*frame} height={h-2*frame} fill={line}/>:
  Array.from({length:number},(_,i)=>config.line==="horizon"
   ? <rect key={i} x={frame} y={frame+(i+.1)*((h-2*frame)/number)}
     width={w-2*frame} height={((h-2*frame)/number)*.8} fill={line}/>
   : <rect key={i} x={frame+(i+.12)*(w-2*frame)/number} y={frame}
     width={(w-2*frame)/number*.76} height={h-2*frame} fill={line}/>);
 return <svg viewBox={`0 0 ${w+100} ${h+120}`} role="img"
  aria-label={`${config.line} ${config.opening} gate front elevation, ${config.width} by ${config.height} millimetres`}>
  <rect x="50" y="24" width={w} height={h} fill="#eff0e9"/>
  <g transform="translate(50 24)">{shapes}
   <rect x="0" y="0" width={w} height={h} fill="none" stroke={line} strokeWidth={frame*2}/>
   {count===2&&<line x1={w/2} x2={w/2} y1="0" y2={h} stroke="#1e2422" strokeWidth="3"/>}
  </g>
  <g stroke="#7f8d81" strokeWidth="1" fill="none">
   <path d={`M50 ${h+51}h${w}m0 -6v12m-${w} -12v12`}/>
   <path d={`M28 24v${h}m-6 0h12m-12 -${h}h12`}/>
  </g>
  <g fontSize="13" fill="#536960" textAnchor="middle">
   <text x={(w+100)/2} y={h+78}>{config.width} mm clear opening</text>
   <text x="15" y={h/2+24} transform={`rotate(-90 15 ${h/2+24})`}>{config.height} mm</text>
  </g>
 </svg>;
}
export function GateScene({config}:{config:GateConfiguration}){
 return <Canvas shadows dpr={[1,1.5]} frameloop="always"
  camera={{position:[5.65,3.42,8.4],fov:40,near:.08,far:70}}
  gl={{alpha:false,antialias:true,powerPreference:"high-performance"}}
  aria-label="Interactive driveway gate 3D model">
  <color attach="background" args={["#e8ede8"]}/>
  <fog attach="fog" args={["#e8ede8",16,45]}/>
  <ambientLight intensity={1.1}/>
  <hemisphereLight args={["#fdf7ed","#94ad98",2.1]}/>
  <directionalLight position={[4,10,7]} intensity={2.8} castShadow shadow-mapSize={[1024,1024]}
    shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12}/>
  <directionalLight position={[-7,6,-8]} color="#cfdbef" intensity={1.1}/>
  <GateGeometry config={config}/>
  <CameraRig/>
 </Canvas>;
}

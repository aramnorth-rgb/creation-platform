/** Illustrative product catalogue and CPQ rules, NOT a real manufacturer's specification. */
export type GateLine = "horizon" | "atelier" | "veil";
export type GateFinish = "graphite" | "chalk" | "bronze" | "sage";
export type GateOpening = "double" | "single";
export type GateHardware = "manual" | "automation-ready";
export type GateConfiguration = {
  line: GateLine;
  finish: GateFinish;
  opening: GateOpening;
  width: number; // measured clear opening, millimetres
  height: number; // gate leaf height, millimetres
  hardware: GateHardware;
  openPreview: boolean;
};
export const gateLines: Record<GateLine, {
  name:string; subtitle:string; material:string; maxWidth:number; pricePerSquareMetre:number;
}> = {
  horizon:{name:"Horizon",subtitle:"Architectural horizontal slats",material:"Aluminium",maxWidth:5600,pricePerSquareMetre:410},
  atelier:{name:"Atelier",subtitle:"Precisely spaced vertical battens",material:"Aluminium",maxWidth:5400,pricePerSquareMetre:375},
  veil:{name:"Veil",subtitle:"Quiet, full-privacy panels",material:"Aluminium",maxWidth:4600,pricePerSquareMetre:475},
};
export const gateFinishes: Record<GateFinish,{name:string;hex:string; premium:number}> = {
  graphite:{name:"Anthracite",hex:"#41484b",premium:0},
  chalk:{name:"Porcelain",hex:"#e2e3dc",premium:105},
  bronze:{name:"Warm bronze",hex:"#8a7259",premium:180},
  sage:{name:"Soft sage",hex:"#849184",premium:130},
};
export const defaults:GateConfiguration={
  line:"horizon",finish:"graphite",opening:"double",width:3600,height:1700,
  hardware:"manual",openPreview:false,
};
export const LIMITS={minWidth:2400,maxWidth:5600,minHeight:1200,maxHeight:2100,increment:50} as const;
const lines = Object.keys(gateLines) as GateLine[];
const finishes = Object.keys(gateFinishes) as GateFinish[];
const openings:GateOpening[]=["single","double"];
const hardwareOptions:GateHardware[]=["manual","automation-ready"];
export function lineMaxWidth(config:Pick<GateConfiguration,"line"|"opening">) {
 return Math.min(gateLines[config.line].maxWidth,config.opening==="single"?3000:LIMITS.maxWidth);
}
export function validGateConfig(input:GateConfiguration):string[]{
 const errors:string[]=[];
 if(!lines.includes(input.line)) errors.push("Unknown product family.");
 if(!finishes.includes(input.finish))errors.push("Unknown finish.");
 if(!openings.includes(input.opening))errors.push("Unknown opening type.");
 if(!hardwareOptions.includes(input.hardware))errors.push("Unknown hardware.");
 if(!Number.isInteger(input.width)||input.width<LIMITS.minWidth||input.width>lineMaxWidth(input)||input.width%LIMITS.increment!==0)
  errors.push("Clear opening width is outside this demo's permitted dimensions.");
 if(!Number.isInteger(input.height)||input.height<LIMITS.minHeight||input.height>LIMITS.maxHeight||input.height%LIMITS.increment!==0)
  errors.push("Gate height is outside this demo's permitted dimensions.");
 return errors;
}
export function normaliseConfig(input:GateConfiguration):GateConfiguration {
 const line=lines.includes(input.line)?input.line:defaults.line;
 const finish=finishes.includes(input.finish)?input.finish:defaults.finish;
 const opening=openings.includes(input.opening)?input.opening:defaults.opening;
 const hardware=hardwareOptions.includes(input.hardware)?input.hardware:defaults.hardware;
 const widthMax=lineMaxWidth({line,opening});
 const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Math.round((Number.isFinite(n)?n:min)/50)*50));
 return {
  line,finish,opening,hardware,
  width:clamp(input.width,LIMITS.minWidth,widthMax),
  height:clamp(input.height,LIMITS.minHeight,LIMITS.maxHeight),
  openPreview:Boolean(input.openPreview),
 };
}
export function quotation(config:GateConfiguration){
 const errors=validGateConfig(config);
 if(errors.length)throw Error(errors.join(" "));
 const surfaceM2=(config.width*config.height)/1_000_000;
 const base= config.opening==="double"?540:390;
 const materials=Math.round(surfaceM2*gateLines[config.line].pricePerSquareMetre);
 const coating=gateFinishes[config.finish].premium;
 const hardware=config.hardware==="automation-ready"?275:0;
 const subtotal=base+materials+coating+hardware;
 const vat=Math.round(subtotal*0.2);
 const total=subtotal+vat;
 return {items:[
   {label:config.opening==="double"?"Double-leaf frame":"Single-leaf frame",amount:base},
   {label:gateLines[config.line].name+" panels ("+surfaceM2.toFixed(2)+" m²)",amount:materials},
   {label:gateFinishes[config.finish].name+" finish",amount:coating},
   {label:config.hardware==="manual"?"Manual hinges and latch":"Preparation for automation (motor not included)",amount:hardware},
  ],subtotal,vat,total,surfaceM2};
}
export function shareQuery(config:GateConfiguration){
 const url=new URLSearchParams();
 url.set("line",config.line);url.set("finish",config.finish);url.set("opening",config.opening);
 url.set("width",String(config.width));url.set("height",String(config.height));
 url.set("hardware",config.hardware);
 return url.toString();
}
export function readQuery(query:URLSearchParams):GateConfiguration{
 const values={...defaults,
  line:query.get("line") as GateLine || defaults.line,
  finish:query.get("finish") as GateFinish || defaults.finish,
  opening:query.get("opening") as GateOpening || defaults.opening,
  width:Number(query.get("width")||defaults.width),
  height:Number(query.get("height")||defaults.height),
  hardware:query.get("hardware") as GateHardware||defaults.hardware,
 };
 return normaliseConfig(values);
}
export function specification(config:GateConfiguration){
 const price=quotation(config);
 return {
  schema:"nitorix-gate-pilot-v1",
  product:"NITORIX fictional driveway-gate product demonstration",
  generatedAt:new Date().toISOString(),
  configuration:{...config,openPreview:undefined},
  measurements:{clearOpeningWidthMm:config.width,leafHeightMm:config.height},
  guidePriceGBP:price.total,
  priceIncludesIllustrativeVat:true,
  exclusions:["Site survey","Installation","Posts, foundations and civil works","Automation motors and safety certification","Delivery"],
  limitations:"Concept demo only. Actual product dimensions, hardware compatibility, price and installation require independent manufacturer approval.",
 };
}

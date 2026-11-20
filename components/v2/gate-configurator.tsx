"use client";
import dynamic from "next/dynamic";
import {useEffect,useMemo,useState} from "react";
import {
 defaults,gateFinishes,gateLines,lineMaxWidth,LIMITS,normaliseConfig,quotation,readQuery,
 shareQuery,specification,validGateConfig,
 type GateConfiguration,type GateFinish,type GateLine,
} from "@/lib/gates/config";
import {GateElevation} from "./gate-scene";

const GateScene=dynamic(()=>import("./gate-scene").then(module=>module.GateScene),{
 ssr:false,loading:()=> <div className="nx-gate-loading">Preparing your 3D studio…</div>,
});
const currency=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(value);
const STORAGE="nitorix-gate-demonstration-v1";
function downloadText(filename:string,text:string,type:string){
 const objectUrl=URL.createObjectURL(new Blob([text],{type}));
 const anchor=document.createElement("a");
 anchor.href=objectUrl;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();
 window.setTimeout(()=>URL.revokeObjectURL(objectUrl),2000);
}
export function GateConfigurator(){
 const [config,setConfig]=useState<GateConfiguration>(defaults);
 const [ready,setReady]=useState(false);
 const [webgl,setWebgl]=useState(false);
 const [elevation,setElevation]=useState(false);
 const [notice,setNotice]=useState("");
 const [showQuote,setShowQuote]=useState(false);
 const [contact,setContact]=useState({name:"",email:"",postcode:"",notes:""});
 const [requestSaved,setRequestSaved]=useState(false);

 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const fromLink=params.has("line")||params.has("width")||params.has("height");
  if(fromLink)setConfig(readQuery(params));
  else {
   try{const saved=localStorage.getItem(STORAGE);
    if(saved)setConfig(normaliseConfig({...defaults,...JSON.parse(saved)}));
   }catch{/* keep defaults */}
  }
  const canvas=document.createElement("canvas");
  const context=canvas.getContext("webgl2")||canvas.getContext("webgl");
  setWebgl(Boolean(context));
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  setReady(true);
 },[]);
 useEffect(()=>{
  if(!ready)return;
  try{localStorage.setItem(STORAGE,JSON.stringify(config));}catch{/* Local browser-only demo */}
 },[ready,config]);
 const errors=validGateConfig(config);
 const price=useMemo(()=>quotation(config),[config]);
 const set=<K extends keyof GateConfiguration>(key:K,value:GateConfiguration[K])=>{
  setConfig(previous=>normaliseConfig({...previous,[key]:value}));
  setNotice("");setRequestSaved(false);
 };
 const maxWidth=lineMaxWidth(config);
 const can3d=webgl&&!elevation;
 const share=async()=>{
  const url=`${window.location.origin}/gates?${shareQuery(config)}`;
  try{await navigator.clipboard.writeText(url);setNotice("Configuration link copied. Anyone can open this same design.");}
  catch{setNotice("Copy this link: "+url);}
 };
 const download=()=>{
  downloadText("nitorix-gate-specification.json",JSON.stringify(specification(config),null,2),"application/json");
  setNotice("Specification downloaded. Figures are illustrative and require manufacturer confirmation.");
 };
 const submit=(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(errors.length||!contact.name.trim()||!/^\S+@\S+\.\S+$/.test(contact.email)||!contact.postcode.trim())return;
  const payload={
   ...specification(config),
   customer:{name:contact.name.trim(),email:contact.email.trim(),postcode:contact.postcode.trim(),notes:contact.notes.slice(0,1000)},
   status:"demo-only-not-submitted",
  };
  downloadText("nitorix-gate-enquiry.json",JSON.stringify(payload,null,2),"application/json");
  setRequestSaved(true);
  setNotice("Demo enquiry saved to your device. No customer information has been transmitted to a manufacturer.");
 };
 return <div className="nx-gate">
  <header className="nx-gate-top">
   <div className="nx-gate-breadcrumb"><span>NITORIX</span><span>/</span><span>CONFIGURATOR LAB</span><span>/</span><strong>DRIVEWAY GATES</strong></div>
   <div className="nx-gate-lab-pill"><span/>Interactive manufacturer pilot · Not yet for sale</div>
  </header>
  <div className="nx-gate-intro">
   <div><span className="nx-eyebrow">INTRODUCING THE FIRST NITORIX SPECIALIST CONFIGURATOR</span>
    <h1>Made for <em>your entrance.</em></h1>
    <p>A made-to-measure driveway gate, designed by you. Explore precise proportions, architectural finishes and personalised hardware in real time.</p>
   </div>
   <div className="nx-gate-intro-meta"><span>01 / GATE DESIGN STUDIO</span><strong>Beautifully considered.<br/>Individually configured.</strong></div>
  </div>
  <div className="nx-gate-layout">
   <section className="nx-gate-stage" aria-label="Interactive gate visualisation">
    <div className="nx-gate-stage-toolbar">
     <span><span className="nx-gate-live"/>LIVE GEOMETRY</span>
     <div className="nx-gate-view-switch">
      <button type="button" aria-pressed={can3d} disabled={!webgl} onClick={()=>setElevation(false)}>3D orbit</button>
      <button type="button" aria-pressed={!can3d} onClick={()=>setElevation(true)}>Front elevation</button>
     </div>
    </div>
    <div className="nx-gate-canvas">
     {can3d?<GateScene config={config}/>:<div className="nx-gate-elevation"><GateElevation config={config}/></div>}
     <div className="nx-gate-visual-label">
      <span>{gateLines[config.line].name} collection</span>
      <strong>{gateFinishes[config.finish].name} / {config.opening==="double"?"Double swing":"Single swing"}</strong>
     </div>
    </div>
    <div className="nx-gate-stage-foot">
     <div><strong>{config.width.toLocaleString("en-GB")} × {config.height.toLocaleString("en-GB")} mm</strong><span>Clear opening × leaf height</span></div>
     <button type="button" onClick={()=>set("openPreview",!config.openPreview)} disabled={!can3d}
      aria-pressed={config.openPreview} className="nx-gate-open-button">
      {config.openPreview?"Close gate":"Open gate"} <span aria-hidden="true">↗</span>
     </button>
     <span className="nx-gate-orbit-hint">{can3d?"Drag to orbit · Scroll to zoom":"Front elevation · Not a fabrication drawing"}</span>
    </div>
   </section>
   <aside className="nx-gate-customizer" aria-label="Customise driveway gate">
    <div className="nx-gate-customizer-head">
     <span className="nx-eyebrow">CONFIGURE YOUR GATE</span><strong>01 <i>/</i> 05</strong>
    </div>
    <section className="nx-gate-option">
     <h2><span>01</span> Select your design</h2>
     <div className="nx-gate-style-options">
      {(Object.keys(gateLines) as GateLine[]).map(line=>
       <button key={line} type="button" aria-pressed={config.line===line}
        onClick={()=>set("line",line)}>
        <span className={`nx-gate-style-thumb nx-gate-style-${line}`} aria-hidden="true"><i/></span>
        <strong>{gateLines[line].name}</strong>
        <small>{gateLines[line].subtitle}</small>
       </button>
      )}
     </div>
    </section>
    <section className="nx-gate-option">
     <h2><span>02</span> Opening arrangement</h2>
     <div className="nx-gate-segments">
      <button type="button" aria-pressed={config.opening==="double"}
       onClick={()=>set("opening","double")}>Double leaf</button>
      <button type="button" aria-pressed={config.opening==="single"}
       onClick={()=>set("opening","single")}>Single leaf</button>
     </div>
     <small className="nx-gate-option-note">Single swing is limited to 3,000 mm in this pilot. Final hinge loads need engineering verification.</small>
    </section>
    <section className="nx-gate-option">
     <h2><span>03</span> Tailor the dimensions</h2>
     <div className="nx-gate-measure">
      <div><label htmlFor="nx-gate-width">Clear opening width</label><strong>{config.width.toLocaleString("en-GB")} <small>mm</small></strong></div>
      <input id="nx-gate-width" type="range" min={LIMITS.minWidth} max={maxWidth} step="50"
       value={config.width} onChange={event=>set("width",Number(event.target.value))}/>
      <div className="nx-gate-range"><span>{LIMITS.minWidth.toLocaleString("en-GB")} mm</span><span>{maxWidth.toLocaleString("en-GB")} mm</span></div>
     </div>
     <div className="nx-gate-measure">
      <div><label htmlFor="nx-gate-height">Gate leaf height</label><strong>{config.height.toLocaleString("en-GB")} <small>mm</small></strong></div>
      <input id="nx-gate-height" type="range" min={LIMITS.minHeight} max={LIMITS.maxHeight} step="50"
       value={config.height} onChange={event=>set("height",Number(event.target.value))}/>
      <div className="nx-gate-range"><span>{LIMITS.minHeight.toLocaleString("en-GB")} mm</span><span>{LIMITS.maxHeight.toLocaleString("en-GB")} mm</span></div>
     </div>
     <p className="nx-gate-option-note">Dimensions drive the actual 3D geometry. All size limits are demonstration rules, not certified manufacturing limits.</p>
    </section>
    <section className="nx-gate-option">
     <h2><span>04</span> Choose a finish</h2>
     <div className="nx-gate-finishes">
      {(Object.keys(gateFinishes) as GateFinish[]).map(finish=>
       <button type="button" key={finish} aria-pressed={config.finish===finish}
        onClick={()=>set("finish",finish)}>
        <span className="nx-gate-swatch" style={{background:gateFinishes[finish].hex}}/>
        <span>{gateFinishes[finish].name}</span>
       </button>
      )}
     </div>
    </section>
    <section className="nx-gate-option">
     <h2><span>05</span> Hardware</h2>
     <div className="nx-gate-segments">
      <button type="button" aria-pressed={config.hardware==="manual"}
       onClick={()=>set("hardware","manual")}>Manual swing</button>
      <button type="button" aria-pressed={config.hardware==="automation-ready"}
       onClick={()=>set("hardware","automation-ready")}>Automation-ready</button>
     </div>
     <small className="nx-gate-option-note">Automation-ready represents preparation only, not a motor, installation or safety certification.</small>
    </section>
    <section className="nx-gate-pricing" aria-label="Illustrative price estimate">
     <span className="nx-eyebrow">LIVE ILLUSTRATIVE ESTIMATE</span>
     <div className="nx-gate-total"><strong>{currency(price.total)}</strong><span>inc. illustrative 20% VAT</span></div>
     <div className="nx-gate-price-items">
      {price.items.map(item=><div key={item.label}><span>{item.label}</span><strong>{currency(item.amount)}</strong></div>)}
      <div><span>Subtotal</span><strong>{currency(price.subtotal)}</strong></div>
      <div><span>Illustrative VAT (20%)</span><strong>{currency(price.vat)}</strong></div>
     </div>
     <button type="button" className="nx-gate-quote-button" onClick={()=>setShowQuote(true)}>
      Prepare enquiry <span aria-hidden="true">↗</span>
     </button>
     <p>This is a fictional price model. No live manufacturer quote, order or payment is available.</p>
    </section>
   </aside>
  </div>
  <div className="nx-gate-secondary">
   <div><span className="nx-eyebrow">YOUR DESIGN. YOUR SPECIFICATION.</span>
    <h2>Built around the details.</h2>
    <p>Every choice updates the 3D model and the illustrative pricing rules. Download the configuration or copy a link to revisit this design.</p>
   </div>
   <div className="nx-gate-actions">
    <button type="button" onClick={()=>void share()}>Copy configuration link <span aria-hidden="true">↗</span></button>
    <button type="button" onClick={download}>Download specification <span aria-hidden="true">↓</span></button>
    <button type="button" onClick={()=>{
     setConfig(defaults);setNotice("Restored original demonstration design.");setRequestSaved(false);
    }}>Reset design</button>
   </div>
  </div>
  {notice&&<p className="nx-gate-notice" role="status">{notice}</p>}
  <div className="nx-gate-bottom-note">NITORIX SPECIALIST LAB · FICTIONAL PRODUCT DEMONSTRATION · ALL ENGINEERING, PRICING AND AVAILABILITY SUBJECT TO MANUFACTURER VERIFICATION</div>
  {showQuote&&<div className="nx-gate-modal-backdrop">
   <div className="nx-gate-quote-dialog" role="dialog" aria-modal="true" aria-label="Prepare gate enquiry">
    <div className="nx-gate-dialog-head"><div><span className="nx-eyebrow">YOUR PROJECT SUMMARY</span><h2>Make it yours.</h2></div>
     <button type="button" aria-label="Close enquiry" onClick={()=>{setShowQuote(false);setRequestSaved(false);}}>×</button>
    </div>
    <p>{gateLines[config.line].name} · {config.width} × {config.height} mm · {gateFinishes[config.finish].name}</p>
    <strong className="nx-gate-dialog-price">{currency(price.total)} <small>illustrative inc. VAT</small></strong>
    <form onSubmit={submit}>
     <label>Full name <input value={contact.name} maxLength={80} onChange={e=>setContact(p=>({...p,name:e.target.value}))} required/></label>
     <label>Email address <input type="email" value={contact.email} maxLength={120} onChange={e=>setContact(p=>({...p,email:e.target.value}))} required/></label>
     <label>Project postcode <input value={contact.postcode} maxLength={12} onChange={e=>setContact(p=>({...p,postcode:e.target.value}))} required/></label>
     <label>Installation notes <textarea value={contact.notes} maxLength={1000} rows={3} onChange={e=>setContact(p=>({...p,notes:e.target.value}))}/></label>
     <button className="nx-gate-quote-button" type="submit">Download enquiry for review</button>
    </form>
    <p className="nx-gate-modal-note">{requestSaved?"Enquiry downloaded to this device. Nothing was sent.":"This test doesn't send information, process orders or save personal data to a server. Your enquiry downloads as a JSON file."}</p>
   </div>
  </div>}
 </div>;
}

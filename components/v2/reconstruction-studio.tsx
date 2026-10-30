"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { putModelAsset, validateGlbFile } from "@/lib/studio/model-assets";
import {
  imageToDataUri, loadReferences, removeReference, saveReference, suggestMaterialReferences, REFERENCE_EVENT,
  type ReferenceMaterial,
} from "@/lib/reconstruction/material-library";

const Viewer = dynamic(() => import("../imported-model-viewer"), { ssr: false });

type Photo = { name: string; uri: string };
type GeneratedJob = { id: string; status: string; progress: number; error?: string; hasModel?: boolean };
type Dimensions = { width: string; height: string; depth: string };
const initialDimensions = { width: "", height: "", depth: "" };
const accepted = "image/jpeg,image/png,image/webp";

async function api(url: string, key: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init, cache: "no-store",
    headers: {
      "x-nitorix-reconstruction-key": key,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(typeof error.error === "string" ? error.error : `Request failed (${response.status}).`);
  }
  return response;
}

export function ReconstructionStudio({
  productId, productName, saved,
}: { productId: string; productName: string; saved: boolean }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [references, setReferences] = useState<ReferenceMaterial[]>([]);
  const [suggestions,setSuggestions] = useState<Array<{reference:ReferenceMaterial;distance:number}>>([]);
  const [materialId, setMaterialId] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialPhoto,setMaterialPhoto] = useState<string | null>(null);
  const [materialPrompt, setMaterialPrompt] = useState("");
  const [materialMode, setMaterialMode] = useState<"original" | "library" | "description">("original");
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
  const [modelDimensions, setModelDimensions] = useState<[number,number,number] | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [configured, setConfigured] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<GeneratedJob | null>(null);
  const [result, setResult] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [webgl, setWebgl] = useState(false);
  const onDimensions = useCallback((size:[number,number,number])=>setModelDimensions(size),[]);
  const onModelError = useCallback((value:string)=>setError(value),[]);

  useEffect(() => {
    const update = () => setReferences(loadReferences());
    update();
    window.addEventListener(REFERENCE_EVENT, update);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    setWebgl(Boolean(context)); // eslint-disable-line react-hooks/set-state-in-effect
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    fetch("/api/reconstruction", {cache:"no-store"}).then(res=>res.json())
      .then(data=>setConfigured(data.configured === true))
      .catch(()=>setConfigured(false))
      .finally(()=>setLoadingConfig(false));
    return () => window.removeEventListener(REFERENCE_EVENT, update);
  }, []);

  useEffect(()=>{
    const photo=photos[0]?.uri;
    if(!photo || !references.length)return;
    let active=true;
    suggestMaterialReferences(photo,references)
      .then(matches=>{if(active)setSuggestions(matches);})
      .catch(()=>{if(active)setSuggestions([]);});
    return ()=>{active=false;};
  },[photos,references]);
  const selectedReference = references.find(reference => reference.id === materialId);
  const dims = Object.values(dimensions);
  const sizesValid = dims.every(size => !size || (Number.isFinite(Number(size)) && Number(size)>0 && Number(size)<100_000));

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    try {
      const selected = Array.from(files).slice(0,4);
      if (files.length > 4) throw new Error("Select at most four photographs of the same product.");
      const prepared = await Promise.all(selected.map(async file => ({name:file.name,uri:await imageToDataUri(file)})));
      setPhotos(previous=>{
        const next = [...previous,...prepared];
        if (next.length > 4) {
          setNotice("Only four photos are supported; the extra views were not included.");
          return previous;
        }
        return next;
      });
      setResult(previous=>{if(previous)URL.revokeObjectURL(previous.url);return null;});
      setJob(null);
    } catch(e) { setError(e instanceof Error ? e.message : "Photographs could not be prepared."); }
  }

  function reset() {
    setPhotos([]);setJob(null);
    setResult(previous=>{if(previous)URL.revokeObjectURL(previous.url);return null;});
    setError("");setNotice("");setModelDimensions(null);
  }

  async function generate() {
    if (!saved) {setError("Save the product draft first.");return;}
    if (!photos.length) {setError("Add at least one product photograph.");return;}
    if (!sizesValid) {setError("Dimensions must be positive measurements in millimetres.");return;}
    if (materialMode==="library" && !selectedReference) {setError("Choose an approved reference material.");return;}
    if (materialMode==="description" && !materialPrompt.trim()) {setError("Describe the desired surface finish.");return;}
    setError("");setNotice("");setBusy(true);setJob(null);
    try {
      const response = await api("/api/reconstruction", accessKey, {
        method:"POST",
        body:JSON.stringify({
          images: photos.map(photo=>photo.uri),
          textureReference: materialMode==="library" ? selectedReference?.image : undefined,
          texturePrompt: materialMode==="description" ? materialPrompt.trim() : undefined,
        }),
      });
      const data = await response.json() as GeneratedJob;
      setJob({id:data.id,status:"PENDING",progress:0});
      setNotice("Reconstruction submitted. The provider will process the photographs and generate textured geometry.");
    } catch(e) {setError(e instanceof Error ? e.message : "Could not begin reconstruction.");}
    finally {setBusy(false);}
  }

  useEffect(()=>{
    if (!job || !["PENDING","IN_PROGRESS"].includes(job.status) || !accessKey) return;
    let cancelled=false;
    let timer:ReturnType<typeof setTimeout>;
    async function poll(){
      try {
        const response = await api(`/api/reconstruction/${encodeURIComponent(job!.id)}`, accessKey);
        const latest = await response.json() as GeneratedJob;
        if(cancelled)return;
        setJob(latest);
        if(latest.status==="FAILED" || latest.status==="CANCELED")setError(latest.error ?? "The reconstruction service could not complete this model.");
        else if(["PENDING","IN_PROGRESS"].includes(latest.status))
          timer=setTimeout(poll,7500);
      }catch(e){
        if(!cancelled)setError(e instanceof Error?e.message:"Could not check reconstruction progress.");
      }
    }
    timer=setTimeout(poll,3000);
    return ()=>{cancelled=true;clearTimeout(timer);};
  },[job?.id,job?.status,accessKey]);

  async function loadGeneratedModel() {
    if(!job?.id || job.status!=="SUCCEEDED")return;
    setBusy(true);setError("");
    try {
      const response=await api(`/api/reconstruction/${encodeURIComponent(job.id)}/model`, accessKey);
      const blob=await response.blob();
      const file=new File([blob],`nitorix-${productId}.glb`,{type:"model/gltf-binary"});
      await validateGlbFile(file);
      const url=URL.createObjectURL(file);
      setResult(previous=>{if(previous)URL.revokeObjectURL(previous.url);return {file,url};});
      setModelDimensions(null);
      setNotice("Model ready for inspection. Review geometry and texture before accepting.");
    } catch(e) {setError(e instanceof Error?e.message:"Could not download the model.");}
    finally {setBusy(false);}
  }

  async function approve() {
    if(!result || !saved)return;
    setSaving(true);setError("");
    try {
      await putModelAsset(productId,result.file,"m");
      setNotice("Approved for this browser's model library. Open Create to inspect it as your product. This does not publish the product or verify manufacturing specifications.");
    } catch(e){setError(e instanceof Error?e.message:"Could not save the model.");}
    finally{setSaving(false);}
  }

  async function addMaterial() {
    if(!materialPhoto)return;
    try {
      saveReference(materialName,productId,materialPhoto);
      setNotice("Material photograph saved to your browser's reference collection.");
      setMaterialName("");setMaterialPhoto(null);
    } catch(e){setError(e instanceof Error?e.message:"Could not save the material.");}
  }

  const modelMeasurements: Array<["width"|"height"|"depth",number]> = [["width",0],["height",1],["depth",2]];
  return (
    <section className="nx-recon" aria-label="NITORIX Reconstruction Engine">
      <div className="nx-recon-hero">
        <div>
          <span className="nx-eyebrow">NITORIX / RECONSTRUCTION STUDIO</span>
          <h2>Make anything <em>three-dimensional.</em></h2>
          <p>Give us photographs of your product. Select an approved material reference, add the dimensions you know, then generate a beautifully textured model for review.</p>
        </div>
        <span className="nx-recon-hero-icon" aria-hidden="true">✳</span>
      </div>
      <div className="nx-recon-steps">
        <span>01 · Capture</span><span>02 · Surfaces</span><span>03 · Reconstruct</span><span>04 · Approve</span>
      </div>
      <div className="nx-recon-section">
        <div className="nx-recon-heading">
          <div><span className="nx-eyebrow">01 / CAPTURE</span><h3>Show every side.</h3></div>
          <small>{photos.length} / 4 images</small>
        </div>
        <p>Choose up to four photos of the <strong>same physical product</strong>, ideally front, side, back and three-quarter views. Put the front photograph first. Different products are not interchangeable views.</p>
        <label className="nx-recon-upload">
          <span aria-hidden="true">+</span>
          <strong>Add product photographs</strong>
          <small>JPG, PNG or WebP · up to 4 photos · privately prepared in your browser</small>
          <input aria-label="Add product photographs" type="file" accept={accepted} multiple onChange={event=>{
            void addPhotos(event.currentTarget.files);event.currentTarget.value="";
          }}/>
        </label>
        {photos.length>0&&<div className="nx-recon-photos">
          {photos.map((photo,index)=><div className="nx-recon-photo" key={index}>
            <img src={photo.uri} alt={`Photo ${index+1} of ${productName}`}/>
            <span>{index===0?"Front reference":`Angle ${index+1}`}</span>
            <button type="button" aria-label={`Remove photo ${index+1}`} onClick={()=>setPhotos(prev=>prev.filter((_,i)=>i!==index))}>×</button>
          </div>)}
        </div>}
        <div className="nx-recon-dimensions">
          {(["width","height","depth"] as const).map(key=><label key={key}>{key} (mm)
            <input type="number" min="1" max="100000" step="1" placeholder="Optional" value={dimensions[key]}
              onChange={event=>setDimensions(prev=>({...prev,[key]:event.target.value}))}/>
          </label>)}
        </div>
        <p className="nx-recon-note">Dimensions are stored for comparison after generation. This pilot does not force the AI mesh to meet these measurements; discrepancies will be shown for review.</p>
      </div>
      <div className="nx-recon-section">
        <div className="nx-recon-heading">
          <div><span className="nx-eyebrow">02 / MATERIAL INTELLIGENCE</span><h3>Make the texture feel real.</h3></div>
          <small>{references.length} saved references</small>
        </div>
        <p>Borrow an approved fabric, grain or finish from your own reference collection. NITORIX sends the selected material image to guide surface generation, not as another geometric view.</p>
        {suggestions.length>0 && <div className="nx-recon-suggestions">
          <div className="nx-recon-heading">
            <div><span className="nx-eyebrow">SUGGESTED FROM YOUR CATALOGUE</span>
              <p>Similar colours and tonal textures found in your approved reference photos. Verify the material identity before using any suggestion.</p>
            </div>
          </div>
          <div className="nx-recon-suggestion-list">
            {suggestions.map(item=><button key={item.reference.id} type="button"
              onClick={()=>{setMaterialMode("library");setMaterialId(item.reference.id);}}
              aria-label={`Use ${item.reference.name} material reference`}>
              <img src={item.reference.image} alt=""/>
              <span><strong>{item.reference.name}</strong><small>{item.reference.productId}</small></span>
              <span aria-hidden="true">↗</span>
            </button>)}
          </div>
        </div>}
        <div className="nx-recon-switches" role="group" aria-label="Texture source">
          {([["original","Use product photographs"],["library","Reference material"],["description","Describe material"]] as const)
            .map(([id,label])=><button type="button" key={id} aria-pressed={materialMode===id} onClick={()=>setMaterialMode(id)}>{label}</button>)}
        </div>
        {materialMode==="library"&&<div className="nx-recon-library">
          {references.length===0?<p>No saved material photos yet. Add product photographs, name their material below, and save one for reuse.</p>:
            <div className="nx-recon-swatches">{references.map(item=><label key={item.id} className={materialId===item.id?"selected":""}>
              <input type="radio" name="material-reference" value={item.id} checked={materialId===item.id} onChange={()=>setMaterialId(item.id)}/>
              <img src={item.image} alt={`Reference ${item.name}`}/>
              <strong>{item.name}</strong><small>From {item.productId}</small>
              <button type="button" onClick={event=>{event.preventDefault();removeReference(item.id);if(materialId===item.id)setMaterialId("");}}>Remove</button>
            </label>)}</div>}
        </div>}
        {materialMode==="description"&&<label className="nx-recon-texture-prompt">Surface description
          <textarea rows={3} maxLength={600} value={materialPrompt} onChange={event=>setMaterialPrompt(event.target.value)}
            placeholder="e.g. Warm matte oak, fine natural grain, understated brushed brass fittings"/>
        </label>}
        <details className="nx-recon-save-material"><summary>Add a reusable material photograph to your reference library</summary>
          <p>Choose a dedicated close-up of an approved fabric, timber grain, leather or metal finish from your own catalogue. This is separate from the photographs used for reconstructing the product's shape.</p>
          <label>Material name
            <input value={materialName} maxLength={65} onChange={event=>setMaterialName(event.target.value)}
              placeholder="e.g. Fjord linen · Sand"/>
          </label>
          <label>Material close-up photograph
            <input type="file" accept={accepted} aria-label="Material close-up photograph" onChange={event=>{
              const file=event.currentTarget.files?.[0];
              if(file)void imageToDataUri(file,1000).then(setMaterialPhoto).catch(err=>setError(String(err)));
              event.currentTarget.value="";
            }}/>
          </label>
          {materialPhoto&&<img className="nx-recon-material-preview" src={materialPhoto} alt="Selected material close-up"/>}
          <button type="button" className="nx-button nx-secondary" disabled={!materialName.trim()||!materialPhoto} onClick={()=>void addMaterial()}>Add to material library</button>
        </details>
      </div>
      <div className="nx-recon-section">
        <div className="nx-recon-heading"><div><span className="nx-eyebrow">03 / GENERATION</span><h3>Reconstruct your product.</h3></div></div>
        {!loadingConfig && !configured && <p className="nx-recon-configuration">The real reconstruction service needs a Meshy API key and a separate private pilot access key configured on the server. No generation credits can be charged until it's connected.</p>}
        <div className="nx-recon-generate-grid">
          <div>
            <label className="nx-recon-key">Private pilot access key
              <input type="password" autoComplete="off" value={accessKey} onChange={event=>setAccessKey(event.target.value)}
                placeholder="Enter the pilot key"/>
            </label>
            <p className="nx-recon-note">Paid AI processing is explicitly started by you. Photos and chosen material references are sent to the reconstruction provider. Do not upload confidential designs without permission.</p>
          </div>
          <button type="button" className="nx-button nx-primary nx-recon-generate"
            disabled={!configured || !saved || !photos.length || !accessKey || busy || !sizesValid || (materialMode==="library"&&!selectedReference)}
            onClick={()=>void generate()}>{busy?"Preparing…":"Generate 3D model"}</button>
        </div>
        {!saved&&<p className="nx-recon-note">Save the selected product draft in Studio before generating a model.</p>}
        {job&&<div className="nx-recon-job" role="status">
          <div><strong>{job.status==="SUCCEEDED"?"Generation complete":job.status==="FAILED"?"Generation failed":"Reconstructing your product…"}</strong><span>{job.progress}%</span></div>
          <progress max={100} value={job.progress}/>
          {job.status==="SUCCEEDED"&&job.hasModel&&
            <button type="button" className="nx-button nx-secondary" disabled={busy} onClick={()=>void loadGeneratedModel()}>Load generated 3D model</button>}
        </div>}
      </div>
      <div className="nx-recon-section">
        <div className="nx-recon-heading"><div><span className="nx-eyebrow">04 / INSPECT & APPROVE</span><h3>Beautiful is only the beginning.</h3></div></div>
        {result?<div className="nx-recon-result">
          <div className="nx-recon-result-stage">{webgl?<Viewer url={result.url} units="m" onDimensions={onDimensions} onError={onModelError}/>:
            <div className="nx-model-fallback"><strong>WebGL required to preview this model</strong></div>}</div>
          <div className="nx-recon-review">
            <p>Review the front, back, silhouette and material against the photographs before saving. The AI may have inferred unseen surfaces.</p>
            {modelDimensions&&<div className="nx-recon-measurements">
              {modelMeasurements.map(([key,index])=>{
                const supplied=Number(dimensions[key]);
                const actual=modelDimensions[index];
                const percent=supplied>0?Math.abs(actual-supplied)/supplied*100:null;
                return <div key={key}><span>{key}</span>
                  <strong>{actual.toLocaleString("en-GB")} mm <small>model</small></strong>
                  {percent!==null&&<small className={percent>10?"nx-recon-discrepancy":""}>
                    Specified {supplied.toLocaleString("en-GB")} mm · {Math.round(percent)}% difference
                  </small>}
                </div>;
              })}
            </div>}
            <button type="button" className="nx-button nx-primary" disabled={saving||!webgl} onClick={()=>void approve()}>
              {saving?"Saving…":"Approve for model library"}
            </button>
            <p className="nx-recon-note">Approval saves this GLB into your local catalogue preview. It does not establish geometric precision, verified materials, manufacturer eligibility or any live listing.</p>
          </div>
        </div>:<div className="nx-recon-placeholder">
          <div aria-hidden="true" className="nx-recon-placeholder-orb"><span/></div>
          <strong>Your next product belongs here.</strong><p>Generated geometry, lifelike textures and a beautiful interactive review stage.</p>
        </div>}
      </div>
      {(error||notice)&&<div className={error?"nx-recon-message error":"nx-recon-message"} role="status">{error||notice}</div>}
      <div className="nx-recon-footer">
        <span>PRODUCT · {productName}</span>
        <button type="button" onClick={reset} disabled={busy||saving}>Clear current capture</button>
      </div>
    </section>
  );
}

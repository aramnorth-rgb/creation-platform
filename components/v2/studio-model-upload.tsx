"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { deleteModelAsset, putModelAsset, readModelAsset, type ModelUnits } from "@/lib/studio/model-assets";
const Viewer = dynamic(()=>import("../imported-model-viewer"),{ssr:false});

export function StudioModelUpload({
  productId, saved,
}:{
  productId:string; saved:boolean;
}) {
  const [units,setUnits]=useState<ModelUnits>("m");
  const [model,setModel]=useState<{url:string;name:string;units:ModelUnits}|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [webgl,setWebgl]=useState(false);
  const [dimensions,setDimensions]=useState<[number,number,number]|null>(null);
  const onSize=useCallback((size:[number,number,number])=>setDimensions(size),[]);
  const onError=useCallback((error:string)=>setMessage(error),[]);

  useEffect(()=>{
    const canvas=document.createElement("canvas");
    const context=canvas.getContext("webgl2")||canvas.getContext("webgl");
    setWebgl(Boolean(context)); // eslint-disable-line react-hooks/set-state-in-effect
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  },[]);
  useEffect(()=>{
    let active=true;
    let objectUrl="";
    readModelAsset(productId).then((asset)=>{
      if(!asset||!active)return;
      objectUrl=URL.createObjectURL(asset.file);
      setModel({url:objectUrl,name:asset.file instanceof File ? asset.file.name : "Saved 3D model",units:asset.units});
      setUnits(asset.units);
    }).catch(()=>{});
    return ()=>{active=false; if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[productId]);

  const upload=async(file:File)=>{
    setBusy(true);setMessage("");setDimensions(null);
    try {
      await putModelAsset(productId,file,units);
      const url=URL.createObjectURL(file);
      setModel(previous=>{
        if(previous?.url.startsWith("blob:")) URL.revokeObjectURL(previous.url);
        return {url,name:file.name,units};
      });
      setMessage("3D model saved in this browser. Preview it here or open this product in Create.");
    }catch(e){setMessage(e instanceof Error?e.message:"Unable to open this model.");}
    finally {setBusy(false);}
  };

  return (
    <section className="nx-model-import" aria-label="3D model library">
      <span className="nx-eyebrow">3D ASSET LIBRARY</span>
      <div className="nx-model-import-title">
        <div>
          <h3>Your product, beautifully presented.</h3>
          <p>Add a self-contained .glb model with its original textures. We'll frame it, light it and let you orbit and zoom. Maximum 30 MB.</p>
        </div>
        <span className="nx-status-pill">Private browser preview</span>
      </div>
      {!saved ? (
        <p className="nx-model-warning">Save this product draft before adding a model. The model is associated with its saved product ID.</p>
      ):(
        <div className="nx-model-import-grid">
          <div className="nx-model-import-settings">
            <label>Model measurement units
              <select value={units} onChange={(e)=>setUnits(e.target.value as ModelUnits)}>
                <option value="m">Metres (standard glTF)</option>
                <option value="cm">Centimetres</option>
                <option value="mm">Millimetres</option>
              </select>
            </label>
            <label className="nx-model-file">Choose 3D model (.glb)
              <input type="file" accept=".glb,model/gltf-binary" disabled={busy}
                onChange={(e)=>{const file=e.currentTarget.files?.[0];if(file) void upload(file);e.currentTarget.value="";}}/>
            </label>
            <p className="nx-model-notice">Only upload models you own or are licensed to use. Imported models are visual previews, not certified manufacturing geometry.</p>
            {model && (
              <button type="button" className="nx-button nx-secondary" onClick={async()=>{
                try {
                  await deleteModelAsset(productId);
                  if(model.url.startsWith("blob:")) URL.revokeObjectURL(model.url);
                  setModel(null);setDimensions(null);setMessage("Local 3D model removed.");
                } catch(e){setMessage(e instanceof Error?e.message:"Unable to remove model.");}
              }}>Remove model</button>
            )}
          </div>
          {model ? (
            <div className="nx-model-import-preview">
              <div className="nx-model-import-stage">{webgl ? <Viewer key={model.url} url={model.url} units={model.units} onDimensions={onSize} onError={onError}/> : <div className="nx-model-fallback"><strong>3D preview unavailable</strong><p>Enable WebGL or hardware acceleration to view this model.</p></div>}</div>
              <div className="nx-model-stage-caption"><strong>{model.name}</strong><span>{dimensions ? dimensions.map((n)=>`${n} mm`).join(" × ") : "Drag to rotate · scroll to zoom"}</span></div>
            </div>
          ) : (
            <div className="nx-model-empty">
              <span className="nx-model-empty-object" aria-hidden="true">◌</span>
              <strong>A studio for whatever you make.</strong>
              <p>Your uploaded product will appear here.</p>
            </div>
          )}
        </div>
      )}
      {message && <p className="nx-model-feedback" role="status">{message}</p>}
    </section>
  );
}

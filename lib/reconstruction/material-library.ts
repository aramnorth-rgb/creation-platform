"use client";

export type ReferenceMaterial = {
  id: string;
  name: string;
  productId: string;
  createdAt: number;
  image: string; // manufacturer supplied reference image, not inferred geometry
};
const KEY = "nitorix-v2-material-references-v1";
const EVENT = "nitorix-material-references-change";
const MAX_RECORDS = 24;

export function loadReferences(): ReferenceMaterial[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data)
      ? data.filter((item): item is ReferenceMaterial =>
        Boolean(item && typeof item.id === "string" && typeof item.name === "string" &&
        typeof item.productId === "string" && typeof item.image === "string" &&
        item.image.startsWith("data:image/") && item.image.length < 1_750_000))
        .slice(0, MAX_RECORDS)
      : [];
  } catch { return []; }
}
function persist(items: ReferenceMaterial[]) {
  if (items.length > MAX_RECORDS) throw new Error("The local material library holds up to 24 references.");
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    throw new Error("Could not save this material. Browser storage may be full.");
  }
}
export function saveReference(name: string, productId: string, image: string) {
  if (!name.trim() || name.length > 65) throw new Error("Give the material a short name.");
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 1_750_000)
    throw new Error("Material photograph is too large for local storage.");
  const current = loadReferences();
  persist([{
    id: crypto.randomUUID(), name: name.trim(), productId,
    createdAt: Date.now(), image,
  }, ...current]);
}
export function removeReference(id: string) {
  persist(loadReferences().filter(item => item.id !== id));
}
export const REFERENCE_EVENT = EVENT;

/** Resize BEFORE sending photographs to the external generation provider. */
export async function imageToDataUri(file: File, edge = 1200): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Use a JPEG, PNG or WebP photograph.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Image exceeds 20 MB. Please choose a smaller file.");
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare this photo.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.86);
    if (data.length > 1_750_000)
      throw new Error("This photo is too detailed. Try a smaller or compressed original.");
    return data;
  } finally { bitmap.close(); }
}


type ColourSignature = { red:number; green:number; blue:number; variation:number; texture:number };
/** Lightweight on-device comparison: chromatic similarity and tonal variation, NOT material recognition. */
async function signature(dataUri: string): Promise<ColourSignature> {
  const response = await fetch(dataUri);
  const bitmap = await createImageBitmap(await response.blob());
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 20; canvas.height = 20;
    const context = canvas.getContext("2d", {willReadFrequently:true});
    if (!context) throw new Error("Image comparison is unavailable.");
    context.drawImage(bitmap,0,0,20,20);
    const rgba = context.getImageData(0,0,20,20).data;
    let r=0,g=0,b=0,total=0,variance=0,edges=0;
    const levels:number[]=[];
    for(let index=0;index<rgba.length;index+=4){
      const rr=rgba[index],gg=rgba[index+1],bb=rgba[index+2];
      r+=rr;g+=gg;b+=bb;levels.push((rr+gg+bb)/3);total++;
    }
    const mean=levels.reduce((sum,value)=>sum+value,0)/total;
    for(let i=0;i<levels.length;i++){
      variance+=(levels[i]-mean)**2;
      if(i%20!==19)edges+=Math.abs(levels[i]-levels[i+1]);
    }
    return {red:r/total,green:g/total,blue:b/total,
      variation:Math.sqrt(variance/total),texture:edges/(total-20)};
  }finally{bitmap.close();}
}
export async function suggestMaterialReferences(
  sourceImage: string, references: ReferenceMaterial[],
): Promise<Array<{reference:ReferenceMaterial;distance:number}>> {
  if (!sourceImage || !references.length) return [];
  const base=await signature(sourceImage);
  const comparisons=await Promise.all(references.map(async reference=>{
    try{
      const candidate=await signature(reference.image);
      const colour=Math.sqrt((base.red-candidate.red)**2+
        (base.green-candidate.green)**2+(base.blue-candidate.blue)**2);
      const structure=Math.abs(base.variation-candidate.variation)*0.6+
        Math.abs(base.texture-candidate.texture)*0.4;
      return {reference,distance:colour+structure};
    }catch{return null;}
  }));
  return comparisons.filter((item):item is {reference:ReferenceMaterial;distance:number}=>item!==null)
    .sort((left,right)=>left.distance-right.distance).slice(0,3);
}

import "server-only";
import {timingSafeEqual} from "node:crypto";

const IMAGE=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const TASK_ID=/^(local_)?[a-zA-Z0-9_-]{8,100}$/;

export function accessAllowed(request:Request):boolean {
 const secret=process.env.NITORIX_RECONSTRUCTION_ACCESS_KEY;
 const supplied=request.headers.get("x-nitorix-reconstruction-key");
 if(!secret||secret.length<32||!supplied)return false;
 const a=Buffer.from(secret,"utf8"),b=Buffer.from(supplied,"utf8");
 return a.length===b.length&&timingSafeEqual(a,b);
}
export function noStoreJson(value:unknown,status=200){
 return Response.json(value,{status,headers:{"Cache-Control":"no-store"}});
}
export function badRequest(error:string,status=400){return noStoreJson({error},status);}
export function isTaskId(id:unknown):id is string {
 return typeof id==="string"&&TASK_ID.test(id);
}
export type PhotoCapture={images:string[];textureReference?:string|null;texturePrompt?:string|null};
export function validateInput(value:unknown):PhotoCapture{
 if(!value||typeof value!=="object")throw Error("Invalid reconstruction request.");
 const {images,textureReference,texturePrompt}=value as Partial<PhotoCapture>;
 if(!Array.isArray(images)||images.length<1||images.length>4||
   images.some(img=>typeof img!=="string"||img.length>1_750_000||!IMAGE.test(img)))
  throw Error("Choose 1–4 small JPEG, PNG or WebP product photographs.");
 if(images.join("").length>5_000_000)throw Error("Please compress the product photographs.");
 if(textureReference&&(!IMAGE.test(textureReference)||textureReference.length>1_750_000))
  throw Error("Invalid texture reference photograph.");
 if(texturePrompt&&(typeof texturePrompt!=="string"||texturePrompt.length>600))
  throw Error("Texture description is too long.");
 return {images,textureReference,texturePrompt};
}

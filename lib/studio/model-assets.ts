/**
 * Local GLB model files are stored in IndexedDB, never in the tiny localStorage
 * product metadata record. No backend, account, publishing or remote upload.
 * Only self-contained .glb files (not .gltf with external dependencies).
 */
const DB_NAME = "nitorix-v2-model-assets";
const STORE = "models";
const VERSION = 1;
export const MAX_GLB_BYTES = 12 * 1024 * 1024;
export type ModelUnits = "m" | "cm" | "mm";
export type StoredModel = { file: Blob; name: string; units: ModelUnits };

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Local model storage is unavailable in this browser."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onerror = () => reject(new Error("Could not open browser model storage."));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function validateGlbFile(file: File) {
  if (!/\.glb$/i.test(file.name)) throw new Error("Please select a self-contained .glb 3D model.");
  if (file.size < 20 || file.size > MAX_GLB_BYTES) throw new Error("Model must be a GLB smaller than 12 MB.");
  const header = new DataView(await file.slice(0, 20).arrayBuffer());
  if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== file.size) {
    throw new Error("This does not appear to be a valid glTF 2.0 binary file.");
  }
  if (header.getUint32(16, true) !== 0x4e4f534a) throw new Error("GLB metadata is missing.");
  const size = header.getUint32(12, true);
  if (size > 2000000 || size + 20 > file.size) throw new Error("GLB metadata is too large or incomplete.");
  const json = JSON.parse(new TextDecoder().decode(await file.slice(20,20+size).arrayBuffer()));
  if (!Array.isArray(json.meshes) || !json.meshes.length) throw new Error("This model has no meshes.");
  if ((json.images ?? []).some((x: {uri?: string}) => typeof x.uri === "string" && !x.uri.startsWith("data:")) || (json.buffers ?? []).some((x: {uri?: string}) => typeof x.uri === "string" && !x.uri.startsWith("data:"))) throw new Error("Please embed every texture and buffer into one .glb file.");
  if ((json.extensionsRequired ?? []).some((x: string) => ["KHR_draco_mesh_compression","EXT_meshopt_compression","KHR_texture_basisu"].includes(x))) throw new Error("Please export an uncompressed GLB for this preview.");
}

export async function putModelAsset(id: string, file: File, units: ModelUnits = "m") {
  await validateGlbFile(file);
  if (!["m", "cm", "mm"].includes(units)) throw new Error("Unsupported measurement units.");
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({file, name: file.name, units}, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Model could not be stored. Browser storage may be full."));
      tx.onabort = () => reject(new Error("Model storage was interrupted."));
    });
  } finally { db.close(); }
}

export async function readModelAsset(id: string): Promise<StoredModel | null> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
      request.onsuccess = () => { const saved = request.result as StoredModel | Blob | undefined; resolve(saved instanceof Blob ? {file:saved,name:"Imported model",units:"m"} : saved?.file instanceof Blob ? saved : null); };
      request.onerror = () => reject(new Error("Could not read the saved model."));
    });
  } finally { db.close(); }
}

export async function deleteModelAsset(id: string) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Could not remove local 3D model."));
    });
  } finally { db.close(); }
}

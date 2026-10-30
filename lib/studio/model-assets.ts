/**
 * Local GLB model files are stored in IndexedDB, never in the tiny localStorage
 * product metadata record. No backend, account, publishing or remote upload.
 * Only self-contained .glb files (not .gltf with external dependencies).
 */
const DB_NAME = "nitorix-v2-model-assets";
const STORE = "models";
const VERSION = 1;
export const MAX_GLB_BYTES = 12 * 1024 * 1024;

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
  const header = new DataView(await file.slice(0, 12).arrayBuffer());
  if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== file.size) {
    throw new Error("This does not appear to be a valid glTF 2.0 binary file.");
  }
}

export async function putModelAsset(id: string, file: File) {
  await validateGlbFile(file);
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Model could not be stored. Browser storage may be full."));
      tx.onabort = () => reject(new Error("Model storage was interrupted."));
    });
  } finally { db.close(); }
}

export async function readModelAsset(id: string): Promise<Blob | null> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
      request.onerror = () => reject(new Error("Could not read the saved model."));
    });
  } finally { db.close(); }
}

import { newProduct, validateProduct, type ProductDraft } from "./product";

export type CatalogueImportResult = { products: ProductDraft[]; errors: string[] };

/**
 * Safe, synchronous CSV import for the supported desk-organiser demo adapter.
 * Accepts RFC4180-style quoted cells and line breaks; no remote files or scripts.
 */
function rowsFromCsv(input: string): string[][] {
  const source = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell.length > 0) {
        throw new Error("A CSV quote must begin a field.");
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error("The CSV contains an unfinished quoted value.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

export function importCatalogueCsv(source: string): CatalogueImportResult {
  const errors: string[] = [];
  if (source.length > 32768) return { products: [], errors: ["CSV exceeds the 32 KB local-demo limit."] };
  let rows: string[][];
  try { rows = rowsFromCsv(source); }
  catch (error) { return { products: [], errors: [(error as Error).message] }; }
  if (!rows.length) return { products: [], errors: ["CSV is empty."] };
  const headers = rows[0].map((s) => s.trim().toLowerCase());
  if (new Set(headers).size !== headers.length) errors.push("CSV has duplicate column headers.");
  for (const name of ["sku", "name"]) if (!headers.includes(name)) errors.push(`Missing required column: ${name}.`);
  if (errors.length) return { products: [], errors };
  const sku = headers.indexOf("sku"), name = headers.indexOf("name"), description = headers.indexOf("description");
  const records = rows.slice(1);
  if (!records.length) errors.push("Provide at least one catalogue row.");
  if (records.length > 28) errors.push("Import at most 28 products in this local demonstration.");
  const ids = new Set<string>();
  const products: ProductDraft[] = [];
  for (let i = 0; i < Math.min(records.length, 28); i++) {
    const row = records[i];
    if (row.length !== headers.length) {
      errors.push(`Row ${i + 2}: expected ${headers.length} columns.`);
      continue;
    }
    const productSku = row[sku].trim();
    const title = row[name].trim();
    const id = productSku.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 70).replace(/^-|-$/g, "");
    if (!id || !/^[a-z0-9-]+$/.test(id)) {
      errors.push(`Row ${i + 2}: SKU must contain letters or numbers.`);
      continue;
    }
    if (ids.has(id)) { errors.push(`Row ${i + 2}: duplicate SKU.`); continue; }
    ids.add(id);
    const product = newProduct(id);
    product.name = title;
    product.description = description >= 0 ? row[description].trim() : product.description;
    const validation = validateProduct(product);
    if (validation.length) errors.push(`Row ${i + 2}: ${validation.join("; ")}`);
    else products.push(product);
  }
  return { products: errors.length ? [] : products, errors };
}

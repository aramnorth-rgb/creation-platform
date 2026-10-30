"use client";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import DeskEmbed from "../desk-embed";
import { deskProduct, priceDesk, formatPrice } from "@/lib/configurator/desk";
import {
  newProduct,
  validateProduct,
  creationModes,
  approvedInitial,
  type ProductDraft,
} from "@/lib/studio/product";
import { saveProducts, useStudioProducts } from "@/lib/studio/store";
import { ProductArt } from "./product-art";
import { DemoCrm } from "./demo-crm";
import { StudioModelUpload } from "./studio-model-upload";
import { importCatalogueCsv } from "@/lib/studio/catalogue-import";
import { assessCapabilities, capabilityGroups, capabilityRequirements, blankCapabilityEvidence, modesAfterEvidenceChange, type EvidenceKey } from "@/lib/studio/capabilities";
const sections = [
  "Overview",
  "Products",
  "Configurator Builder",
  "Pricing",
  "Publishing",
  "Orders and Enquiries",
  "Analytics",
  "Business Settings",
];
function StudioIcon({ index }: { index: number }) {
  const paths = [
    "M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z",
    "M4 3h12v14H4zM4 8h12M9 8v9",
    "M3 3h5v5H3zM12 12h5v5h-5zM8 5h6v7",
    "M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4",
    "M10 14V3M6 7l4-4 4 4M4 12v5h12v-5",
    "M3 6h14v11H3zM6 6V3h8v3M3 10h14",
    "M3 17V4M3 17h14M7 14V9M11 14V5M15 14v-3",
    "M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M5 15l2-2M13 7l2-2",
  ];
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    >
      <path d={paths[index]} />
      {index === 7 && <circle cx="10" cy="10" r="4" />}
    </svg>
  );
}
export function StudioDashboard() {
  const products = useStudioProducts();
  const [section, setSection] = useState("Overview"),
    [editor, setEditor] = useState<ProductDraft>(() => newProduct()),
    [errors, setErrors] = useState<string[]>([]),
    [status, setStatus] = useState(""),
    [preview, setPreview] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement | null>(null);
  const [business, setBusiness] = useState({
    name: "Demo manufacturer",
    email: "",
  });
  const edit = (p: ProductDraft, destination = "Products") => {
    setEditor(structuredClone(p));
    setSection(destination);
    setErrors([]);
    setStatus("");
  };
  const change = <K extends keyof ProductDraft>(
    key: K,
    value: ProductDraft[K],
  ) => {
    setEditor((p) => ({ ...p, [key]: value }));
    setStatus("Unsaved local changes");
  };
  const toggle = <K extends "modes" | "materials" | "colours" | "modules">(
    key: K,
    value: ProductDraft[K][number],
  ) => {
    const items = editor[key] as string[];
    change(
      key,
      (items.includes(value)
        ? items.filter((v) => v !== value)
        : [...items, value]) as ProductDraft[K],
    );
  };
  const save = () => {
    const issues = validateProduct(editor);
    setErrors(issues);
    if (issues.length) {
      setStatus("Please resolve the validation details before saving.");
      return;
    }
    const exists = products.some((p) => p.id === editor.id);
    const next = exists
      ? products.map((p) => (p.id === editor.id ? structuredClone(editor) : p))
      : [...products, structuredClone(editor)];
    setStatus(
      saveProducts(next)
        ? "Draft saved on this browser only. Nothing is published."
        : "Could not save. Browser storage may be unavailable or the 30-draft limit was reached.",
    );
  };
  const add = () => {
    edit({
      ...newProduct(`product-${crypto.randomUUID().slice(0, 8)}`),
      name: "Untitled desk organiser",
    });
    setStatus(
      "New unsaved draft. The desk organiser is the supported model adapter.",
    );
  };
  const openPreview = (e: MouseEvent<HTMLButtonElement>) => {
    const issues = validateProduct(editor);
    setErrors(issues);
    if (issues.length) return;
    opener.current = e.currentTarget;
    setPreview(true);
    requestAnimationFrame(() => dialog.current?.showModal());
  };
  const exportDraft = () => {
    const issues = validateProduct(editor);
    setErrors(issues);
    if (issues.length) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(editor, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editor.id}-configurator.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const price = validateProduct(editor).length
    ? null
    : priceDesk(approvedInitial(editor), editor.pricing);
  const capabilities = assessCapabilities(editor);
  const evidence = editor.capabilityEvidence ?? blankCapabilityEvidence();
  const updateEvidence = (key: EvidenceKey, checked: boolean) => {
    const next = { ...evidence, [key]: checked };
    setEditor(p => ({ ...p, capabilityEvidence: next, modes: modesAfterEvidenceChange(p.modes, next) }));
    setStatus("Unpublished capability information changed. Save to keep it on this browser.");
  };
  const rules = (
    <>
      <div className="nx-editor-heading">
        <span className="nx-eyebrow">APPROVED CUSTOMER CAPABILITIES</span>
        <h3>The freedom you define.</h3>
        <p>
          These local rules are enforced in the shared demo engine. They are not
          manufacturing or safety validation.
        </p>
      </div>
      <section className="nx-capability-panel" aria-label="Product capability readiness">
        <div className="nx-capability-heading">
          <span className="nx-eyebrow">PROGRESSIVE PRODUCT ONBOARDING</span>
          <h3>Start simple. Unlock more when you're ready.</h3>
          <p>Confirm the product information you can provide. These checkboxes are your declarations, not independent NITORIX certifications. Images and AI-inferred geometry do not count as verified engineering specifications.</p>
        </div>
        <div className="nx-capability-levels">
          {capabilityGroups.map(group => {
            const state = capabilities.find(item => item.mode === group.mode);
            const missing = state?.missing.length ?? group.requirements.length;
            return (
              <article key={group.mode} className="nx-capability-level">
                <div className="nx-capability-level-head">
                  <div>
                    <span className="nx-eyebrow">{group.mode.toUpperCase()}</span>
                    <h4>{group.name}</h4>
                  </div>
                  <span className="nx-capability-progress">{state?.complete ? "Information supplied" : `${missing} outstanding`}</span>
                </div>
                <p>{group.introduction}</p>
                <div className="nx-capability-checks">
                  {group.requirements.map(requirement => (
                    <label key={requirement.key}>
                      <input
                        type="checkbox"
                        checked={Boolean(evidence[requirement.key])}
                        onChange={event => updateEvidence(requirement.key, event.target.checked)}
                      />
                      <span><strong>{requirement.label}</strong><small>{requirement.detail}</small></span>
                    </label>
                  ))}
                </div>
                <p className="nx-capability-footer">
                  {group.mode === "customise" && !state?.complete
                    ? "Customise preview stays available. Confirm these details before offering a product for sale."
                    : state?.complete
                    ? "This level can be enabled in Customer creation modes. Product and manufacturing verification remain separate."
                    : `Supply the missing information to unlock ${group.name}.`}
                </p>
              </article>
            );
          })}
        </div>
      </section>
      <div className="nx-rule-grid">
        <fieldset>
          <legend>Customer creation modes</legend>
          {creationModes.map((m) => {
            const status = capabilities.find(entry => entry.mode === m);
            const supported = m === "customise" || Boolean(status?.complete);
            return (
              <label key={m}>
                <input
                  type="checkbox"
                  checked={editor.modes.includes(m)}
                  disabled={!supported && !editor.modes.includes(m)}
                  onChange={() => toggle("modes", m)}
                />
                <span className="nx-capitalise">{m}</span>
                {!supported && <small>Needs manufacturer information</small>}
              </label>
            );
          })}
        </fieldset>
        <fieldset>
          <legend>Materials</legend>
          {Object.entries(deskProduct.materials).map(([id, m]) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={editor.materials.includes(
                  id as ProductDraft["materials"][number],
                )}
                onChange={() =>
                  toggle("materials", id as ProductDraft["materials"][number])
                }
              />
              {m.label}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Colours</legend>
          {Object.entries(deskProduct.colours).map(([id, hex]) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={editor.colours.includes(
                  id as ProductDraft["colours"][number],
                )}
                onChange={() =>
                  toggle("colours", id as ProductDraft["colours"][number])
                }
              />
              <i style={{ background: hex }} />
              {id}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Compatible modules</legend>
          {Object.entries(deskProduct.modules).map(([id, m]) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={editor.modules.includes(
                  id as ProductDraft["modules"][number],
                )}
                onChange={() =>
                  toggle("modules", id as ProductDraft["modules"][number])
                }
              />
              {m.name}
            </label>
          ))}
        </fieldset>
      </div>
      <fieldset className="nx-dimensions">
        <legend>Approved footprint range · mm</legend>
        {(
          [
            { key: "minWidth", label: "Minimum width" },
            { key: "maxWidth", label: "Maximum width" },
            { key: "minDepth", label: "Minimum depth" },
            { key: "maxDepth", label: "Maximum depth" },
          ] as const
        ).map((f) => (
          <label key={f.key}>
            {f.label}
            <input
              type="number"
              value={editor[f.key]}
              onChange={(e) => change(f.key, Number(e.target.value))}
            />
          </label>
        ))}
      </fieldset>
    </>
  );
  const pricing = (
    <>
      <div className="nx-editor-heading">
        <span className="nx-eyebrow">ONE SHARED PRICE CALCULATION</span>
        <h3>Make the numbers clear.</h3>
        <p>
          GBP demonstration prices only. Base and module amounts use integer
          pence. Material rates are GBP/cm³; module prices retain the existing
          material multiplier. No tax, delivery or quote service.
        </p>
      </div>
      <div className="nx-pricing-inputs">
        <label>
          Demo base fee (pence)
          <input
            type="number"
            min="0"
            max="100000"
            step="1"
            value={editor.pricing.basePence}
            onChange={(e) =>
              change("pricing", {
                ...editor.pricing,
                basePence: Number(e.target.value),
              })
            }
          />
        </label>
        {Object.entries(deskProduct.materials).map(([id, m]) => (
          <label key={id}>
            {m.label} rate (GBP/cm³)
            <input
              type="number"
              min="0"
              max="1"
              step="0.001"
              value={
                editor.pricing.materialRates[
                  id as keyof typeof deskProduct.materials
                ]
              }
              onChange={(e) =>
                change("pricing", {
                  ...editor.pricing,
                  materialRates: {
                    ...editor.pricing.materialRates,
                    [id]: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        ))}
        {Object.entries(deskProduct.modules).map(([id, m]) => (
          <label key={id}>
            {m.name} price (pence)
            <input
              type="number"
              min="0"
              max="100000"
              step="1"
              value={
                editor.pricing.modulePrices[
                  id as keyof typeof deskProduct.modules
                ]
              }
              onChange={(e) =>
                change("pricing", {
                  ...editor.pricing,
                  modulePrices: {
                    ...editor.pricing.modulePrices,
                    [id]: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="nx-example-price">
        <span>Approved initial configuration · demo total</span>
        <strong>
          {price ? formatPrice(price.totalPence) : "Resolve validation errors"}
        </strong>
      </div>
    </>
  );
  return (
    <div className="nx-studio-shell">
      <aside className="nx-studio-sidebar">
        <div className="nx-workspace-avatar">
          N
          <span>
            Demo workspace<small>BROWSER-LOCAL / NO ACCOUNT</small>
          </span>
        </div>
        <nav aria-label="Studio sections">
          {sections.map((s, i) => (
            <button
              key={s}
              aria-current={section === s ? "page" : undefined}
              onClick={() => {
                setSection(s);
                setErrors([]);
              }}
            >
              <span aria-hidden="true">
                <StudioIcon index={i} />
              </span>
              {s}
            </button>
          ))}
        </nav>
        <div className="nx-sidebar-note">
          <span className="nx-eyebrow">TRY FIRST, SELL SECOND.</span>
          <p>
            Build a local draft. Explore the possibilities. No commitment
            required.
          </p>
          <Link href="/manufacturers#founding">Founding programme </Link>
        </div>
      </aside>
      <main id="content" className="nx-studio-main">
        <div className="nx-studio-top">
          <span className="nx-eyebrow">
            NITORIX STUDIO / {section.toUpperCase()}
          </span>
          <span className="nx-status-pill">Interactive demo</span>
        </div>
        <div className="nx-studio-title">
          <div>
            <h1>
              {section === "Overview" ? "A good place to begin." : section}
            </h1>
            <p>
              {section === "Overview"
                ? "Your products. Your possibilities. A workspace for what comes next."
                : "Local prototype workspace · no secure account or cloud services connected."}
            </p>
          </div>
          {[
            "Products",
            "Configurator Builder",
            "Pricing",
            "Publishing",
          ].includes(section) && (
            <button className="nx-button nx-primary" onClick={save}>
              Save draft
            </button>
          )}
        </div>
        <p className="nx-studio-disclosure">
          Functional: browser-local product drafts, approved options, pricing,
          previews and validation. Planned: accounts, file uploads, cloud
          storage, publishing, enquiries and commerce. Browser storage is not a
          private manufacturer account.
        </p>
        {status && (
          <p className="nx-save-status" role="status">
            {status}
          </p>
        )}
        {errors.length > 0 && (
          <div
            className="nx-error"
            role="alert"
            aria-label="Product validation errors"
          >
            <strong>Check your product rules</strong>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {section === "Overview" && (
          <>
            <div className="nx-stats">
              <article>
                <span>Local product drafts</span>
                <strong>{products.length.toString().padStart(2, "0")}</strong>
                <small>Saved in this browser after Save</small>
              </article>
              <article>
                <span>Supported model adapter</span>
                <strong>01</strong>
                <small>Modular desk organiser</small>
              </article>
              <article>
                <span>Live products</span>
                <strong>—</strong>
                <small>Publishing is not connected</small>
              </article>
            </div>
            <section className="nx-studio-welcome">
              <div>
                <span className="nx-eyebrow">FROM PRODUCT TO POSSIBILITY</span>
                <h2>
                  Put your expertise
                  <br />
                  <em>into the experience.</em>
                </h2>
                <p>
                  Define a product, choose the options you approve and see it
                  come to life in the same configurator your customers will use.
                </p>
                <button
                  className="nx-button nx-primary"
                  onClick={() => setSection("Products")}
                >
                  Manage demo products
                </button>
              </div>
              <ProductArt kind="desk" />
            </section>
            <section className="nx-workflow">
              <h2>Your intended workflow</h2>
              <ol>
                {[
                  "Upload product information",
                  "Configure permitted options",
                  "Preview",
                  "Validate",
                  "Publish",
                ].map((s, i) => (
                  <li key={s}>
                    <span>0{i + 1}</span>
                    <h3>{s}</h3>
                    <small>
                      {
                        [
                          "Manual entry works; uploads planned",
                          "Working local rules",
                          "Working interactive preview",
                          "Demo rule checks only",
                          "Not connected",
                        ][i]
                      }
                    </small>
                  </li>
                ))}
              </ol>
            </section>
            <div className="nx-studio-recent">
              <h2>Start with a product</h2>
              {products.map((p) => (
                <button key={p.id} onClick={() => edit(p)}>
                  <span>
                    {p.name}
                    <small>{p.modes.length} creation modes · local draft</small>
                  </span>
                  <i></i>
                </button>
              ))}
            </div>
          </>
        )}
        {section === "Products" && (
          <>
            <div className="nx-product-manager">
              <div className="nx-manager-heading">
                <h2>Your demo collection</h2>
                <button className="nx-button nx-secondary" onClick={add}>
                  ＋ Add product draft
                </button>
              </div>
              <div className="nx-catalogue-import">
                <span className="nx-eyebrow">CSV CATALOGUE ONBOARDING · LOCAL DEMO</span>
                <h3>Bring in a small product collection.</h3>
                <p>Import a CSV with <code>sku,name,description</code> columns. Each row becomes a local product draft using the current desk-organiser model. No photos or files are uploaded to a server, and no arbitrary products are turned into 3D automatically.</p>
                <label>
                  Import catalogue CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={async (event) => {
                      const input = event.currentTarget;
                      const file = input.files?.[0];
                      if (!file) return;
                      if (file.size > 32768) {
                        setErrors(["CSV exceeds the 32 KB local-demo limit."]);
                        setStatus("Import rejected.");
                        input.value = "";
                        return;
                      }
                      try {
                        const parsed = importCatalogueCsv(await file.text());
                        const duplicates = parsed.products
                          .filter((p) => products.some((existing) => existing.id === p.id))
                          .map((p) => `SKU ${p.id} already exists in this browser.`);
                        const issues = [...parsed.errors, ...duplicates];
                        if (products.length + parsed.products.length > 30)
                          issues.push("The local demo supports at most 30 product drafts.");
                        setErrors(issues);
                        if (issues.length) setStatus("Import rejected. No drafts were changed.");
                        else setStatus(saveProducts([...products, ...parsed.products])
                          ? `${parsed.products.length} catalogue drafts imported to this browser only.`
                          : "Import could not be saved in browser storage.");
                      } catch {
                        setErrors(["The CSV could not be read."]);
                        setStatus("Import rejected.");
                      }
                      input.value = "";
                    }}
                  />
                </label>
              </div>
              {products.map((p) => (
                <article key={p.id}>
                  <div className="nx-studio-product-thumb">
                    <ProductArt kind="desk" />
                  </div>
                  <div>
                    <h3>{p.name}</h3>
                    <p>
                      Desk organiser adapter · {p.materials.length} materials ·{" "}
                      {p.modes.length} modes
                    </p>
                    <span className="nx-status-pill">Local draft</span>
                  </div>
                  <button aria-label={`Edit ${p.name}`} onClick={() => edit(p)}>
                    Edit
                  </button>
                  <button
                    aria-label={`Duplicate ${p.name}`}
                    onClick={() => {
                      edit({
                        ...structuredClone(p),
                        id: `product-${crypto.randomUUID().slice(0, 8)}`,
                        name: `${p.name.slice(0, 90)} copy`,
                      });
                      setStatus(
                        "Duplicate prepared. Save to add it to your collection.",
                      );
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    aria-label={`Delete ${p.name}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete the local demo draft “${p.name}”?`,
                        )
                      ) {
                        const saved = saveProducts(
                          products.filter((v) => v.id !== p.id),
                        );
                        setStatus(
                          saved
                            ? "Local draft deleted. No live product was changed."
                            : "Deletion could not be saved.",
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
            <section className="nx-editor-card">
              <div className="nx-editor-title">
                <span className="nx-eyebrow">
                  PRODUCT INFORMATION / UNSAVED UNTIL SAVE
                </span>
                <h2>{editor.name}</h2>
              </div>
              <div className="nx-information-grid">
                <label>
                  Product name
                  <input
                    maxLength={100}
                    value={editor.name}
                    onChange={(e) => change("name", e.target.value)}
                  />
                </label>
                <label>
                  Model adapter
                  <input value="Modular desk organiser · v1" readOnly />
                </label>
                <label className="nx-wide">
                  Product description
                  <textarea
                    maxLength={1000}
                    rows={3}
                    value={editor.description}
                    onChange={(e) => change("description", e.target.value)}
                  />
                </label>
              </div>
              <StudioModelUpload
                key={editor.id}
                productId={editor.id}
                saved={products.some((p) => p.id === editor.id)}
              />
              <div className="nx-editor-actions">
                <button
                  className="nx-button nx-secondary"
                  onClick={() => setSection("Configurator Builder")}
                >
                  Configure permitted options
                </button>
                <button className="nx-text-link" onClick={openPreview}>
                  Preview this draft
                </button>
              </div>
            </section>
          </>
        )}
        {section === "Configurator Builder" && (
          <section className="nx-editor-card">
            <label className="nx-product-select">
              Working product
              <select
                value={
                  products.some((p) => p.id === editor.id)
                    ? editor.id
                    : "unsaved"
                }
                onChange={(e) => {
                  const p = products.find((p) => p.id === e.target.value);
                  if (p) edit(p, "Configurator Builder");
                }}
              >
                {!products.some((p) => p.id === editor.id) && (
                  <option value="unsaved">Unsaved draft: {editor.name}</option>
                )}
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {rules}
            <div className="nx-editor-actions">
              <button className="nx-button nx-primary" onClick={openPreview}>
                Preview permitted experience
              </button>
              <button
                className="nx-button nx-secondary"
                onClick={() => {
                  const issues = validateProduct(editor);
                  setErrors(issues);
                  setStatus(
                    issues.length
                      ? "Validation found issues."
                      : "Demo configuration rules valid. This is not manufacturing validation.",
                  );
                }}
              >
                Validate demo rules
              </button>
            </div>
          </section>
        )}
        {section === "Pricing" && (
          <section className="nx-editor-card">
            <span className="nx-status-pill">Editing: {editor.name}</span>
            {pricing}
            <button className="nx-button nx-primary" onClick={openPreview}>
              Preview demo pricing
            </button>
          </section>
        )}
        {section === "Publishing" && (
          <section className="nx-editor-card">
            <span className="nx-eyebrow">A FUTURE HOME FOR YOUR PRODUCTS</span>
            <h2>
              On your website.
              <br />
              <em>In the NITORIX marketplace.</em>
            </h2>
            <p>
              Choose local publishing preferences for {editor.name}. These do
              not create a listing or expose the draft publicly.
            </p>
            <div className="nx-publishing-options">
              {(
                [
                  {
                    key: "marketplace",
                    name: "NITORIX marketplace",
                    text: "Help people discover and personalise your products.",
                  },
                  {
                    key: "website",
                    name: "Your own website",
                    text: "Bring the same engine into your customer experience.",
                  },
                ] as const
              ).map((p) => (
                <label key={p.key}>
                  <input
                    type="checkbox"
                    checked={editor.channels[p.key]}
                    onChange={(e) =>
                      change("channels", {
                        ...editor.channels,
                        [p.key]: e.target.checked,
                      })
                    }
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.text}</small>
                  </span>
                </label>
              ))}
            </div>
            <div className="nx-editor-actions">
              <button className="nx-button nx-secondary" onClick={exportDraft}>
                Export draft JSON
              </button>
              <button className="nx-button nx-secondary" onClick={openPreview}>
                Preview locally
              </button>
              <button className="nx-button nx-primary" disabled>
                Publish · not connected
              </button>
            </div>
            <p className="nx-demo-note">
              Exports are local prototype definitions, not manufacturing CAD. A
              draft link works only in this browser after saving.
            </p>
            {products.some((p) => p.id === editor.id) && (
              <Link
                className="nx-text-link"
                href={`/create?draft=${encodeURIComponent(editor.id)}`}
              >
                Open saved draft in Create
              </Link>
            )}
          </section>
        )}
        {section === "Orders and Enquiries" && <DemoCrm />}
        {section === "Analytics" && (
          <section className="nx-editor-card">
            <span className="nx-eyebrow">
              CLEAR SIGNALS, WHEN THEY’RE READY
            </span>
            <h2>
              Understand what
              <br />
              <em>people make possible.</em>
            </h2>
            <p>
              Live analytics, visitor tracking and conversion reporting are not
              implemented. No customer activity is being invented or collected.
            </p>
            <div className="nx-stats">
              <article>
                <span>Local drafts</span>
                <strong>{products.length}</strong>
              </article>
              <article>
                <span>Configured option sets</span>
                <strong>
                  {products.reduce((n, p) => n + p.modes.length, 0)}
                </strong>
              </article>
              <article>
                <span>Live visitor data</span>
                <strong>—</strong>
              </article>
            </div>
            <p className="nx-demo-note">
              The first two counts describe this browser’s demo drafts, not
              business performance.
            </p>
          </section>
        )}
        {section === "Business Settings" && (
          <section className="nx-editor-card">
            <h2>A workspace with your name on it.</h2>
            <p>
              Preview fields only. Saving downloads a local settings note; it
              does not create an account or save business data to a server.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(business, null, 2)], {
                    type: "application/json",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "nitorix-demo-business-settings.json";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setStatus(
                  "Business settings note downloaded locally. No account was created.",
                );
              }}
            >
              <label>
                Business display name
                <input
                  required
                  maxLength={100}
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({ ...business, name: e.target.value })
                  }
                />
              </label>
              <label>
                Contact email
                <input
                  required
                  type="email"
                  maxLength={160}
                  value={business.email}
                  onChange={(e) =>
                    setBusiness({ ...business, email: e.target.value })
                  }
                />
              </label>
              <button className="nx-button nx-secondary" type="submit">
                Download settings note
              </button>
            </form>
          </section>
        )}
        <dialog
          className="nx-studio-preview"
          ref={dialog}
          onClose={() => {
            setPreview(false);
            opener.current?.focus();
          }}
        >
          <div className="nx-preview-heading">
            <span>LOCAL DRAFT PREVIEW · NOT PUBLISHED</span>
            <button
              onClick={() => dialog.current?.close()}
              aria-label="Close product preview"
            >
              Close ×
            </button>
          </div>
          {preview && (
            <DeskEmbed key={JSON.stringify(editor)} policy={editor} />
          )}
        </dialog>
      </main>
    </div>
  );
}

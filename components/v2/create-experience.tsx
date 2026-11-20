"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeskEmbed from "../desk-embed";
import { useStudioProducts } from "@/lib/studio/store";
import { type CreationMode } from "@/lib/studio/product";
export function CreateExperience({
  draftId,
  initialMode,
  showcase,
}: {
  draftId?: string;
  initialMode?: CreationMode;
  showcase?: "chair";
}) {
  const products = useStudioProducts();
  const router = useRouter();
  const draft = draftId ? products.find((p) => p.id === draftId) : undefined;
  return (
    <>
      <div className="nx-create-toolbar">
        <span>
          NITORIX CREATE <i> / </i> DESIGN YOUR WAY
        </span>
        <Link href="/explore">← Explore products</Link>
      </div>
      <div className="nx-catalogue-chooser">
        <label htmlFor="nx-catalogue-product">Product</label>
        <select
          id="nx-catalogue-product"
          aria-label="Demo manufacturer catalogue"
          value={showcase === "chair" ? "chair-showcase" : draft?.id ?? ""}
          onChange={(e) => router.push(e.target.value === "chair-showcase" ? "/create?showcase=chair" : e.target.value
            ? `/create?draft=${encodeURIComponent(e.target.value)}`
            : "/create")}
        >
          <option value="">Contour desk organiser</option>
          <option value="chair-showcase">Sheen chair · 3D showcase</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {draftId && (
        <p className="nx-preview-banner">
          {draft
            ? "Your saved product draft · Only visible on this browser"
            : "Product draft unavailable here. Showing Contour instead."}
        </p>
      )}
      <DeskEmbed
        key={showcase === "chair" ? "showcase-chair" : draft ? JSON.stringify(draft) : "default"}
        policy={draft}
        initialMode={initialMode}
        customiseOnly
        enableDemoEnquiry
        showcaseChair={showcase === "chair"}
      />
      <p className="nx-create-disclaimer">
        Product experience preview. Prices are indicative; no orders, enquiries or
        payments are sent. Saved catalogue drafts and CRM examples stay in this browser.
      </p>
    </>
  );
}

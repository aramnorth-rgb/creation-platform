"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeskEmbed from "../desk-embed";
import { useStudioProducts } from "@/lib/studio/store";
import { type CreationMode } from "@/lib/studio/product";
export function CreateExperience({
  draftId,
  initialMode,
}: {
  draftId?: string;
  initialMode?: CreationMode;
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
          value={draft?.id ?? ""}
          onChange={(e) => router.push(e.target.value
            ? `/create?draft=${encodeURIComponent(e.target.value)}`
            : "/create")}
        >
          <option value="">Contour desk organiser</option>
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
        key={draft ? JSON.stringify(draft) : "default"}
        policy={draft}
        initialMode={initialMode}
        customiseOnly={!draftId}
        enableDemoEnquiry
      />
      <p className="nx-create-disclaimer">
        Product experience preview. Prices are indicative; no orders, enquiries or
        payments are sent. Saved catalogue drafts and CRM examples stay in this browser.
      </p>
    </>
  );
}

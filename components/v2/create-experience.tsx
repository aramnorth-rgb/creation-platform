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
          NITORIX CREATE <i> / </i> YOUR SPACE TO EXPERIMENT
        </span>
        <Link href="/explore">← Explore products</Link>
      </div>
      <div className="nx-catalogue-chooser">
        <label htmlFor="nx-catalogue-product">Demo manufacturer catalogue</label>
        <select
          id="nx-catalogue-product"
          value={draft?.id ?? ""}
          onChange={(e) => router.push(e.target.value
            ? `/create?draft=${encodeURIComponent(e.target.value)}`
            : "/create")}
        >
          <option value="">Contour · standard demo</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} · local demo draft</option>
          ))}
        </select>
        <p>Each local product uses its own permitted options and illustrative pricing; real manufacturer catalogues are not connected.</p>
      </div>
      {draftId && (
        <p className="nx-preview-banner">
          {draft
            ? "Manufacturer draft preview · Browser-local rules and demo pricing · Not published"
            : "Saved draft not found on this device. Showing the standard demo."}
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
        Explore without registering. Prices are demonstrations, geometry is
        procedural and no manufacturing files, orders or payments are created.
        Your configuration and history stay in this page session.
      </p>
    </>
  );
}

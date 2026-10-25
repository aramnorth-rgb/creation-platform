"use client";
import Link from "next/link";
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
  const draft = draftId ? products.find((p) => p.id === draftId) : undefined;
  return (
    <>
      <div className="nx-create-toolbar">
        <span>
          NITORIX CREATE <i> / </i> YOUR SPACE TO EXPERIMENT
        </span>
        <Link href="/explore">← Explore products</Link>
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
      />
      <p className="nx-create-disclaimer">
        Explore without registering. Prices are demonstrations, geometry is
        procedural and no manufacturing files, orders or payments are created.
        Your configuration and history stay in this page session.
      </p>
    </>
  );
}

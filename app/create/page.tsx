import { SiteHeader, SiteFooter } from "@/components/v2/site-header";
import { CreateExperience } from "@/components/v2/create-experience";
import type { CreationMode } from "@/lib/studio/product";
import "../v2.css";
export const metadata = { title: "NITORIX Create — Make it yours" };
export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{
    draft?: string | string[];
    mode?: string | string[];
  }>;
}) {
  const q = await searchParams;
  const requestedMode = typeof q.mode === "string" ? q.mode : undefined;
  const mode = ["customise", "assemble", "engineer"].includes(
    requestedMode ?? "",
  )
    ? (requestedMode as CreationMode)
    : undefined;
  return (
    <div className="nx nx-create">
      <SiteHeader />
      <main id="content">
        <CreateExperience
          draftId={typeof q.draft === "string" ? q.draft : undefined}
          initialMode={mode}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

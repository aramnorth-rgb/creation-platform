import { PastelAtmosphere } from "@/components/v2/pastel-atmosphere";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/v2/site-header";
import { ProductArt } from "@/components/v2/product-art";
import { creations } from "@/components/exhibition-data";
import "../v2.css";
export const metadata = { title: "Community stories — NITORIX" };
export default function Community() {
  return (
    <PastelAtmosphere>
      <SiteHeader />
      <main id="content" className="nx-section">
        <div className="nx-page-heading">
          <span className="nx-eyebrow">SHARED IMAGINATION</span>
          <h1>
            Behind every object,
            <br />
            <em>a different perspective.</em>
          </h1>
          <p>
            A collection of imagined stories about the things we could make. All
            profiles, manufacturers and stories below are fictional
            demonstration content.
          </p>
        </div>
        <div className="nx-story-grid">
          {[creations[2], creations[3], creations[11]].map((c, i) => (
            <article key={c.name}>
              <div className={`nx-art nx-art-${i}`}>
                <ProductArt kind={["chair", "lamp", "vase"][i]} />
              </div>
              <span className="nx-eyebrow">FICTIONAL DESIGNER STORY</span>
              <h2>{c.name}</h2>
              <h3>{c.creator}</h3>
              <p>{c.biography}</p>
              <p>{c.story}</p>
            </article>
          ))}
        </div>
        <div className="nx-note-panel">
          <h2>Explore the original 3D collection.</h2>
          <p>
            The twelve-concept exhibition and local demo comments remain
            available. Nothing is posted publicly; no profiles or messaging
            services have been introduced.
          </p>
          <Link className="nx-text-link" href="/exhibition">
            Open the preserved exhibition ↗
          </Link>
        </div>
      </main>
      <SiteFooter />
    </PastelAtmosphere>
  );
}

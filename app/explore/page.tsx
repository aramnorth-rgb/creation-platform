import { PastelAtmosphere } from "@/components/v2/pastel-atmosphere";
import { SiteHeader, SiteFooter } from "@/components/v2/site-header";
import { Explore } from "@/components/v2/explore";
import "../v2.css";
export const metadata = { title: "Explore creations — NITORIX" };
export default function ExplorePage() {
  return (
    <PastelAtmosphere>
      <SiteHeader />
      <main id="content" className="nx-section">
        <div className="nx-page-heading">
          <span className="nx-eyebrow">THE COLLECTION / DEMONSTRATION</span>
          <h1>
            Find your
            <br />
            <em>starting point.</em>
          </h1>
          <p>
            Well-considered objects. Open-ended possibilities. Take a look
            around, then make a little space for your own ideas.
          </p>
        </div>
        <Explore />
      </main>
      <SiteFooter />
    </PastelAtmosphere>
  );
}

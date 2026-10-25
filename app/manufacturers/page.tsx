import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/v2/site-header";
import { ManufacturerInterest } from "@/components/v2/manufacturer-interest";
import "../v2.css";
export const metadata = { title: "For manufacturers — NITORIX Studio" };
export default function Manufacturers() {
  return (
    <div className="nx">
      <SiteHeader studio />
      <main id="content">
        <section className="nx-manufacturer-hero nx-section">
          <div>
            <span className="nx-eyebrow">
              NITORIX STUDIO / FOR MANUFACTURERS
            </span>
            <h1>
              Your expertise.
              <br />
              <em>Their expression.</em>
            </h1>
            <p>
              Give your products room to become personal. Define the
              possibilities, keep control of the details and let customers
              explore.
            </p>
            <Link href="/studio" className="nx-button nx-primary">
              Try the Studio demo ↗
            </Link>
            <p className="nx-small">
              Try first, sell second. No registration required.
            </p>
          </div>
          <div
            className="nx-dashboard-illustration"
            aria-label="Studio demonstration workflow"
          >
            <div>
              <strong>
                NITORIX <span>STUDIO</span>
              </strong>
              <i>PREVIEW</i>
            </div>
            <p>From product to possibility.</p>
            <div className="nx-demo-chart">
              {[40, 65, 52, 85, 74, 100].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <ol>
              <li>01 Product information</li>
              <li>02 Approved options</li>
              <li>03 Preview & validate</li>
              <li>04 Publishing · planned</li>
            </ol>
            <small>
              Illustration of the proposed workflow, not business analytics.
            </small>
          </div>
        </section>
        <section className="nx-section nx-studio-benefits">
          <span className="nx-eyebrow">YOUR PRODUCTS. YOUR PARAMETERS.</span>
          <h2>
            Open up the possibilities.
            <br />
            <em>Keep the decisions that matter.</em>
          </h2>
          <div className="nx-three-columns">
            {[
              {
                title: "A product, understood",
                text: "Choose the materials, colours, sizes and compatible modules that suit your manufacturing process.",
              },
              {
                title: "The right level of freedom",
                text: "Decide whether customers can Customise, Assemble or Engineer each product. One shared engine connects the experience.",
              },
              {
                title: "Your world and ours",
                text: "Save and try local demo configurations today. Marketplace listings, website embedding and managed publishing are the intended next steps.",
              },
            ].map((c) => (
              <article key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="access" className="nx-section nx-account-section">
          <div>
            <span className="nx-eyebrow">YOUR FUTURE WORKSPACE</span>
            <h2>
              A place to build
              <br />
              <em>your next chapter.</em>
            </h2>
            <p>
              Registered manufacturers will eventually have private workspaces.
              Authentication and secure cloud accounts are not implemented in
              this preview.
            </p>
          </div>
          <div className="nx-account-options">
            <article>
              <h3>Already working with NITORIX?</h3>
              <button className="nx-button nx-secondary" disabled>
                Sign In
              </button>
              <p>Account access is not available yet.</p>
            </article>
            <article>
              <h3>New to NITORIX Studio?</h3>
              <button className="nx-button nx-secondary" disabled>
                Create Account
              </button>
              <p>Registration is planned. You can try the demo now.</p>
            </article>
          </div>
        </section>
        <section id="founding" className="nx-founding nx-section">
          <div>
            <span className="nx-eyebrow">
              THE FOUNDING MANUFACTURER PROGRAMME
            </span>
            <h2>
              Help shape
              <br />
              <em>what comes next.</em>
            </h2>
            <p>
              We’re seeking a small group of manufacturers to help shape the
              technology around real products and real production needs.
            </p>
            <p>
              We intend to offer qualifying founding partners free lifetime
              access to core manufacturer software, subject to final programme
              terms, eligibility and the scope of core software. Places,
              availability and terms are not yet confirmed; this preview creates
              no entitlement.
            </p>
            <Link href="/studio" className="nx-text-link">
              Explore the technology first ↗
            </Link>
          </div>
          <ManufacturerInterest />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

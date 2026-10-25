import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/v2/site-header";
import { HomeHero } from "@/components/v2/home-hero";
import { ProductArt } from "@/components/v2/product-art";
import "./v2.css";
export default function Home() {
  return (
    <div className="nx">
      <SiteHeader />
      <main id="content">
        <HomeHero />
        <section className="nx-belief">
          <span className="nx-eyebrow">A DIFFERENT WAY TO CHOOSE</span>
          <h2>
            Why buy ordinary
            <br />
            when you can <em>make it yours?</em>
          </h2>
          <p>
            Bring your own perspective to well-designed products. Explore
            materials, consider the details and create something that fits the
            way you live.
          </p>
        </section>
        <section className="nx-section" id="creations">
          <div className="nx-section-heading">
            <div>
              <span className="nx-eyebrow">OBJECTS WITH POSSIBILITY</span>
              <h2>
                Considered design.
                <br />
                Your point of view.
              </h2>
            </div>
            <Link href="/explore" className="nx-text-link">
              Explore the collection
            </Link>
          </div>
          <div className="nx-product-grid">
            {[
              {
                name: "Contour",
                kind: "desk",
                category: "WORKSPACE",
                note: "An everyday essential, rearranged.",
              },
              {
                name: "Fold",
                kind: "chair",
                category: "LIVING",
                note: "A softer perspective on sitting.",
              },
              {
                name: "Halo",
                kind: "lamp",
                category: "LIGHTING",
                note: "A little warmth, wherever you are.",
              },
            ].map((p, i) => (
              <Link
                href={p.kind === "desk" ? "/create" : "/explore"}
                className="nx-product-card"
                key={p.name}
              >
                <div className={`nx-art nx-art-${i}`}>
                  <span>0{i + 1}</span>
                  <ProductArt kind={p.kind} />
                  <i></i>
                </div>
                <div className="nx-card-copy">
                  <span className="nx-eyebrow">
                    {p.category} · DEMO CONCEPT
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.note}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="nx-how nx-section">
          <div>
            <span className="nx-eyebrow">FROM POSSIBILITY TO PERSONAL</span>
            <h2>
              A simple beginning.
              <br />
              <em>Something entirely yours.</em>
            </h2>
            <Link className="nx-button nx-secondary" href="/create">
              Try NITORIX Create
            </Link>
          </div>
          <ol>
            {[
              {
                title: "Find your starting point",
                text: "Discover a product with room for your perspective.",
              },
              {
                title: "Make it feel like you",
                text: "Explore approved colours, materials and compatible components.",
              },
              {
                title: "Consider what comes next",
                text: "Preview your design and its demonstration price. Manufacturing and checkout will come later.",
              },
            ].map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="nx-community-feature nx-section">
          <div className="nx-community-art">
            <ProductArt kind="vase" />
            <span className="nx-eyebrow">THE SHAPE OF AN IDEA</span>
          </div>
          <div>
            <span className="nx-eyebrow">A PLACE FOR SHARED IMAGINATION</span>
            <h2>
              Good ideas deserve
              <br />
              <em>room to grow.</em>
            </h2>
            <p>
              Objects can tell a story. Meet the fictional designers behind our
              demonstration collection and explore the thinking that shaped
              their work.
            </p>
            <Link className="nx-text-link" href="/community">
              Explore community stories
            </Link>
          </div>
        </section>
        <section className="nx-manufacturer-call nx-section">
          <span className="nx-eyebrow">FOR THE PEOPLE WHO MAKE THINGS</span>
          <h2>
            You make exceptional products.
            <br />
            Let people make them personal.
          </h2>
          <p>
            We’re seeking a small group of manufacturers to help shape a more
            thoughtful way to create. Explore the Studio prototype before
            starting a conversation.
          </p>
          <div className="nx-actions">
            <Link className="nx-button nx-primary" href="/manufacturers">
              Meet NITORIX Studio
            </Link>
            <Link className="nx-text-link" href="/manufacturers#founding">
              Founding manufacturer programme
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

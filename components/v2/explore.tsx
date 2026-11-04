"use client";
import Link from "next/link";
import { useState } from "react";
import { ProductArt } from "./product-art";
const products = [
  {
    name: "Contour desk organiser",
    kind: "desk",
    category: "Workspace",
    description: "A modular system for your everyday essentials.",
    story:
      "Change its footprint, material and colour. Connect trays, pen cups and a phone rest in Create.",
    action: "Personalise in Create",
    href: "/create",
  },
  {
    name: "Fold chair",
    kind: "chair",
    category: "Living",
    description: "Soft lines. A thoughtful place to pause.",
    story:
      "A fictional seating concept by Luca Moreau. Illustration shown here; a licensed CC0 Sheen Chair reference can be explored in the legacy exhibition.",
    action: "View 3D exhibition",
    href: "/exhibition",
  },
  {
    name: "Halo light",
    kind: "lamp",
    category: "Living",
    description: "A small pool of light, just where you need it.",
    story:
      "A fictional lighting concept. The procedural model remains available in the exhibition; product customisation is not connected yet.",
    action: "View 3D exhibition",
    href: "/exhibition",
  },
  {
    name: "Orbit ring",
    kind: "ring",
    category: "Objects",
    description: "A quiet statement, shaped around you.",
    story:
      "An original procedural jewellery demonstration. No real jeweller, order or production service is associated with this concept.",
    action: "View 3D exhibition",
    href: "/exhibition",
  },
  {
    name: "Tidal vessel",
    kind: "vase",
    category: "Objects",
    description: "A little of the landscape, brought indoors.",
    story:
      "Pia North is a fictional designer inspired by the coast. This is a demonstration story and an original illustration, not a customer endorsement.",
    action: "View community stories",
    href: "/community",
  },
];
export function Explore() {
  const [filter, setFilter] = useState("All"),
    [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <div className="nx-filter" role="group" aria-label="Product categories">
        {["All", "Workspace", "Living", "Objects"].map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            onClick={() => {
              setFilter(c);
              setSelected(null);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="nx-demo-note">
        Curated fictional demo collection. Contour is configurable; the other
        concepts are previews. No products can be purchased here.
      </p>
      <div className="nx-product-grid nx-explore-grid">
        {products
          .filter((p) => filter === "All" || p.category === filter)
          .map((p, i) => (
            <article key={p.kind} className="nx-product-card">
              <button
                className={`nx-art nx-art-${i % 3}`}
                aria-expanded={selected === p.kind}
                aria-label={`Explore ${p.name}`}
                onClick={() => setSelected(selected === p.kind ? null : p.kind)}
              >
                <span>{p.category}</span>
                <ProductArt kind={p.kind} />
                <i>＋</i>
              </button>
              <div className="nx-card-copy">
                <h2>{p.name}</h2>
                <p>{p.description}</p>
                {selected === p.kind && (
                  <div className="nx-product-detail">
                    <p>{p.story}</p>
                    <Link href={p.href} className="nx-text-link">
                      {p.action}
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}
      </div>
    </>
  );
}

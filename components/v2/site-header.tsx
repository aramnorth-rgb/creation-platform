"use client";
import Link from "next/link";
import { useRef } from "react";
import { BrandLogo } from "./brand-logo";
const links = [
  { label: "Explore Creations", href: "/explore" },
  { label: "Start Creating", href: "/create" },
  { label: "Community", href: "/community" },
  { label: "For Manufacturers", href: "/manufacturers" },
];
export function SiteHeader({ studio = false }: { studio?: boolean }) {
  const menu = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <a className="nx-skip" href="#content">
        Skip to content
      </a>
      <header className="nx-header">
        <Link className="nx-wordmark" href="/" aria-label="NITORIX home">
          <BrandLogo eager header />
          {studio && <span>STUDIO</span>}
        </Link>
        <nav className="nx-desktop-nav" aria-label="Main navigation">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          ref={trigger}
          className="nx-menu-trigger"
          aria-label="Open navigation menu"
          onClick={() => menu.current?.showModal()}
        >
          <span>Menu</span>
          <i aria-hidden="true" />
        </button>
      </header>
      <dialog
        className="nx-menu"
        ref={menu}
        aria-labelledby="nx-menu-title"
        onClose={() => trigger.current?.focus()}
        onClick={(e) => {
          if (e.target === e.currentTarget) menu.current?.close();
        }}
      >
        <div>
          <span className="nx-eyebrow" id="nx-menu-title">
            A WORLD OF POSSIBILITY
          </span>
          <button
            aria-label="Close navigation menu"
            onClick={() => menu.current?.close()}
          >
            Close ×
          </button>
        </div>
        <nav aria-label="Expanded navigation">
          {links.map((l, i) => (
            <Link
              href={l.href}
              key={l.href}
              onClick={() => menu.current?.close()}
            >
              <small>0{i + 1}</small>
              {l.label}
              <span></span>
            </Link>
          ))}
        </nav>
        <p>Why buy ordinary when you can make it yours?</p>
      </dialog>
    </>
  );
}
export function SiteFooter() {
  return (
    <footer className="nx-footer">
      <div>
        <Link href="/" className="nx-wordmark">
          <BrandLogo />
        </Link>
        <p>Thoughtfully made. Uniquely yours.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/explore">Explore</Link>
        <Link href="/create">Create</Link>
        <Link href="/studio">Studio demo</Link>
        <Link href="/manufacturers#founding">Founding partners</Link>
      </nav>
      <small>
        Platform preview · Fictional demonstration products · No live commerce
      </small>
    </footer>
  );
}

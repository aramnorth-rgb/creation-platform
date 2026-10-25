import Image from "next/image";

/** Lossless crop of the approved master; no resampling, recolouring or background removal. */
export function BrandLogo({ eager = false }: { eager?: boolean }) {
  return (
    <Image
      src="/brand/nitorix-logo.webp"
      alt="NITORIX"
      width={1175}
      height={439}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className="nx-approved-logo"
    />
  );
}

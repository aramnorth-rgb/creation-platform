import Image from "next/image";

/** The original approved web logo remains available; only headers use the pastel refinement. */
export function BrandLogo({
  eager = false,
  header = false,
}: {
  eager?: boolean;
  header?: boolean;
}) {
  return (
    <Image
      src={
        header ? "/brand/nitorix-logo-pastel.webp" : "/brand/nitorix-logo.webp"
      }
      alt="NITORIX"
      width={header ? 1137 : 1175}
      height={header ? 300 : 439}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className="nx-approved-logo"
    />
  );
}

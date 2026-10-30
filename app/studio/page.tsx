import { SiteHeader } from "@/components/v2/site-header";
import { StudioDashboard } from "@/components/v2/studio-dashboard";
import "../v2.css";
export const metadata = {
  title: "NITORIX Studio — Manufacturer workspace demo",
};
export default function Studio() {
  return (
    <div className="nx nx-studio">
      <SiteHeader studio />
      <StudioDashboard />
    </div>
  );
}

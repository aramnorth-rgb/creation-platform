import {SiteHeader,SiteFooter} from "@/components/v2/site-header";
import {GateConfigurator} from "@/components/v2/gate-configurator";
import "../v2.css";
export const metadata={
 title:"NITORIX Gate Studio | Configurator Pilot",
 description:"Interactive concept configurator for bespoke driveway gates. Demonstration dimensions and prices only."
};
export default function GatePilot(){
 return <div className="nx nx-gates"><SiteHeader/><main id="content"><GateConfigurator/></main><SiteFooter/></div>;
}

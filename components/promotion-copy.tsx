import { promotions } from "./promotion-content";
/** Accessible copy, plus a CSS 3D fallback/repositioning for smaller screens. */
export function PromotionCopy({
  webgl,
  detailsOpen,
}: {
  webgl: boolean;
  detailsOpen: boolean;
}) {
  return (
    <div
      className={`promotion-pair ${webgl ? "has-webgl" : "fallback-promotions"} ${detailsOpen ? "details-visible" : ""}`}
      data-height-ratio="1.4"
      aria-label="NITORIX promotional panels"
    >
      {promotions.map((p) => (
        <aside
          key={p.side}
          className={`promotion promotion-${p.side}`}
          aria-label={`${p.side} promotional panel`}
        >
          <div className="promotion-face">
            <span className="promo-edition">NITORIX / V5</span>
            <div className="promotion-words">
              <h2 aria-label={p.title}>
                {p.lines.map((line, i) => (
                  <span key={line} className={i === 2 ? "yellow" : ""}>
                    {line}
                  </span>
                ))}
              </h2>
              <i />
              <p>{p.subtitle}</p>
            </div>
            <span className="promo-signature">IMAGINATION × POSSIBILITY</span>
          </div>
          <i className="promo-spark spark-one" />
          <i className="promo-spark spark-two" />
        </aside>
      ))}
    </div>
  );
}

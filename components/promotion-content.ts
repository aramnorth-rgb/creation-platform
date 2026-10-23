export const PROMOTION_WIDTH = 1.12;
export const PROMOTION_BASE_HEIGHT = 2.6;
export const PROMOTION_HEIGHT = PROMOTION_BASE_HEIGHT * 1.4;
export const promotions = [
  {
    side: "left",
    title: "YOUR IMAGINATION. MADE REAL.",
    lines: ["YOUR", "IMAGINATION.", "MADE REAL."],
    subtitle: "Design it. Make it yours.",
    caption: ["Design it.", "Make it yours."],
  },
  {
    side: "right",
    title: "THE NEXT BIG THING? YOURS.",
    lines: ["THE NEXT", "BIG THING?", "YOURS."],
    subtitle: "Discover what our creators are building.",
    caption: ["Discover what", "our creators", "are building."],
  },
] as const;

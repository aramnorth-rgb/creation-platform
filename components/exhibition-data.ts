export const creations = [
  {
    name: "Atlas / 01",
    category: "A home beyond the horizon",
    kind: "motorhome",
    creator: "Elio Mercer",
    initials: "EM",
    maker: "Northline Mobility",
    location: "Imagined in Copenhagen",
    story:
      "What if the journey felt as considered as the destination? Elio imagined a quieter way to wander: generous windows, warm materials and a home that leaves room for the landscape.",
    comment:
      "A moving cabin with a window to everywhere. That is a beautiful starting point.",
    author: "Mara Chen",
    material: "Pearl aluminium · Smoked glass",
  },
  {
    name: "Glide / 02",
    category: "A lighter way through the city",
    kind: "scooter",
    creator: "Ada Kwon",
    initials: "AK",
    maker: "Still Motion Works",
    location: "Imagined in Seoul",
    story:
      "Ada’s city moves quickly. Her concept takes a different approach: a compact, beautifully simple scooter that makes the in-between moments feel like part of the adventure.",
    comment:
      "That small silhouette has so much personality. A lovely idea for everyday movement.",
    author: "Noah Ellis",
    material: "Sage alloy · Graphite rubber",
  },
  {
    name: "Fold / 03",
    category: "An everyday seat. An unexpected angle.",
    kind: "chair",
    creator: "Jules Laurent",
    initials: "JL",
    maker: "Common Ground Studio",
    location: "Imagined in Lyon",
    story:
      "One folded line, a hundred possibilities. Jules explored how a familiar chair could feel sculptural, comfortable and quietly at home in almost any space.",
    comment:
      "The warm timber against that bold frame is such a thoughtful combination.",
    author: "Isla Reed",
    material: "Oak veneer · Brushed aluminium",
  },
  {
    name: "Halo / 04",
    category: "A small circle of possibility",
    kind: "lamp",
    creator: "Nia Okafor",
    initials: "NO",
    maker: "Arc & Matter",
    location: "Imagined in Bristol",
    story:
      "Nia began with the simple ritual of turning on a light. A ring suspended in space became an invitation to slow down, look closer and make something unexpected.",
    comment:
      "I can almost imagine the pool of light on a late-night worktable.",
    author: "Leo Park",
    material: "Satin brass · Opal diffuser",
  },
] as const;
export type Mode = "exhibition" | "customise" | "assemble" | "engineer";
export type Configuration = {
  color: string;
  finish: "satin" | "polished";
  solar: boolean;
  awning: boolean;
  storage: boolean;
  length: number;
  clearance: number;
  wheelSize: number;
  wireframe: boolean;
};
export const defaults: Configuration = {
  color: "#e4dfd2",
  finish: "satin",
  solar: true,
  awning: false,
  storage: false,
  length: 6.8,
  clearance: 240,
  wheelSize: 20,
  wireframe: false,
};

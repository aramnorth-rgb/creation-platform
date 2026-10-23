const concepts = [
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
  {
    name: "Mira Arm",
    category: "Robotics with a gentler touch",
    kind: "robot",
    creator: "Samira Vale",
    initials: "SV",
    maker: "Soft Machine Lab",
    location: "Imagined in Lisbon",
    story:
      "Samira imagined a patient studio assistant that helps people make more with less strain.",
    comment: "The open joints make the mechanism feel understandable.",
    author: "Rae Cole",
    material: "Ceramic shell · Anodised joints",
  },
  {
    name: "Orbit Ring",
    category: "A small world, held close",
    kind: "ring",
    creator: "Ivo Marin",
    initials: "IM",
    maker: "Little Orbit Atelier",
    location: "Imagined in Milan",
    story:
      "Ivo translated an orbit into a sculptural ring, balancing a crisp stone against a continuous gold band.",
    comment: "Such a playful balance of geometry and sparkle.",
    author: "Bea Stone",
    material: "Brushed gold concept · Crystal placeholder",
  },
  {
    name: "Quiet Pavilion",
    category: "A room for the landscape",
    kind: "pavilion",
    creator: "Lina Sol",
    initials: "LS",
    maker: "Common Sky Structures",
    location: "Imagined in Oslo",
    story:
      "Lina imagined a small pavilion where the landscape is the main exhibit and the roof is a quiet frame.",
    comment: "I would love to sit here through a rainstorm.",
    author: "Otis Lane",
    material: "Timber ribs · Mineral base",
  },
  {
    name: "Torque One",
    category: "Better tools for curious hands",
    kind: "drill",
    creator: "Theo Moss",
    initials: "TM",
    maker: "Fieldwork Tools",
    location: "Imagined in Sheffield",
    story:
      "Theo wanted a compact tool that feels considered enough to keep, maintain and pass along.",
    comment: "That clear silhouette makes it feel purposeful.",
    author: "Ari Fox",
    material: "Graphite polymer · Brushed steel",
  },
  {
    name: "Meridian",
    category: "Time, with a different rhythm",
    kind: "watch",
    creator: "Sana Bell",
    initials: "SB",
    maker: "Hour House",
    location: "Imagined in Geneva",
    story:
      "Sana imagined a watch with a single, calm visual language: a bright face and a generous sculpted strap.",
    comment: "A lovely idea for a quieter daily ritual.",
    author: "Max Reed",
    material: "Satin alloy · Soft strap",
  },
  {
    name: "Aero Seed",
    category: "A new view on familiar ground",
    kind: "drone",
    creator: "Ren Sato",
    initials: "RS",
    maker: "Cloudform Studio",
    location: "Imagined in Kyoto",
    story:
      "Ren sketched a small aerial companion inspired by seed pods and the lightest possible structure.",
    comment: "Those four little rings have so much character.",
    author: "Zoe Grey",
    material: "Composite concept · Open rotor guards",
  },
  {
    name: "Resonance",
    category: "Sound you can see",
    kind: "speaker",
    creator: "Amara West",
    initials: "AW",
    maker: "Wave & Wood",
    location: "Imagined in Accra",
    story:
      "Amara imagined an audio object that feels as at home on a shelf as a favourite piece of furniture.",
    comment: "The warm frame is such a good counterpoint to the drivers.",
    author: "Kit Rowan",
    material: "Oak frame · Fabric grille",
  },
  {
    name: "Tidal Vessel",
    category: "An object shaped by the current",
    kind: "vase",
    creator: "Pia North",
    initials: "PN",
    maker: "Shoreline Objects",
    location: "Imagined in Reykjavik",
    story:
      "Pia built a rhythm of soft layers into a vessel, holding a little of the sea in an everyday object.",
    comment: "The silhouette feels like a small landscape.",
    author: "Eden Hart",
    material: "Glazed ceramic · Layered form",
  },
] as const;
export const creations = concepts.map((concept, index) => ({
  ...concept,
  biography: `${concept.creator} is a fictional independent designer exploring the relationship between thoughtful materials, useful objects and everyday imagination.`,
  rating: (4.4 + (index % 5) * 0.1).toFixed(1),
}));
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

type CategoryRule = {
  category: string;
  keywords: string[];
};

const RULES: CategoryRule[] = [
  {
    category: "Wine & cellar",
    keywords: ["wine", "coravin", "decanter", "cellar", "vineyard", "sommelier"],
  },
  {
    category: "Tech",
    keywords: [
      "laptop", "keyboard", "kindle", "headphone", "earbud", "camera",
      "phone", "tablet", "monitor", "mouse", "charger", "speaker",
    ],
  },
  {
    category: "Wardrobe",
    keywords: [
      "coat", "jacket", "shoes", "sneaker", "boots", "bag", "dress",
      "shirt", "jeans", "sweater", "scarf",
    ],
  },
  {
    category: "Home",
    keywords: [
      "desk", "chair", "sofa", "table", "lamp", "kitchen", "pan",
      "cookware", "rug", "shelf", "mattress", "espresso",
    ],
  },
];

export function suggestCategory(name: string, url?: string | null): string | null {
  const haystack = `${name} ${url ?? ""}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return null;
}

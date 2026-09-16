// Deterministic placeholder look for items without a fetched image yet,
// so the moodboard has the same visual variety as the approved mockup.

const GRADIENTS = [
  "linear-gradient(160deg,#D9C2A6,#C4693F)",
  "linear-gradient(150deg,#EDE3D0,#B7C4C7)",
  "linear-gradient(160deg,#3E4A4E,#232A2C)",
  "linear-gradient(120deg,#E4D6BE,#C4693F,#8A4A2E)",
  "linear-gradient(160deg,#4F6772,#2C3B42)",
  "linear-gradient(150deg,#556B75,#33454C)",
  "linear-gradient(160deg,#8A4A2E,#5C7C8A)",
  "linear-gradient(140deg,#D9C2A6,#A8724B)",
  "linear-gradient(160deg,#C7D6D9,#5C7C8A)",
];

const HEIGHTS = ["h-[190px]", "h-[260px]", "h-[340px]", "h-[220px]"];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function placeholderGradient(seed: string): string {
  return GRADIENTS[hashSeed(seed) % GRADIENTS.length];
}

export function placeholderHeightClass(seed: string): string {
  return HEIGHTS[hashSeed(seed + "h") % HEIGHTS.length];
}

// Returns the ids in a fresh random order (Fisher-Yates).
export function shuffledIds(items: { id: string }[]): string[] {
  const ids = items.map((item) => item.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

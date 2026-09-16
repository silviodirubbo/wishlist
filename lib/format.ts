const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Swiss-style thousands separator, written by hand rather than via
// toLocaleString: ICU data differs between the Node SSR pass and the
// browser, so the apostrophe grouping character mismatches and breaks
// hydration.
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

export function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "—";
  return `${currency} ${formatNumber(price)}`;
}

export function formatTargetDate(targetDate: string | null): string {
  if (!targetDate) return "—";
  const date = parseDate(targetDate);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  const label = sameYear
    ? `${date.getDate()} ${MONTHS[date.getMonth()]}`
    : `${MONTHS[date.getMonth()]} '${String(date.getFullYear()).slice(-2)}`;
  return `by ${label}`;
}

export function formatBoughtDate(boughtAt: string | null): string {
  if (!boughtAt) return "—";
  const date = parseDate(boughtAt);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

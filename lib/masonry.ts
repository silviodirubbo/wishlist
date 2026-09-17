// Balanced-fill masonry layout, matching the visual result of
// `columns: <maxColumns> <minColumnWidth>px` (sequential fill per column,
// heights balanced), but computed in JS so positions can be read and
// animated (CSS multi-column layout doesn't expose per-item x/y).

export function computeColumnCount(
  containerWidth: number,
  minColumnWidth = 260,
  gap = 20,
  maxColumns = 4
): number {
  for (let count = maxColumns; count > 1; count--) {
    const colWidth = (containerWidth - (count - 1) * gap) / count;
    if (colWidth >= minColumnWidth) return count;
  }
  return 1;
}

export function computeColumnWidth(
  containerWidth: number,
  columnCount: number,
  gap = 20
): number {
  return (containerWidth - (columnCount - 1) * gap) / columnCount;
}

export type Position = { x: number; y: number };

export type MasonryLayout = {
  positions: Position[];
  containerHeight: number;
};

// Packs items sequentially (in order, whole, matching `break-inside: avoid`)
// into as many columns as needed to keep every column under `maxHeight`.
// Column count is intentionally unbounded here — bounding it during the
// search would make "columns needed" trivially always fit, which breaks
// the binary search below.
function packWithMaxHeight(
  heights: number[],
  gap: number,
  maxHeight: number
): { colIndex: number[]; colHeights: number[] } {
  const colHeights: number[] = [];
  const colIndex: number[] = [];
  let col = 0;

  for (const h of heights) {
    if (colHeights[col] > 0 && colHeights[col] + gap + h > maxHeight) {
      col++;
    }
    colHeights[col] = colHeights[col] > 0 ? colHeights[col] + gap + h : h;
    colIndex.push(col);
  }

  return { colIndex, colHeights };
}

// Binary-searches the minimal max-column-height that packs every item into
// `columnCount` columns or fewer — the same balancing goal browsers use for
// CSS multi-column layout.
export function computeLayout(
  heights: number[],
  columnCount: number,
  columnWidth: number,
  gap: number
): MasonryLayout {
  if (heights.length === 0) {
    return { positions: [], containerHeight: 0 };
  }

  let low = Math.max(...heights);
  let high = heights.reduce((sum, h) => sum + h, 0) + gap * (heights.length - 1);

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const { colHeights } = packWithMaxHeight(heights, gap, mid);
    if (colHeights.length <= columnCount) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  const { colIndex, colHeights } = packWithMaxHeight(heights, gap, low);

  const runningY = new Array(columnCount).fill(0);
  const positions = heights.map((h, i) => {
    const col = colIndex[i];
    const y = runningY[col];
    runningY[col] += h + gap;
    return { x: col * (columnWidth + gap), y };
  });

  return { positions, containerHeight: Math.max(...colHeights) };
}

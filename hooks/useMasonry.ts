"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { computeColumnCount, computeColumnWidth, computeLayout } from "@/lib/masonry";

const GAP = 20;
const MIN_COLUMN_WIDTH = 260;
const MAX_COLUMNS = 4;
const TRANSITION = "transform 450ms cubic-bezier(0.4, 0, 0.2, 1)";

type MasonryItem = { id: string };

export function useMasonry<T extends MasonryItem>(items: T[]) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef(new Map<string, HTMLDivElement>());
  const [containerWidth, setContainerWidth] = useState(0);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [containerHeight, setContainerHeight] = useState(0);
  const [ready, setReady] = useState(false);

  const setTileRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) tileRefs.current.set(id, el);
      else tileRefs.current.delete(id);
    },
    []
  );

  // Track the container's width so column count/width can adapt.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerWidth(container.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const columnCount = computeColumnCount(containerWidth || 1, MIN_COLUMN_WIDTH, GAP, MAX_COLUMNS);
  const columnWidth = computeColumnWidth(containerWidth || 1, columnCount, GAP);

  // Re-measure and re-lay-out whenever the visible items (order or content,
  // which can change rendered height) or the column geometry change.
  useLayoutEffect(() => {
    if (!containerWidth) return;

    const heights = items.map((item) => tileRefs.current.get(item.id)?.offsetHeight ?? 0);
    const layout = computeLayout(heights, columnCount, columnWidth, GAP);

    setPositions(new Map(items.map((item, i) => [item.id, layout.positions[i]])));
    setContainerHeight(layout.containerHeight);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, columnCount, columnWidth]);

  const getTileStyle = useCallback(
    (id: string): CSSProperties => {
      const pos = positions.get(id) ?? { x: 0, y: 0 };
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: columnWidth,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: ready ? TRANSITION : "none",
        visibility: ready ? "visible" : "hidden",
      };
    },
    [positions, columnWidth, ready]
  );

  return { containerRef, setTileRef, getTileStyle, containerHeight, columnWidth, ready };
}

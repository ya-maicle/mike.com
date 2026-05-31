/**
 * Grid column utilities for content layout
 *
 * Pure 12-column grid system matching OpenAI reference pattern.
 *
 * Centered column positioning is driven by the ContentGrid @container width,
 * not the viewport: it engages only once the content area is desktop-width
 * (@6xl / 1152px). Narrower containers — tablet, or a column squeezed by the
 * case study side panel — span full width so text never reads too narrow.
 *
 * Grid container is max 1376px. Column widths:
 * - 6 cols = ~688px (narrow)
 * - 8 cols = ~917px (medium)
 * - 10 cols = ~1147px (wide)
 */

export const gridCols = {
  /** Narrow: 6/12 cols centered (~688px on 1376px container) */
  narrow: 'col-span-12 @6xl:col-span-6 @6xl:col-start-4',

  /** Medium: 8/12 cols centered (~917px on 1376px container) */
  medium: 'col-span-12 @6xl:col-span-8 @6xl:col-start-3',

  /** Wide: 10/12 cols centered (~1147px on 1376px container) */
  wide: 'col-span-12 @6xl:col-span-10 @6xl:col-start-2',

  /** Full width: all 12 cols */
  full: 'col-span-12',
} as const

export type GridColSize = keyof typeof gridCols

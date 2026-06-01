import { defineMigration, at, set, unset } from 'sanity/migrate'

/**
 * Move the legacy `coverImage` (a plain image) into the new `cover` media
 * object: `{ type: 'image', image: <coverImage> }`.
 *
 * Reason: the case-study cover is being unified with the Header Media pattern so
 * editors can choose Image or Video. Existing documents only have `coverImage`,
 * so this backfills `cover` and removes the orphaned field.
 *
 * Run with:
 *   pnpm dlx sanity migration run cover-media-object --no-dry-run
 *   (defaults to the dataset in sanity.cli.ts; pass --dataset to override)
 */
export default defineMigration({
  title: "Move coverImage into cover { type: 'image', image }",
  documentTypes: ['caseStudy'],

  migrate: {
    document(doc) {
      const legacy = (doc as { coverImage?: unknown; cover?: unknown }).coverImage
      const existingCover = (doc as { cover?: unknown }).cover

      // Only migrate documents that still have the legacy field and no cover yet.
      if (!legacy || existingCover) return []

      return [at('cover', set({ type: 'image', image: legacy })), at('coverImage', unset())]
    },
  },
})

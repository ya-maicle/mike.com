import { createClient } from 'next-sanity'
import 'server-only'

/**
 * Server-side Sanity client.
 * - Uses public projectId/dataset from NEXT_PUBLIC_*
 * - Optionally uses SANITY_API_READ_TOKEN on the server only
 * - CDN enabled in production for faster cached reads
 *
 * Phase 0 scaffold: schema/queries will be added in Phase 2.
 */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_READ_TOKEN, // never exposed to client because this module is server-only
  perspective: 'published',
})

// Convenience wrapper with stable defaults; tags aid ISR revalidation later.
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options?: { tag?: string },
): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    cache: 'force-cache',
    ...(options?.tag ? { next: { tags: [options.tag] } } : {}),
  })
}

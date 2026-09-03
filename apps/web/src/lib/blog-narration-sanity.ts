const API_VERSION = 'v2025-01-01'

export type SanityConnection = {
  projectId: string
  dataset: string
  token: string
}

type NarrationRecord = {
  scriptOverride?: string
  sourceHash?: string
  audioFile?: {
    _type?: 'file'
    asset?: { _type?: 'reference'; _ref?: string }
  }
  generationStatus?: 'generating' | 'ready' | 'error'
  generationError?: string
  [key: string]: unknown
}

export type SanityPost = {
  _id: string
  _rev: string
  _type: 'blogPost' | 'caseStudy'
  title: string
  excerpt?: string
  summary?: string
  slug: { current: string }
  content?: Array<{ _type?: string; children?: Array<{ text?: string }> }>
  narration?: NarrationRecord
  [key: string]: unknown
}

function apiUrl(connection: SanityConnection, path: string) {
  return new URL(`https://${connection.projectId}.api.sanity.io/${API_VERSION}/${path}`)
}

async function sanityRequest<T>(connection: SanityConnection, url: URL, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${connection.token}`, ...init.headers },
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300)
    throw new Error(`Sanity request failed (${response.status}): ${detail}`)
  }
  return (await response.json()) as T
}

async function queryPosts(
  connection: SanityConnection,
  query: string,
  parameters: Record<string, string>,
) {
  const url = apiUrl(connection, `data/query/${connection.dataset}`)
  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'raw')
  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value))
  }
  return (
    await sanityRequest<{ result: SanityPost[] }>(connection, url, {
      headers: { 'Content-Type': 'application/json' },
    })
  ).result
}

export async function findSanityPost(
  connection: SanityConnection,
  slug: string,
  documentType: SanityPost['_type'] = 'blogPost',
) {
  const posts = await queryPosts(connection, `*[_type == $documentType && slug.current == $slug]`, {
    slug,
    documentType,
  })
  return posts.find(({ _id }) => _id.startsWith('drafts.')) ?? posts[0]
}

export async function findSanityPostById(
  connection: SanityConnection,
  documentId: string,
  documentType: SanityPost['_type'] = 'blogPost',
) {
  const posts = await queryPosts(connection, `*[_type == $documentType && _id == $documentId]`, {
    documentId,
    documentType,
  })
  return posts[0]
}

function publishedIdFor(documentId: string) {
  return documentId.startsWith('drafts.') ? documentId.slice('drafts.'.length) : documentId
}

async function mutate(connection: SanityConnection, mutations: Array<Record<string, unknown>>) {
  const url = apiUrl(connection, `data/mutate/${connection.dataset}`)
  url.searchParams.set('visibility', 'sync')
  url.searchParams.set('returnDocuments', 'true')
  return sanityRequest<{ results?: Array<{ document?: SanityPost }> }>(connection, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  })
}

export async function ensureDraftSanityPost(
  connection: SanityConnection,
  requestedDocumentId: string,
  documentType: SanityPost['_type'] = 'blogPost',
) {
  const publishedId = publishedIdFor(requestedDocumentId)
  const draftId = `drafts.${publishedId}`
  const posts = await queryPosts(
    connection,
    `*[_type == $documentType && _id in [$draftId, $publishedId]]`,
    { draftId, publishedId, documentType },
  )
  const draft = posts.find(({ _id }) => _id === draftId)
  if (draft) return draft

  const published = posts.find(({ _id }) => _id === publishedId)
  if (!published) throw new Error('The content could not be found in Sanity.')

  const { _rev, _createdAt, _updatedAt, ...content } = published
  void _rev
  void _createdAt
  void _updatedAt
  const created = await mutate(connection, [
    { createIfNotExists: { ...content, _id: draftId, _type: documentType } },
  ])
  const createdDraft = created.results?.[0]?.document
  if (!createdDraft) throw new Error('Sanity did not create the narration draft.')
  return createdDraft
}

export async function patchNarration(
  connection: SanityConnection,
  post: SanityPost,
  narration: NarrationRecord,
) {
  const result = await mutate(connection, [
    {
      patch: {
        id: post._id,
        ifRevisionID: post._rev,
        set: { narration },
      },
    },
  ])
  const updated = result.results?.[0]?.document
  if (!updated) throw new Error('Sanity did not return the updated content.')
  return updated
}

export async function uploadNarrationAsset({
  connection,
  audio,
  filename,
}: {
  connection: SanityConnection
  audio: Buffer
  filename: string
}) {
  const url = apiUrl(connection, `assets/files/${connection.dataset}`)
  url.searchParams.set('filename', filename)
  const uploaded = await sanityRequest<{ document?: { _id?: string } }>(connection, url, {
    method: 'POST',
    headers: { 'Content-Type': 'audio/mpeg' },
    body: new Blob(
      [audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer],
      { type: 'audio/mpeg' },
    ),
  })
  const assetId = uploaded.document?._id
  if (!assetId) throw new Error('Sanity did not return an audio asset ID.')
  return assetId
}

export async function verifySanityStudioUser({ projectId, dataset, token }: SanityConnection) {
  const connection = { projectId, dataset, token }
  const response = await fetch(apiUrl(connection, 'users/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return undefined

  const user = (await response.json()) as { id?: unknown; role?: unknown }
  if (typeof user.id !== 'string' || typeof user.role !== 'string') return undefined
  return { id: user.id, role: user.role }
}

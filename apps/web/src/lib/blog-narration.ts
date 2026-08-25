type NarrationTextChild = {
  text?: unknown
}

type NarrationContentBlock = {
  _type?: unknown
  children?: NarrationTextChild[]
}

type NarrationSource = {
  title: string
  excerpt?: string
  content?: NarrationContentBlock[]
  scriptOverride?: string
}

export function normalizeNarrationText(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function portableTextBlockText(block: NarrationContentBlock) {
  if (block._type !== 'block' || !Array.isArray(block.children)) return ''
  return normalizeNarrationText(
    block.children.map((child) => (typeof child.text === 'string' ? child.text : '')).join(''),
  )
}

export function buildBlogNarrationScript({
  title,
  excerpt,
  content = [],
  scriptOverride,
}: NarrationSource) {
  const override = normalizeNarrationText(scriptOverride ?? '')
  if (override) return override

  const body = content.map(portableTextBlockText).filter(Boolean)
  const normalizedExcerpt = normalizeNarrationText(excerpt ?? '')
  const firstBodyParagraph = body[0]?.toLocaleLowerCase('en-GB') ?? ''
  const excerptAlreadyIntroducesBody =
    normalizedExcerpt.length > 0 &&
    firstBodyParagraph.startsWith(normalizedExcerpt.toLocaleLowerCase('en-GB'))

  return [
    normalizeNarrationText(title),
    excerptAlreadyIntroducesBody ? '' : normalizedExcerpt,
    ...body,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function splitLongParagraph(paragraph: string, maximumCharacters: number) {
  const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean)
  const pieces: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (sentence.length > maximumCharacters) {
      const words = sentence.split(/\s+/)
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word
        if (candidate.length > maximumCharacters && current) {
          pieces.push(current)
          current = word
        } else {
          current = candidate
        }
      }
      continue
    }

    const candidate = current ? `${current} ${sentence}` : sentence
    if (candidate.length > maximumCharacters && current) {
      pieces.push(current)
      current = sentence
    } else {
      current = candidate
    }
  }

  if (current) pieces.push(current)
  return pieces
}

export function splitNarrationScript(script: string, maximumCharacters = 9_000) {
  if (maximumCharacters < 100)
    throw new Error('Narration chunks must allow at least 100 characters.')

  const paragraphs = normalizeNarrationText(script)
    .split(/\n{2,}/)
    .flatMap((paragraph) =>
      paragraph.length > maximumCharacters
        ? splitLongParagraph(paragraph, maximumCharacters)
        : [paragraph],
    )
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph
    if (candidate.length > maximumCharacters && current) {
      chunks.push(current)
      current = paragraph
    } else {
      current = candidate
    }
  }

  if (current) chunks.push(current)
  return chunks
}

export function secondsToIsoDuration(durationSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(durationSeconds))
  const hours = Math.floor(safeSeconds / 3_600)
  const minutes = Math.floor((safeSeconds % 3_600) / 60)
  const seconds = safeSeconds % 60

  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds || (!hours && !minutes) ? `${seconds}S` : ''}`
}

type ArticleContentBlock = {
  _type?: unknown
  style?: unknown
  children?: unknown
}

export type ArticleHeading = {
  id: string
  text: string
}

export function articleHeadingId(text: string) {
  return (
    text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  )
}

export function extractArticleHeadings(content: readonly ArticleContentBlock[] = []) {
  return content.flatMap((block): ArticleHeading[] => {
    if (block._type !== 'block' || block.style !== 'h2' || !Array.isArray(block.children)) return []

    const text = block.children
      .map((child) =>
        typeof child === 'object' && child && 'text' in child && typeof child.text === 'string'
          ? child.text
          : '',
      )
      .join('')
      .trim()

    return text ? [{ id: articleHeadingId(text), text }] : []
  })
}

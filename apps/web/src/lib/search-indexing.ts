export const EXPECTED_STRENGTH_COUNT = 5

export function shouldIndexBlogArchive(postCount: number) {
  return postCount > 0
}

export function shouldIndexStrengthsArchive(strengthCount: number) {
  return strengthCount >= EXPECTED_STRENGTH_COUNT
}

export function strengthsArchiveDescription(strengthCount: number) {
  if (shouldIndexStrengthsArchive(strengthCount)) {
    return 'Five things I do well. Each one with a clear purpose and real examples behind it.'
  }

  if (strengthCount === 1) {
    return 'A product design leadership strength grounded in a clear purpose and real examples.'
  }

  if (strengthCount > 1) {
    return `${strengthCount} product design leadership strengths, each grounded in a clear purpose and real examples.`
  }

  return 'Product design leadership strengths grounded in clear purpose and real examples.'
}

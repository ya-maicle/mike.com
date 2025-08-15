import { createClient } from 'next-sanity'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

export async function testSanityConnection(): Promise<boolean> {
  try {
    console.log('Testing Sanity connection...')
    console.log(
      'All env vars starting with SANITY:',
      Object.keys(process.env).filter((key) => key.includes('SANITY')),
    )
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)

    // Create a test client directly (avoiding server-only import issue)
    const testClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: '2025-01-01',
      useCdn: false, // Use live API for testing
      token: process.env.SANITY_API_READ_TOKEN,
    })

    // Simple query to test connectivity - get any document type count
    const result = await testClient.fetch('*[_type == "sanity.imageAsset"][0..1]')

    console.log('✅ Sanity connection successful')
    console.log('Query result:', result)
    return true
  } catch (error) {
    console.error('❌ Sanity connection failed:', error)
    return false
  }
}

// Enable direct execution for manual testing
if (require.main === module) {
  testSanityConnection().catch(console.error)
}

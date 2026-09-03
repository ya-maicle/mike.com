import { useState } from 'react'
import { useClient, type DocumentActionComponent } from 'sanity'

type BlogDocument = {
  _id?: string
  narration?: {
    audioFile?: { asset?: { _ref?: string } }
    generationStatus?: string
  }
}

type NarrationResponse = {
  status?: 'current' | 'ready'
  error?: string
}

export const GenerateBlogNarrationAction: DocumentActionComponent = (props) => {
  const { draft, published, onComplete, type } = props
  const client = useClient({ apiVersion: '2025-01-01' })
  const [working, setWorking] = useState(false)
  const [confirmRegeneration, setConfirmRegeneration] = useState(false)

  if (type !== 'blogPost' && type !== 'caseStudy') return null

  const document = (draft ?? published) as BlogDocument | null
  const hasAudio = Boolean(document?.narration?.audioFile?.asset?._ref)
  const label = working
    ? 'Generating narration…'
    : hasAudio
      ? 'Regenerate narration'
      : 'Generate narration'

  async function generate() {
    setWorking(true)
    try {
      const token = client.config().token
      if (!token) throw new Error('Your Sanity Studio session token is unavailable. Sign in again.')

      const response = await fetch('/api/blog-narration/generate', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document?._id ?? props.id,
          documentType: type,
          regenerate: hasAudio,
        }),
      })
      const result = (await response.json()) as NarrationResponse
      if (!response.ok) throw new Error(result.error || 'Narration generation failed.')

      window.alert(
        result.status === 'current'
          ? 'The attached narration already matches this draft.'
          : 'Narration is ready and attached to the draft. Review it, then publish when ready.',
      )
      onComplete()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Narration generation failed.')
    } finally {
      setWorking(false)
    }
  }

  return {
    label,
    icon: () => '🎙️',
    disabled: working || !document,
    title: 'Generate an ElevenLabs MP3 and attach it to this content draft',
    onHandle: () => {
      if (hasAudio) setConfirmRegeneration(true)
      else void generate()
    },
    dialog: confirmRegeneration
      ? {
          type: 'confirm',
          tone: 'caution',
          message:
            'Regenerate this narration? This uses ElevenLabs credits and replaces the audio attached to the draft.',
          confirmButtonText: 'Regenerate',
          onConfirm: () => {
            setConfirmRegeneration(false)
            void generate()
          },
          onCancel: () => setConfirmRegeneration(false),
        }
      : null,
  }
}

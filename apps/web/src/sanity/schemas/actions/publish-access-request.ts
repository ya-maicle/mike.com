import { useEffect, useRef, useState } from 'react'
import {
  useClient,
  useDocumentOperation,
  useDocumentOperationEvent,
  useSyncState,
  useValidationStatus,
  type DocumentActionComponent,
} from 'sanity'

export const PublishAccessRequestAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: '2025-01-01' })
  const { publish } = useDocumentOperation(props.id, props.type)
  const event = useDocumentOperationEvent(props.id, props.type)
  const { isSyncing } = useSyncState(props.id, props.type)
  const { isValidating, validation } = useValidationStatus(props.id, props.type)
  const [working, setWorking] = useState(false)
  const waiting = useRef(false)
  const lastEvent = useRef(event)
  const record = props.draft ?? props.published

  async function notify() {
    setWorking(true)
    try {
      const kind = record?.status === 'approved' ? 'visitor' : 'admin'
      const proof = crypto.randomUUID()
      const digest = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(proof))),
      )
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
      // This authenticated write works with both cookie and token Studio sessions.
      // The server consumes it once; no Studio credential leaves Sanity.
      await client
        .patch(props.id)
        .set({
          notificationProof: {
            digest,
            kind,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
          },
        })
        .commit({ visibility: 'sync' })
      const response = await fetch('/api/portfolio-access/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: props.id,
          kind,
          proof,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      if (result.status === 'disabled')
        window.alert(
          'Decision saved. Email is not configured: check Access notifications in Sanity and the server RESEND_API_KEY.',
        )
      if (result.status === 'failed')
        window.alert('Decision saved, but email failed. Use Retry notification on this request.')
      if (result.status === 'skipped' && record?.status === 'approved')
        window.alert(
          'Decision saved. No approval email was sent because this account cannot currently read the requested study. Check company blocks, selected studies and expiry.',
        )
      props.onComplete()
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Notification failed. Your decision is saved.',
      )
    } finally {
      setWorking(false)
    }
  }

  useEffect(() => {
    if (event === lastEvent.current) return
    lastEvent.current = event
    if (!waiting.current || event?.op !== 'publish') return
    waiting.current = false
    if (event.type === 'error') {
      setWorking(false)
      return
    }
    if (record?.status === 'approved') void notify()
    else {
      setWorking(false)
      props.onComplete()
    }
    // The publish operation event triggers exactly one notification attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  if (!props.draft) {
    if (props.published?.status !== 'approved' && props.published?.status !== 'pending') return null
    return {
      label: working ? 'Sending…' : 'Retry notification',
      disabled: working,
      onHandle: () => void notify(),
    }
  }
  return {
    label: working
      ? 'Saving…'
      : record?.status === 'approved'
        ? 'Approve and notify'
        : 'Publish decision',
    disabled:
      working ||
      !!publish.disabled ||
      isSyncing ||
      isValidating ||
      validation.some((item) => item.level === 'error'),
    onHandle: () => {
      waiting.current = true
      lastEvent.current = event
      setWorking(true)
      publish.execute()
    },
  }
}
PublishAccessRequestAction.action = 'publish'

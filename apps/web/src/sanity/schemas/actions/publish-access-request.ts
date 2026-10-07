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
  const [message, setMessage] = useState<string | null>(null)
  const waiting = useRef(false)
  const lastEvent = useRef(event)
  const record = props.draft ?? props.published

  async function notify(newDecision = false) {
    setWorking(true)
    try {
      const kind = record?.status === 'pending' ? 'admin' : 'visitor'
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
          ...(newDecision
            ? { decisionVersion: crypto.randomUUID(), visitorNotification: { state: 'pending' } }
            : {}),
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
        setMessage(
          'Decision saved. Email is not configured: check Portfolio access settings and the server RESEND_API_KEY.',
        )
      if (result.status === 'failed')
        setMessage('Decision saved, but email failed. Use Retry notification on this request.')
      if (result.status === 'skipped' && record?.status === 'approved')
        setMessage(
          'Decision saved. No approval email was sent because this account cannot currently read the selected portfolio work. Check company blocks, selected studies and expiry.',
        )
      if (result.status === 'sent')
        setMessage(
          'Saved. The email provider has accepted the notification. The delivery receipt is shown on this request.',
        )
      if (result.status === 'skipped' && record?.status !== 'approved') props.onComplete()
    } catch (error) {
      setMessage(
        `Your decision is saved, but the notification could not be completed. Use Retry notification. ${error instanceof Error ? error.message : ''}`,
      )
    } finally {
      setWorking(false)
    }
  }

  const dialog = message
    ? {
        type: 'dialog' as const,
        header: 'Portfolio notification',
        content: message,
        onClose: () => {
          setMessage(null)
          props.onComplete()
        },
      }
    : undefined

  useEffect(() => {
    if (event === lastEvent.current) return
    lastEvent.current = event
    if (!waiting.current || event?.op !== 'publish') return
    waiting.current = false
    if (event.type === 'error') {
      setWorking(false)
      return
    }
    if (['approved', 'declined', 'revoked'].includes(String(record?.status))) void notify(true)
    else {
      setWorking(false)
      props.onComplete()
    }
    // The publish operation event triggers exactly one notification attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  if (!props.draft) {
    if (!['approved', 'pending', 'declined', 'revoked'].includes(String(props.published?.status)))
      return null
    return {
      dialog,
      label: working ? 'Sending…' : 'Retry notification',
      disabled: working,
      onHandle: () => void notify(),
    }
  }
  return {
    dialog,
    label: working
      ? 'Saving…'
      : record?.status === 'approved'
        ? 'Approve portfolio access and notify'
        : record?.status === 'declined'
          ? 'Decline and notify'
          : record?.status === 'revoked'
            ? 'Revoke access and notify'
            : 'Save pending request',
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

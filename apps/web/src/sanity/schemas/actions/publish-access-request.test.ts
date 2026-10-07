// @vitest-environment jsdom
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PublishAccessRequestAction } from './publish-access-request'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true
const mocks = vi.hoisted(() => ({
  event: null as null | { op: string; type: string },
  execute: vi.fn(),
  set: vi.fn(),
  commit: vi.fn(),
  complete: vi.fn(),
  fetch: vi.fn(),
  validation: [] as { level: string }[],
  syncing: false,
}))
vi.mock('sanity', () => ({
  useClient: () => ({ patch: () => ({ set: mocks.set }) }),
  useDocumentOperation: () => ({ publish: { disabled: false, execute: mocks.execute } }),
  useDocumentOperationEvent: () => mocks.event,
  useSyncState: () => ({ isSyncing: mocks.syncing }),
  useValidationStatus: () => ({ isValidating: false, validation: mocks.validation }),
}))
type Props = Parameters<typeof PublishAccessRequestAction>[0]
function Harness(props: Props) {
  const action = PublishAccessRequestAction(props)
  const dialog = action?.dialog && 'content' in action.dialog ? action.dialog.content : null
  return React.createElement(
    'div',
    {},
    React.createElement(
      'button',
      { disabled: !!action?.disabled, onClick: action?.onHandle },
      action?.label,
    ),
    dialog ? React.createElement('p', { role: 'status' }, dialog) : null,
  )
}
describe('Sanity portfolio review action', () => {
  let root: Root
  let container: HTMLDivElement
  let props: Props
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.event = null
    mocks.validation = []
    mocks.syncing = false
    mocks.set.mockReturnValue({ commit: mocks.commit })
    mocks.commit.mockResolvedValue({})
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status: 'sent' }) })
    vi.stubGlobal('fetch', mocks.fetch)
    vi.stubGlobal('crypto', webcrypto)
    props = {
      id: 'portfolioAccessRequest.test',
      type: 'portfolioAccessRequest',
      draft: { _id: 'drafts.portfolioAccessRequest.test', status: 'approved' },
      published: null,
      onComplete: mocks.complete,
    } as unknown as Props
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })
  async function render() {
    await act(async () => root.render(React.createElement(Harness, props)))
  }
  async function publish() {
    await render()
    await act(async () => container.querySelector('button')!.click())
    expect(mocks.fetch).not.toHaveBeenCalled()
    mocks.event = { op: 'publish', type: 'success' }
    await render()
    await act(async () => {
      await vi.waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce())
    })
  }
  it('waits for the published decision before calling the visitor notification endpoint', async () => {
    await publish()
    expect(mocks.execute).toHaveBeenCalledOnce()
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorNotification: { state: 'pending' },
        decisionVersion: expect.any(String),
      }),
    )
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).toMatchObject({
      id: props.id,
      kind: 'visitor',
    })
    expect(container.textContent).toContain('email provider has accepted')
    await render()
    expect(mocks.fetch).toHaveBeenCalledOnce()
  })
  it('keeps failed delivery visible without claiming that approval failed', async () => {
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status: 'failed' }) })
    await publish()
    expect(container.textContent).toContain('Decision saved, but email failed')
    expect(container.textContent).toContain('Retry notification')
  })
  it('prevents publication while scope/domain validation is failing', async () => {
    mocks.validation = [{ level: 'error' }]
    await render()
    expect(container.querySelector('button')!.disabled).toBe(true)
    expect(mocks.execute).not.toHaveBeenCalled()
  })
  it('retries a saved pending request without publishing or creating a new decision', async () => {
    props = {
      ...props,
      draft: null,
      published: { _id: props.id, status: 'pending' },
    } as unknown as Props
    await render()
    await act(async () => container.querySelector('button')!.click())
    await act(async () => {
      await vi.waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce())
    })
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body).kind).toBe('admin')
    expect(mocks.execute).not.toHaveBeenCalled()
    expect(mocks.set.mock.calls[0][0].decisionVersion).toBeUndefined()
  })
})

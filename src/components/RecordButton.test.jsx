import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RecordButton from './RecordButton'

class FakeMediaRecorder {
  constructor(stream) {
    this.stream = stream
    this.state = 'inactive'
    FakeMediaRecorder.instances.push(this)
  }
  start() { this.state = 'recording' }
  stop() {
    if (this.state !== 'recording') throw new DOMException('already inactive', 'InvalidStateError')
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['x'], { type: 'video/webm' }), })
    this.onstop?.()
  }
}
FakeMediaRecorder.isTypeSupported = () => true

function fakeTrack() { return { stop: vi.fn() } }
function fakeStream() { return { getTracks: () => [fakeTrack(), fakeTrack()] } }

beforeEach(() => {
  FakeMediaRecorder.instances = []
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
  vi.stubGlobal('navigator', {
    ...navigator,
    mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(fakeStream()) },
    canShare: () => true,
    share: vi.fn().mockResolvedValue(undefined),
  })
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:fake') })
})

describe('RecordButton', () => {
  it('starts and stops a recording, sharing the resulting file', async () => {
    const user = userEvent.setup()
    render(<RecordButton />)
    await user.click(screen.getByRole('button', { name: 'הקלט עכשיו' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'עצור הקלטה' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'עצור הקלטה' }))
    await waitFor(() => expect(navigator.share).toHaveBeenCalled())
  })

  it('ignores a second start click while already starting or recording', async () => {
    const user = userEvent.setup()
    render(<RecordButton />)
    await user.click(screen.getByRole('button', { name: 'הקלט עכשיו' }))
    await user.click(screen.getByRole('button', { name: /עצור הקלטה|מתחיל/ }))
    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1))
  })

  it('shows an error and does not call share when getUserMedia fails', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('denied'))
    const user = userEvent.setup()
    render(<RecordButton />)
    await user.click(screen.getByRole('button', { name: 'הקלט עכשיו' }))
    expect(await screen.findByText(/לא ניתן לגשת למצלמה/)).toBeInTheDocument()
  })

  it('shows a download fallback link when share fails with a real error (not cancellation)', async () => {
    navigator.share.mockRejectedValueOnce(Object.assign(new Error('boom'), { name: 'NotAllowedError' }))
    const user = userEvent.setup()
    render(<RecordButton />)
    await user.click(screen.getByRole('button', { name: 'הקלט עכשיו' }))
    await waitFor(() => screen.getByRole('button', { name: 'עצור הקלטה' }))
    await user.click(screen.getByRole('button', { name: 'עצור הקלטה' }))
    expect(await screen.findByText('הורד את הסרטון')).toBeInTheDocument()
  })

  it('does not show a download link when the user simply cancels the share sheet', async () => {
    navigator.share.mockRejectedValueOnce(Object.assign(new Error('cancelled'), { name: 'AbortError' }))
    const user = userEvent.setup()
    render(<RecordButton />)
    await user.click(screen.getByRole('button', { name: 'הקלט עכשיו' }))
    await waitFor(() => screen.getByRole('button', { name: 'עצור הקלטה' }))
    await user.click(screen.getByRole('button', { name: 'עצור הקלטה' }))
    await new Promise(r => setTimeout(r, 0))
    expect(screen.queryByText('הורד את הסרטון')).not.toBeInTheDocument()
  })
})

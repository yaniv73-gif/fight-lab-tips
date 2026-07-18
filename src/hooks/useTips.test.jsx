import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTips } from './useTips'

const mockFetchTips = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockChannel = vi.fn()
const mockRemoveChannel = vi.fn()

vi.mock('../lib/tips', () => ({ fetchTips: (...args) => mockFetchTips(...args) }))
vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: (...args) => mockChannel(...args),
    removeChannel: (...args) => mockRemoveChannel(...args),
  },
}))

function Probe() {
  const { tips, error } = useTips()
  if (error) return <div>error: {error.message}</div>
  if (tips === undefined) return <div>loading</div>
  return <div>{tips.length} tips</div>
}

describe('useTips', () => {
  beforeEach(() => {
    mockFetchTips.mockReset(); mockOn.mockReset(); mockSubscribe.mockReset()
    mockChannel.mockReset(); mockRemoveChannel.mockReset()
    mockOn.mockReturnValue({ on: mockOn, subscribe: mockSubscribe })
    mockChannel.mockReturnValue({ on: mockOn })
  })

  it('loads tips on mount', async () => {
    mockFetchTips.mockResolvedValue([{ id: '1' }, { id: '2' }])
    render(<Probe />)
    expect(screen.getByText('loading')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('2 tips')).toBeInTheDocument())
  })

  it('surfaces an error if fetching fails', async () => {
    mockFetchTips.mockRejectedValue(new Error('offline'))
    render(<Probe />)
    await waitFor(() => expect(screen.getByText('error: offline')).toBeInTheDocument())
  })

  it('subscribes to realtime changes on both tables', async () => {
    mockFetchTips.mockResolvedValue([])
    render(<Probe />)
    await waitFor(() => expect(mockChannel).toHaveBeenCalledWith('tips-changes'))
    expect(mockOn).toHaveBeenCalledWith('postgres_changes', { event: '*', schema: 'public', table: 'tips' }, expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('postgres_changes', { event: '*', schema: 'public', table: 'publications' }, expect.any(Function))
  })

  it('clears a previous error once a later reload succeeds', async () => {
    mockFetchTips.mockRejectedValueOnce(new Error('offline'))
    render(<Probe />)
    await waitFor(() => expect(screen.getByText('error: offline')).toBeInTheDocument())

    mockFetchTips.mockResolvedValueOnce([{ id: '1' }])
    // simulate the realtime subscription firing and triggering another reload
    const reloadCallback = mockOn.mock.calls[0][2]
    await reloadCallback()

    await waitFor(() => expect(screen.getByText('1 tips')).toBeInTheDocument())
  })
})

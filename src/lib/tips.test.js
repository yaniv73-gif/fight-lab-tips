import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTips, createTip, attachVideo, addPublication } from './tips'

const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()

vi.mock('./supabase', () => ({
  supabase: { from: (...args) => mockFrom(...args) },
}))

beforeEach(() => {
  mockSelect.mockReset(); mockOrder.mockReset(); mockInsert.mockReset()
  mockUpdate.mockReset(); mockEq.mockReset(); mockSingle.mockReset(); mockFrom.mockReset()
})

describe('fetchTips', () => {
  it('selects tips joined with their publications, newest first', async () => {
    mockOrder.mockResolvedValue({ data: [{ id: '1', title: 'קרוס פייס' }], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })

    const result = await fetchTips()

    expect(mockFrom).toHaveBeenCalledWith('tips')
    expect(mockSelect).toHaveBeenCalledWith('*, publications(*)')
    expect(mockOrder).toHaveBeenCalledWith('date_added', { ascending: false })
    expect(result).toEqual([{ id: '1', title: 'קרוס פייס' }])
  })

  it('throws when Supabase returns an error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('network down') })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })

    await expect(fetchTips()).rejects.toThrow('network down')
  })
})

describe('createTip', () => {
  it('inserts a new tip and returns it with its (empty) publications', async () => {
    mockSingle.mockResolvedValue({ data: { id: '2', title: 'קו המשווה' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const result = await createTip({ title: 'קו המשווה', category: 'עקרונות כלליים', tags: ['הרמות'], note: '' })

    expect(mockFrom).toHaveBeenCalledWith('tips')
    expect(mockInsert).toHaveBeenCalledWith({
      title: 'קו המשווה', category: 'עקרונות כלליים', tags: ['הרמות'], note: '', youtube_url: null,
    })
    expect(result).toEqual({ id: '2', title: 'קו המשווה' })
  })
})

describe('attachVideo', () => {
  it('sets youtube_url and date_filmed on the given tip', async () => {
    mockSingle.mockResolvedValue({ data: { id: '2', youtube_url: 'https://youtu.be/xyz' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    const result = await attachVideo('2', 'https://youtu.be/xyz')

    expect(mockFrom).toHaveBeenCalledWith('tips')
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ youtube_url: 'https://youtu.be/xyz' }))
    expect(mockEq).toHaveBeenCalledWith('id', '2')
    expect(result.youtube_url).toBe('https://youtu.be/xyz')
  })
})

describe('addPublication', () => {
  it('inserts a publication row scoped to the given tip', async () => {
    mockSingle.mockResolvedValue({ data: { id: '9', tip_id: '2', platform: 'Instagram' }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ insert: mockInsert })

    const result = await addPublication('2', { platform: 'Instagram', postUrl: 'https://instagram.com/p/abc' })

    expect(mockFrom).toHaveBeenCalledWith('publications')
    expect(mockInsert).toHaveBeenCalledWith({ tip_id: '2', platform: 'Instagram', post_url: 'https://instagram.com/p/abc' })
    expect(result.platform).toBe('Instagram')
  })
})

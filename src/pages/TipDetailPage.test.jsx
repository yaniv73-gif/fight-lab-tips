import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TipDetailPage from './TipDetailPage'

const mockUseTips = vi.fn()
const mockAttachVideo = vi.fn()
const mockAddPublication = vi.fn()

vi.mock('../hooks/useTips', () => ({ useTips: () => mockUseTips() }))
vi.mock('../lib/tips', () => ({
  attachVideo: (...args) => mockAttachVideo(...args),
  addPublication: (...args) => mockAddPublication(...args),
}))

function renderAt(id, tips, extra = {}) {
  mockUseTips.mockReturnValue({ tips, error: null, reload: vi.fn(), ...extra })
  return render(
    <MemoryRouter initialEntries={[`/tips/${id}`]}>
      <Routes><Route path="/tips/:id" element={<TipDetailPage />} /></Routes>
    </MemoryRouter>,
  )
}

const IDEA_TIP = { id: '1', title: 'מרפק מעל כתף', category: 'מצבים', tags: ['ארמבר'], youtube_url: null, note: 'הערה', publications: [] }
const FILMED_TIP = { id: '2', title: 'קצה מקל', category: 'שליטה ולחץ', tags: ['ארמבר'], youtube_url: 'https://youtu.be/x', note: '', publications: [] }
const PUBLISHED_TIP = {
  id: '3', title: 'קרוס פייס', category: 'שליטה ולחץ', tags: ['סייד'], youtube_url: 'https://youtu.be/y', note: '',
  publications: [{ id: 'p1', platform: 'Instagram', published_date: '2026-07-12T00:00:00Z', post_url: null }],
}

describe('TipDetailPage', () => {
  beforeEach(() => { mockAttachVideo.mockReset(); mockAddPublication.mockReset() })

  it('shows a loading state while tips are undefined', () => {
    renderAt('1', undefined)
    expect(screen.getByText('טוען...')).toBeInTheDocument()
  })

  it('shows an error with a retry button when useTips reports an error', async () => {
    const mockReload = vi.fn()
    renderAt('1', undefined, { error: new Error('offline'), reload: mockReload })
    expect(screen.getByText(/offline/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'נסה שוב' }))
    expect(mockReload).toHaveBeenCalled()
  })

  it('shows "mark as filmed" only for idea-status tips', () => {
    renderAt('1', [IDEA_TIP])
    expect(screen.getByRole('button', { name: /סמן כצולם/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /רשום פרסום/ })).not.toBeInTheDocument()
  })

  it('shows "log a publish" for filmed and published tips, not "mark as filmed"', () => {
    renderAt('2', [FILMED_TIP])
    expect(screen.queryByRole('button', { name: /סמן כצולם/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /רשום פרסום/ })).toBeInTheDocument()
  })

  it('shows publication history for published tips', () => {
    renderAt('3', [PUBLISHED_TIP])
    expect(screen.getByText('Instagram')).toBeInTheDocument()
  })

  it('calls attachVideo with the pasted link when marking an idea as filmed', async () => {
    mockAttachVideo.mockResolvedValue({ ...IDEA_TIP, youtube_url: 'https://youtu.be/new' })
    renderAt('1', [IDEA_TIP])
    await userEvent.click(screen.getByRole('button', { name: /סמן כצולם/ }))
    await userEvent.type(screen.getByPlaceholderText(/קישור/), 'https://youtu.be/new')
    await userEvent.click(screen.getByRole('button', { name: /שמור קישור/ }))
    expect(mockAttachVideo).toHaveBeenCalledWith('1', 'https://youtu.be/new')
  })

  it('calls addPublication with the chosen platform when logging a publish', async () => {
    mockAddPublication.mockResolvedValue({ id: 'p2', platform: 'TikTok' })
    renderAt('2', [FILMED_TIP])
    await userEvent.click(screen.getByRole('button', { name: /רשום פרסום/ }))
    await userEvent.click(screen.getByRole('button', { name: 'TikTok' }))
    expect(mockAddPublication).toHaveBeenCalledWith('2', { platform: 'TikTok', postUrl: null })
  })

  it('embeds a youtu.be short link correctly', () => {
    renderAt('3', [{ ...PUBLISHED_TIP, youtube_url: 'https://youtu.be/abc123' }])
    expect(screen.getByTitle('קרוס פייס')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123')
  })

  it('embeds a youtube.com/watch?v= link correctly', () => {
    renderAt('3', [{ ...PUBLISHED_TIP, youtube_url: 'https://www.youtube.com/watch?v=xyz789' }])
    expect(screen.getByTitle('קרוס פייס')).toHaveAttribute('src', 'https://www.youtube.com/embed/xyz789')
  })
})

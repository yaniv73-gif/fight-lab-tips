import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TipDetailPage from './TipDetailPage'

const mockUseTips = vi.fn()
const mockAttachVideo = vi.fn()
const mockAddPublication = vi.fn()
const mockUpdateTip = vi.fn()
const mockDeleteTip = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../hooks/useTips', () => ({ useTips: () => mockUseTips() }))
vi.mock('../lib/tips', () => ({
  attachVideo: (...args) => mockAttachVideo(...args),
  addPublication: (...args) => mockAddPublication(...args),
  updateTip: (...args) => mockUpdateTip(...args),
  deleteTip: (...args) => mockDeleteTip(...args),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

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

beforeEach(() => {
  mockAttachVideo.mockReset()
  mockAddPublication.mockReset()
  mockUpdateTip.mockReset()
  mockDeleteTip.mockReset()
  mockNavigate.mockReset()
})

describe('TipDetailPage', () => {

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

  it('shows a plain link instead of an iframe for an unrecognized video URL', () => {
    renderAt('3', [{ ...PUBLISHED_TIP, youtube_url: 'https://example.com/not-youtube' }])
    expect(screen.queryByTitle('קרוס פייס')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /example\.com\/not-youtube/ })).toHaveAttribute('href', 'https://example.com/not-youtube')
  })
})

describe('editing a tip', () => {
  it('shows an edit form pre-filled with the tip\'s current values', async () => {
    renderAt('3', [PUBLISHED_TIP])
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }))
    expect(screen.getByDisplayValue('קרוס פייס')).toBeInTheDocument()
    expect(screen.getByDisplayValue('שליטה ולחץ')).toBeInTheDocument()
  })

  it('disables save until title and category are non-empty', async () => {
    renderAt('3', [PUBLISHED_TIP])
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }))
    const titleInput = screen.getByDisplayValue('קרוס פייס')
    await userEvent.clear(titleInput)
    expect(screen.getByRole('button', { name: /שמור/ })).toBeDisabled()
  })

  it('calls updateTip with the edited fields and reloads on success', async () => {
    const mockReload = vi.fn()
    mockUpdateTip.mockResolvedValue({ ...PUBLISHED_TIP, title: 'קרוס פייס מעודכן' })
    renderAt('3', [PUBLISHED_TIP], { reload: mockReload })
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }))
    const titleInput = screen.getByDisplayValue('קרוס פייס')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'קרוס פייס מעודכן')
    await userEvent.click(screen.getByRole('button', { name: /שמור/ }))
    expect(mockUpdateTip).toHaveBeenCalledWith('3', expect.objectContaining({ title: 'קרוס פייס מעודכן' }))
    expect(mockReload).toHaveBeenCalled()
  })

  it('cancels edit mode without saving', async () => {
    renderAt('3', [PUBLISHED_TIP])
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }))
    await userEvent.click(screen.getByRole('button', { name: 'ביטול' }))
    expect(mockUpdateTip).not.toHaveBeenCalled()
    expect(screen.getByText('קרוס פייס')).toBeInTheDocument()
  })
})

describe('deleting a tip', () => {
  it('shows a confirmation before deleting, not deleting on the first tap', async () => {
    renderAt('3', [PUBLISHED_TIP])
    await userEvent.click(screen.getByRole('button', { name: 'מחק טיפ' }))
    expect(mockDeleteTip).not.toHaveBeenCalled()
    expect(screen.getByText(/בלתי הפיכה/)).toBeInTheDocument()
  })

  it('deletes and navigates to the browse list on confirmation', async () => {
    mockDeleteTip.mockResolvedValue(undefined)
    renderAt('3', [PUBLISHED_TIP])
    await userEvent.click(screen.getByRole('button', { name: 'מחק טיפ' }))
    await userEvent.click(screen.getByRole('button', { name: 'כן, מחק' }))
    expect(mockDeleteTip).toHaveBeenCalledWith('3')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('dismisses the confirmation without deleting when cancelled', async () => {
    renderAt('3', [PUBLISHED_TIP])
    await userEvent.click(screen.getByRole('button', { name: 'מחק טיפ' }))
    await userEvent.click(screen.getByRole('button', { name: 'ביטול' }))
    expect(mockDeleteTip).not.toHaveBeenCalled()
    expect(screen.queryByText(/בלתי הפיכה/)).not.toBeInTheDocument()
  })
})

describe('cancelling inline forms', () => {
  it('closes the mark-as-filmed form without calling attachVideo', async () => {
    renderAt('1', [IDEA_TIP])
    await userEvent.click(screen.getByRole('button', { name: /סמן כצולם/ }))
    await userEvent.type(screen.getByPlaceholderText(/קישור/), 'https://youtu.be/typed')
    await userEvent.click(screen.getByRole('button', { name: 'ביטול' }))
    expect(mockAttachVideo).not.toHaveBeenCalled()
    expect(screen.queryByPlaceholderText(/קישור/)).not.toBeInTheDocument()
  })

  it('closes the log-a-publish form without calling addPublication', async () => {
    renderAt('2', [FILMED_TIP])
    await userEvent.click(screen.getByRole('button', { name: /רשום פרסום/ }))
    await userEvent.click(screen.getByRole('button', { name: 'ביטול' }))
    expect(mockAddPublication).not.toHaveBeenCalled()
  })
})

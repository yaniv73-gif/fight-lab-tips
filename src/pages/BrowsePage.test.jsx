import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BrowsePage from './BrowsePage'

const mockUseTips = vi.fn()
vi.mock('../hooks/useTips', () => ({ useTips: () => mockUseTips() }))

const TIPS = [
  { id: '1', title: 'קרוס פייס', category: 'שליטה ולחץ', tags: ['סייד'], youtube_url: 'x', note: '', publications: [{ platform: 'Instagram' }] },
  { id: '2', title: 'מרפק מעל כתף', category: 'מצבים ומיקומים ספציפיים', tags: ['ארמבר'], youtube_url: null, note: '', publications: [] },
]

describe('BrowsePage', () => {
  beforeEach(() => mockUseTips.mockReturnValue({ tips: TIPS, error: null }))

  it('shows a loading state while tips are undefined', () => {
    mockUseTips.mockReturnValue({ tips: undefined, error: null })
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    expect(screen.getByText('טוען...')).toBeInTheDocument()
  })

  it('renders a card for every tip', () => {
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    expect(screen.getByText('קרוס פייס')).toBeInTheDocument()
    expect(screen.getByText('מרפק מעל כתף')).toBeInTheDocument()
  })

  it('filters the grid when a status chip is clicked', async () => {
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'רעיון' }))
    expect(screen.queryByText('קרוס פייס')).not.toBeInTheDocument()
    expect(screen.getByText('מרפק מעל כתף')).toBeInTheDocument()
  })

  it('filters the grid by search text', async () => {
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText(/חיפוש/), 'מרפק')
    expect(screen.queryByText('קרוס פייס')).not.toBeInTheDocument()
    expect(screen.getByText('מרפק מעל כתף')).toBeInTheDocument()
  })

  it('shows a retry button and calls reload when there is an error', async () => {
    const mockReload = vi.fn()
    mockUseTips.mockReturnValue({ tips: undefined, error: new Error('offline'), reload: mockReload })
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'נסה שוב' }))
    expect(mockReload).toHaveBeenCalled()
  })

  it('shows an empty-state message when there are no tips yet', () => {
    mockUseTips.mockReturnValue({ tips: [], error: null })
    render(<MemoryRouter><BrowsePage /></MemoryRouter>)
    expect(screen.getByText(/עדיין אין טיפים/)).toBeInTheDocument()
  })
})

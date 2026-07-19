import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import TipCard from './TipCard'

function renderCard(tip) {
  return render(<MemoryRouter><TipCard tip={tip} /></MemoryRouter>)
}

describe('TipCard', () => {
  it('links to the tip detail page', () => {
    renderCard({ id: '42', title: 'קרוס פייס', youtube_url: 'x', publications: [] })
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tips/42')
  })

  it('shows the title and derived status', () => {
    renderCard({ id: '1', title: 'קרוס פייס', youtube_url: null, publications: [] })
    expect(screen.getByText('קרוס פייס')).toBeInTheDocument()
    expect(screen.getByText('רעיון')).toBeInTheDocument()
  })

  it('shows a real YouTube thumbnail image when the video URL is recognized', () => {
    renderCard({ id: '5', title: 'קרוס פייס', youtube_url: 'https://youtu.be/abc123', publications: [] })
    const img = screen.getByRole('presentation', { hidden: true })
    expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/abc123/mqdefault.jpg')
    expect(img).toHaveAttribute('alt', '')
  })

  it('falls back to the generic play icon box when the video URL is not a recognized YouTube link', () => {
    renderCard({ id: '6', title: 'לא יוטיוב', youtube_url: 'https://example.com/video', publications: [] })
    expect(screen.queryByRole('presentation', { hidden: true })).not.toBeInTheDocument()
  })

  it('falls back to the generic play icon if the thumbnail image fails to load', () => {
    renderCard({ id: '7', title: 'וידאו שנמחק', youtube_url: 'https://youtu.be/deleted123', publications: [] })
    const img = screen.getByRole('presentation', { hidden: true })
    fireEvent.error(img)
    expect(screen.queryByRole('presentation', { hidden: true })).not.toBeInTheDocument()
  })
})

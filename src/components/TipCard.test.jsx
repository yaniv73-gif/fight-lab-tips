import { render, screen } from '@testing-library/react'
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
})

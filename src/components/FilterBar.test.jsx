// src/components/FilterBar.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'

function setup(overrides = {}) {
  const props = {
    status: null,
    onStatusChange: vi.fn(),
    allCategories: ['שליטה ולחץ'],
    allTags: ['ארמבר', 'סייד'],
    selectedCategories: [],
    onToggleCategory: vi.fn(),
    selectedTags: [],
    onToggleTag: vi.fn(),
    ...overrides,
  }
  render(<FilterBar {...props} />)
  return props
}

describe('FilterBar', () => {
  it('renders status and category/tag filters as two separately labeled groups', () => {
    setup()
    expect(screen.getByText('מצב')).toBeInTheDocument()
    expect(screen.getByText('קטגוריה ותגיות')).toBeInTheDocument()
  })

  it('calls onStatusChange with the selected status', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'פורסם' }))
    expect(props.onStatusChange).toHaveBeenCalledWith('published')
  })

  it('calls onToggleCategory when a category chip is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'שליטה ולחץ' }))
    expect(props.onToggleCategory).toHaveBeenCalledWith('שליטה ולחץ')
  })

  it('calls onToggleTag when a tag chip is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'ארמבר' }))
    expect(props.onToggleTag).toHaveBeenCalledWith('ארמבר')
  })
})

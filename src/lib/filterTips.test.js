import { describe, it, expect } from 'vitest'
import { filterTips } from './filterTips'

const tips = [
  { id: '1', title: 'קרוס פייס', category: 'שליטה ולחץ', tags: ['סייד', 'מאונט'], youtube_url: 'x', publications: [{ platform: 'Instagram' }] },
  { id: '2', title: 'קצה מקל', category: 'שליטה ולחץ', tags: ['ארמבר'], youtube_url: 'x', publications: [] },
  { id: '3', title: 'מרפק מעל כתף', category: 'מצבים ומיקומים ספציפיים', tags: ['ארמבר'], youtube_url: null, publications: [] },
]

describe('filterTips', () => {
  it('returns everything when no filters are set', () => {
    expect(filterTips(tips)).toHaveLength(3)
  })

  it('filters by derived status', () => {
    expect(filterTips(tips, { status: 'idea' }).map(t => t.id)).toEqual(['3'])
    expect(filterTips(tips, { status: 'filmed' }).map(t => t.id)).toEqual(['2'])
    expect(filterTips(tips, { status: 'published' }).map(t => t.id)).toEqual(['1'])
  })

  it('filters by category (any of the selected categories)', () => {
    expect(filterTips(tips, { categories: ['מצבים ומיקומים ספציפיים'] }).map(t => t.id)).toEqual(['3'])
  })

  it('filters by tag (tip matches if it has any selected tag)', () => {
    expect(filterTips(tips, { tags: ['ארמבר'] }).map(t => t.id)).toEqual(['2', '3'])
  })

  it('filters by search text across title and tags, case-insensitively', () => {
    expect(filterTips(tips, { search: 'קרוס' }).map(t => t.id)).toEqual(['1'])
    expect(filterTips(tips, { search: 'ARMBAR' })).toHaveLength(0) // Hebrew tags, an English query matches nothing here
  })

  it('combines status, category, tag, and search filters together', () => {
    expect(filterTips(tips, { status: 'filmed', tags: ['ארמבר'] }).map(t => t.id)).toEqual(['2'])
  })
})

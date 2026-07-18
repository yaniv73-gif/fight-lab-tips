import { describe, it, expect } from 'vitest'
import { deriveStatus } from './tipStatus'

describe('deriveStatus', () => {
  it('is "idea" when there is no youtube_url', () => {
    expect(deriveStatus({ youtube_url: null, publications: [] })).toBe('idea')
  })

  it('is "filmed" when youtube_url is set but there are no publications', () => {
    expect(deriveStatus({ youtube_url: 'https://youtu.be/abc', publications: [] })).toBe('filmed')
  })

  it('is "published" when youtube_url is set and there is at least one publication', () => {
    expect(deriveStatus({
      youtube_url: 'https://youtu.be/abc',
      publications: [{ platform: 'Instagram' }],
    })).toBe('published')
  })
})

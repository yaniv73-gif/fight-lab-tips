import { describe, it, expect } from 'vitest'
import { getYoutubeVideoId, getYoutubeThumbnail } from './youtube'

describe('getYoutubeVideoId', () => {
  it('extracts the id from a youtube.com/watch?v= link', () => {
    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=xyz789')).toBe('xyz789')
  })
  it('extracts the id from a youtu.be short link', () => {
    expect(getYoutubeVideoId('https://youtu.be/abc123')).toBe('abc123')
  })
  it('strips trailing query params from either format', () => {
    expect(getYoutubeVideoId('https://youtu.be/abc123?t=30')).toBe('abc123')
    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=xyz789&list=foo')).toBe('xyz789')
  })
  it('returns null for an unrecognized url', () => {
    expect(getYoutubeVideoId('https://example.com/not-youtube')).toBeNull()
  })
  it('returns null for a falsy input', () => {
    expect(getYoutubeVideoId(null)).toBeNull()
    expect(getYoutubeVideoId('')).toBeNull()
  })
})

describe('getYoutubeThumbnail', () => {
  it('builds a thumbnail URL for a recognized link', () => {
    expect(getYoutubeThumbnail('https://youtu.be/abc123')).toBe('https://img.youtube.com/vi/abc123/mqdefault.jpg')
  })
  it('returns null for an unrecognized link', () => {
    expect(getYoutubeThumbnail('https://example.com/not-youtube')).toBeNull()
  })
})

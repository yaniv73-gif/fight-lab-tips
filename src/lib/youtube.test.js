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

  it('extracts the id from a YouTube Shorts link', () => {
    expect(getYoutubeVideoId('https://youtube.com/shorts/PerDYvq90Mc')).toBe('PerDYvq90Mc')
  })

  it('extracts the id from a mobile YouTube Shorts link (m.youtube.com)', () => {
    expect(getYoutubeVideoId('https://m.youtube.com/shorts/PerDYvq90Mc')).toBe('PerDYvq90Mc')
  })

  it('strips trailing query params from a Shorts link', () => {
    expect(getYoutubeVideoId('https://youtube.com/shorts/PerDYvq90Mc?feature=share')).toBe('PerDYvq90Mc')
  })

  it('does not let a stray v= param in a Shorts URL override the shorts id', () => {
    expect(getYoutubeVideoId('https://youtube.com/shorts/abc123?v=SHOULDNOTWIN')).toBe('abc123')
  })

  it('does not capture a trailing slash into the id', () => {
    expect(getYoutubeVideoId('https://youtube.com/shorts/abc123/')).toBe('abc123')
    expect(getYoutubeVideoId('https://youtu.be/xyz789/')).toBe('xyz789')
  })

  it('does not capture a trailing slash into the id for a watch URL', () => {
    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=normalId/')).toBe('normalId')
  })
})

describe('getYoutubeThumbnail', () => {
  it('builds a thumbnail URL for a recognized link', () => {
    expect(getYoutubeThumbnail('https://youtu.be/abc123')).toBe('https://i.ytimg.com/vi/abc123/mqdefault.jpg')
  })
  it('returns null for an unrecognized link', () => {
    expect(getYoutubeThumbnail('https://example.com/not-youtube')).toBeNull()
  })

  it('builds a thumbnail URL for a Shorts link', () => {
    expect(getYoutubeThumbnail('https://m.youtube.com/shorts/PerDYvq90Mc')).toBe('https://i.ytimg.com/vi/PerDYvq90Mc/mqdefault.jpg')
  })
})

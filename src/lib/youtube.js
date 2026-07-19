export function getYoutubeVideoId(url) {
  if (!url) return null
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/)
  if (shortsMatch) return shortsMatch[1]
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/)
  if (shortMatch) return shortMatch[1]
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) return watchMatch[1]
  return null
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeVideoId(url)
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null
}

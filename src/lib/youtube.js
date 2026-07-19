export function getYoutubeVideoId(url) {
  if (!url) return null
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) return watchMatch[1]
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return shortMatch[1]
  return null
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeVideoId(url)
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null
}

export function deriveStatus(tip) {
  if (!tip.youtube_url) return 'idea'
  return tip.publications && tip.publications.length > 0 ? 'published' : 'filmed'
}

export const STATUS_LABELS = { idea: 'רעיון', filmed: 'צולם', published: 'פורסם' }

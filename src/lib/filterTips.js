import { deriveStatus } from './tipStatus'

export function filterTips(tips, { search = '', status = null, categories = [], tags = [] } = {}) {
  return tips.filter(tip => {
    if (status && deriveStatus(tip) !== status) return false
    if (categories.length > 0 && !categories.includes(tip.category)) return false
    if (tags.length > 0 && !tags.some(t => tip.tags.includes(t))) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const haystack = `${tip.title} ${tip.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

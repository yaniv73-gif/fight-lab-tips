import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTips } from '../hooks/useTips'
import { filterTips } from '../lib/filterTips'
import FilterBar from '../components/FilterBar'
import TipCard from '../components/TipCard'

export default function BrowsePage() {
  const { tips, error, reload } = useTips()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const allCategories = useMemo(
    () => tips ? [...new Set(tips.map(t => t.category))] : [],
    [tips],
  )
  const allTags = useMemo(
    () => tips ? [...new Set(tips.flatMap(t => t.tags))] : [],
    [tips],
  )

  function toggle(setList, value) {
    setList(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  if (error) return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4 text-red-400">
      <div>שגיאה: {error.message}</div>
      <button onClick={reload} className="bg-[#c7171a] text-white rounded-lg px-4 py-2 text-sm font-semibold">נסה שוב</button>
    </div>
  )
  if (tips === undefined) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">טוען...</div>

  const visible = filterTips(tips, { search, status, categories: selectedCategories, tags: selectedTags })

  return (
    <div className="min-h-screen bg-[#0f0f0f]" dir="rtl">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#c7171a] border-r-transparent rotate-[-35deg]" />
          <span className="text-white font-bold">Fight Lab טיפס</span>
        </div>
        <Link to="/tips/new" className="bg-[#c7171a] text-white rounded-full p-2">
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      <input
        placeholder="חיפוש לפי שם או תג טכניקה..."
        aria-label="חיפוש"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mx-4 mb-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
        style={{ width: 'calc(100% - 2rem)' }}
      />

      <FilterBar
        status={status}
        onStatusChange={setStatus}
        allCategories={allCategories}
        allTags={allTags}
        selectedCategories={selectedCategories}
        onToggleCategory={cat => toggle(setSelectedCategories, cat)}
        selectedTags={selectedTags}
        onToggleTag={tag => toggle(setSelectedTags, tag)}
      />

      {tips.length === 0 ? (
        <div className="px-4 py-12 text-center text-gray-500 text-sm">
          עדיין אין טיפים. לחץ על + כדי להוסיף את הראשון.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-6">
          {visible.map(tip => <TipCard key={tip.id} tip={tip} />)}
        </div>
      )}
    </div>
  )
}

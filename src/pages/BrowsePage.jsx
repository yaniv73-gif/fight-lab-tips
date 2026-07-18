import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTips } from '../hooks/useTips'
import { filterTips } from '../lib/filterTips'
import FilterBar from '../components/FilterBar'
import TipCard from '../components/TipCard'

export default function BrowsePage() {
  const { tips, error } = useTips()
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

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  if (error) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400">שגיאה: {error.message}</div>
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
        onToggleCategory={cat => toggle(selectedCategories, setSelectedCategories, cat)}
        selectedTags={selectedTags}
        onToggleTag={tag => toggle(selectedTags, setSelectedTags, tag)}
      />

      <div className="grid grid-cols-2 gap-2.5 px-4 pb-6">
        {visible.map(tip => <TipCard key={tip.id} tip={tip} />)}
      </div>
    </div>
  )
}

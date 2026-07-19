const STATUS_OPTIONS = [
  { value: null, label: 'הכל' },
  { value: 'idea', label: 'רעיון' },
  { value: 'filmed', label: 'צולם' },
  { value: 'published', label: 'פורסם' },
]

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border ${
        active ? 'bg-[#c7171a] border-[#c7171a] text-white' : 'border-gray-700 text-gray-400'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterBar({
  status, onStatusChange,
  allCategories, allTags,
  selectedCategories, onToggleCategory,
  selectedTags, onToggleTag,
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-3" dir="rtl">
      <div>
        <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">מצב</div>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map(opt => (
            <Chip key={opt.label} active={status === opt.value} onClick={() => onStatusChange(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800" />

      <div>
        <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">קטגוריה ותגיות</div>
        <div className="flex gap-1.5 overflow-x-auto flex-wrap">
          {allCategories.map(cat => (
            <Chip key={`cat-${cat}`} active={selectedCategories.includes(cat)} onClick={() => onToggleCategory(cat)}>
              {cat}
            </Chip>
          ))}
          {allTags.map(tag => (
            <Chip key={`tag-${tag}`} active={selectedTags.includes(tag)} onClick={() => onToggleTag(tag)}>
              {`#${tag}`}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}

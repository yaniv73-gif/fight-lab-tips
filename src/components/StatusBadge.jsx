import { STATUS_LABELS } from '../lib/tipStatus'

const DOT_STYLES = {
  idea: 'border border-gray-400',
  filmed: 'bg-gray-900',
  published: 'bg-white',
}

const BADGE_STYLES = {
  idea: 'border border-gray-500 text-gray-400',
  filmed: 'bg-white text-gray-900',
  published: 'bg-[#c7171a] text-white',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold text-[10px] px-2 py-1 rounded-full ${BADGE_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}

import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { deriveStatus } from '../lib/tipStatus'

export default function TipCard({ tip }) {
  const status = deriveStatus(tip)
  return (
    <Link to={`/tips/${tip.id}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden block">
      {status === 'idea' ? (
        <div className="m-1.5 h-16 rounded-lg border border-dashed border-gray-700" />
      ) : (
        <div className="h-20 bg-gray-800 flex items-center justify-center">
          <Play className="w-4 h-4 text-gray-200" fill="currentColor" />
        </div>
      )}
      <div className="p-2.5">
        <div className="text-sm font-semibold text-white mb-1 truncate">{tip.title}</div>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}

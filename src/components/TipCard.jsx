import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { deriveStatus } from '../lib/tipStatus'
import { getYoutubeThumbnail } from '../lib/youtube'

export default function TipCard({ tip }) {
  const status = deriveStatus(tip)
  const thumbnail = getYoutubeThumbnail(tip.youtube_url)
  const [imgFailed, setImgFailed] = useState(false)
  const showThumbnail = thumbnail && !imgFailed
  return (
    <Link to={`/tips/${tip.id}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden block">
      {status === 'idea' ? (
        <div className="m-1.5 aspect-video rounded-lg border border-dashed border-gray-700" />
      ) : (
        <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
          {showThumbnail && (
            <img
              src={thumbnail}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          )}
          <Play className={`w-4 h-4 text-gray-200 ${showThumbnail ? 'absolute drop-shadow' : ''}`} fill="currentColor" />
        </div>
      )}
      <div className="p-2.5">
        <div className="text-sm font-semibold text-white mb-1 truncate">{tip.title}</div>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}

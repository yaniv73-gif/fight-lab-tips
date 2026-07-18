import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTips } from '../hooks/useTips'
import { attachVideo, addPublication } from '../lib/tips'
import { deriveStatus, STATUS_LABELS } from '../lib/tipStatus'

const PLATFORMS = ['YouTube', 'Instagram', 'Facebook', 'TikTok']

export default function TipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tips, error, reload } = useTips()
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [showPublishForm, setShowPublishForm] = useState(false)

  if (error) return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4 text-red-400">
      <div>שגיאה: {error.message}</div>
      <button onClick={reload} className="bg-[#c7171a] text-white rounded-lg px-4 py-2 text-sm font-semibold">נסה שוב</button>
    </div>
  )
  if (tips === undefined) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">טוען...</div>

  const tip = tips.find(t => t.id === id)
  if (!tip) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-500">הטיפ לא נמצא</div>

  const status = deriveStatus(tip)

  async function handleSaveVideo() {
    await attachVideo(tip.id, videoUrl)
    setShowVideoForm(false)
    setVideoUrl('')
    reload()
  }

  async function handleLogPublish(platform) {
    await addPublication(tip.id, { platform, postUrl: null })
    setShowPublishForm(false)
    reload()
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" dir="rtl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 pt-4 pb-2 text-gray-400 text-sm">
        <ArrowRight className="w-4 h-4" /> חזרה לרשימה
      </button>

      {tip.youtube_url && (
        <div className="mx-4 aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
          <iframe
            className="w-full h-full"
            src={tip.youtube_url.replace('watch?v=', 'embed/')}
            title={tip.title}
            allowFullScreen
          />
        </div>
      )}

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">{tip.title}</h1>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#c7171a]">{STATUS_LABELS[status]}</span>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-4">
          {tip.tags.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">{tag}</span>
          ))}
        </div>

        {tip.note && <p className="text-sm text-gray-400 mb-5">{tip.note}</p>}

        {tip.publications.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">היסטוריית פרסום</div>
            {tip.publications.map(pub => (
              <div key={pub.id} className="flex justify-between py-2 border-t border-gray-800 text-sm">
                <span>{pub.platform}</span>
                <span className="text-gray-500">{new Date(pub.published_date).toLocaleDateString('he-IL')}</span>
              </div>
            ))}
          </div>
        )}

        {status === 'idea' && !showVideoForm && (
          <button onClick={() => setShowVideoForm(true)} className="w-full bg-[#c7171a] font-semibold rounded-lg py-3">
            סמן כצולם
          </button>
        )}

        {showVideoForm && (
          <div className="flex flex-col gap-2">
            <input
              placeholder="הדבק קישור YouTube"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <button onClick={handleSaveVideo} className="bg-[#c7171a] font-semibold rounded-lg py-3">שמור קישור</button>
          </div>
        )}

        {status !== 'idea' && !showPublishForm && (
          <button onClick={() => setShowPublishForm(true)} className="w-full bg-[#c7171a] font-semibold rounded-lg py-3">
            רשום פרסום נוסף
          </button>
        )}

        {showPublishForm && (
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map(platform => (
              <button
                key={platform}
                onClick={() => handleLogPublish(platform)}
                className="border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {platform}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

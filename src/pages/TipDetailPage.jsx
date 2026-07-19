import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTips } from '../hooks/useTips'
import { attachVideo, addPublication, updateTip, deleteTip } from '../lib/tips'
import { deriveStatus, STATUS_LABELS } from '../lib/tipStatus'
import { getYoutubeVideoId } from '../lib/youtube'

const PLATFORMS = ['YouTube', 'Instagram', 'Facebook', 'TikTok']

function toEmbedUrl(url) {
  const id = getYoutubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export default function TipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tips, error, reload } = useTips()
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [showPublishForm, setShowPublishForm] = useState(false)

  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTagsInput, setEditTagsInput] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  function closeAllForms() {
    setShowVideoForm(false)
    setShowPublishForm(false)
    setShowEdit(false)
    setShowDeleteConfirm(false)
  }

  function openVideoForm() {
    closeAllForms()
    setShowVideoForm(true)
  }

  function cancelVideoForm() {
    setShowVideoForm(false)
    setVideoUrl('')
  }

  function openPublishForm() {
    closeAllForms()
    setShowPublishForm(true)
  }

  function cancelPublishForm() {
    setShowPublishForm(false)
  }

  function openEdit() {
    closeAllForms()
    setEditTitle(tip.title)
    setEditCategory(tip.category)
    setEditTagsInput(tip.tags.join(', '))
    setEditNote(tip.note || '')
    setEditYoutubeUrl(tip.youtube_url || '')
    setSaveError('')
    setShowEdit(true)
  }

  function cancelEdit() {
    setShowEdit(false)
    setSaveError('')
  }

  function openDeleteConfirm() {
    closeAllForms()
    setDeleteError('')
    setShowDeleteConfirm(true)
  }

  function cancelDeleteConfirm() {
    setShowDeleteConfirm(false)
    setDeleteError('')
  }

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

  async function handleSaveEdit() {
    if (saving) return
    if (!editYoutubeUrl.trim() && tip.publications.length > 0) {
      setSaveError('לא ניתן להסיר את קישור הווידאו מטיפ שכבר פורסם.')
      return
    }
    setSaveError('')
    setSaving(true)
    const tags = editTagsInput.split(',').map(t => t.trim()).filter(Boolean)
    try {
      await updateTip(tip.id, {
        title: editTitle,
        category: editCategory,
        tags,
        note: editNote,
        youtube_url: editYoutubeUrl || null,
      })
      setShowEdit(false)
      setSaving(false)
      reload()
    } catch (err) {
      setSaveError(err.message)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleting) return
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteTip(tip.id)
      navigate('/')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" dir="rtl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 pt-4 pb-2 text-gray-400 text-sm">
        <ArrowRight className="w-4 h-4" /> חזרה לרשימה
      </button>

      {tip.youtube_url && (() => {
        const embedUrl = toEmbedUrl(tip.youtube_url)
        return embedUrl ? (
          <div className="mx-4 aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
            <iframe className="w-full h-full" src={embedUrl} title={tip.title} allowFullScreen />
          </div>
        ) : (
          <a href={tip.youtube_url} target="_blank" rel="noopener noreferrer" className="mx-4 mb-4 block text-[#c7171a] text-sm underline">
            פתח את הקישור: {tip.youtube_url}
          </a>
        )
      })()}

      <div className="px-4">
        {!showEdit && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold">{tip.title}</h1>
              <div className="flex items-center gap-2">
                <button onClick={openEdit} className="text-xs text-gray-400 underline">ערוך</button>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#c7171a]">{STATUS_LABELS[status]}</span>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-4">
              {tip.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">{tag}</span>
              ))}
            </div>

            {tip.note && <p className="text-sm text-gray-400 mb-5">{tip.note}</p>}
          </>
        )}

        {showEdit && (
          <div className="flex flex-col gap-2 mb-5">
            <input
              placeholder="כותרת"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <input
              placeholder="קטגוריה"
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <input
              placeholder="תגי טכניקות (מופרדות בפסיק)"
              value={editTagsInput}
              onChange={e => setEditTagsInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <input
              placeholder="הערה קצרה"
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <input
              placeholder="קישור YouTube"
              value={editYoutubeUrl}
              onChange={e => setEditYoutubeUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
            <div className="flex gap-2">
              <button onClick={cancelEdit} disabled={saving} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">ביטול</button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editTitle.trim() || !editCategory.trim()}
                className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold disabled:opacity-50"
              >
                {saving ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </div>
        )}

        {!showEdit && tip.publications.length > 0 && (
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

        {!showEdit && status === 'idea' && !showVideoForm && (
          <button onClick={openVideoForm} className="w-full bg-[#c7171a] font-semibold rounded-lg py-3">
            סמן כצולם
          </button>
        )}

        {!showEdit && showVideoForm && (
          <div className="flex flex-col gap-2">
            <input
              placeholder="הדבק קישור YouTube"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={cancelVideoForm} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">ביטול</button>
              <button onClick={handleSaveVideo} className="flex-[2] bg-[#c7171a] font-semibold rounded-lg py-3">שמור קישור</button>
            </div>
          </div>
        )}

        {!showEdit && status !== 'idea' && !showPublishForm && (
          <button onClick={openPublishForm} className="w-full bg-[#c7171a] font-semibold rounded-lg py-3">
            רשום פרסום נוסף
          </button>
        )}

        {!showEdit && showPublishForm && (
          <div className="flex flex-col gap-2">
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
            <button onClick={cancelPublishForm} className="w-full border border-gray-700 rounded-lg py-3 text-sm">ביטול</button>
          </div>
        )}

        {!showEdit && !showDeleteConfirm && (
          <button onClick={openDeleteConfirm} className="w-full mt-4 border border-red-900 text-red-400 rounded-lg py-3 text-sm">
            מחק טיפ
          </button>
        )}

        {!showEdit && showDeleteConfirm && (
          <div className="mt-4 border border-red-900 rounded-lg p-4">
            <p className="text-sm text-red-400 mb-3">למחוק את הטיפ? פעולה זו בלתי הפיכה</p>
            {deleteError && <p className="text-red-400 text-sm mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={cancelDeleteConfirm} disabled={deleting} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">ביטול</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold disabled:opacity-50">
                {deleting ? 'מוחק...' : 'כן, מחק'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

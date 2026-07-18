import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTip, attachVideo } from '../lib/tips'

export default function AddTipWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [note, setNote] = useState('')

  async function handleSave() {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const tip = await createTip({ title, category, tags, note, youtube_url: youtubeUrl || null })
    navigate(`/tips/${tip.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" dir="rtl">
      <div className="px-4 pt-4">
        <div className="font-bold mb-1">טיפ חדש</div>

        {step === 1 && (
          <>
            <div className="text-xs text-gray-500 mb-4">שלב 1 מתוך 3 · וידאו</div>
            {/* RecordButton slots in here in Task 14 */}
            <div className="text-xs text-gray-500 mb-3">ההקלטה תישלח דרך שיתוף אל אפליקציית YouTube להעלאה</div>
            <div className="text-xs text-gray-500 mb-1.5">או הדבק קישור YouTube קיים</div>
            <input
              placeholder="הדבק קישור..."
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-4 placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">דלג</button>
              <button onClick={() => setStep(2)} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold">הבא</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-xs text-gray-500 mb-4">שלב 2 מתוך 3 · שם וקטגוריה</div>
            <input
              placeholder="לדוגמה: קרוס פייס"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-3 placeholder:text-gray-500"
            />
            <input
              placeholder="קטגוריה"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-4 placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">חזרה</button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold">הבא</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-xs text-gray-500 mb-4">שלב 3 מתוך 3 · תגיות והערה</div>
            <input
              placeholder="תגי טכניקות (מופרדות בפסיק)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-3 placeholder:text-gray-500"
            />
            <input
              placeholder="הערה קצרה"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm mb-4 placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-700 rounded-lg py-3 text-sm">חזרה</button>
              <button onClick={handleSave} className="flex-[2] bg-[#c7171a] rounded-lg py-3 font-semibold">שמור</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

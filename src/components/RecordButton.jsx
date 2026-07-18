import { useRef, useState } from 'react'
import { Circle } from 'lucide-react'

function pickMimeType() {
  const candidates = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm']
  return candidates.find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) ?? ''
}

export default function RecordButton() {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  async function start() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = handleStop
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setError('לא ניתן לגשת למצלמה. ודא שהאפליקציה קיבלה הרשאת מצלמה בדפדפן.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setRecording(false)
  }

  async function handleStop() {
    const mimeType = recorderRef.current?.mimeType || 'video/webm'
    const blob = new Blob(chunksRef.current, { type: mimeType })
    const file = new File([blob], `fight-lab-tip-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`, { type: mimeType })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Fight Lab clip' })
      } catch {
        // user cancelled the share sheet — nothing to do, the clip stays local to this session
      }
    } else {
      setError('שיתוף קבצים אינו נתמך בדפדפן זה. פתח את היוטיוב והעלה את הסרטון משם.')
    }
  }

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={recording ? stop : start}
        className="w-full flex items-center justify-center gap-2 bg-[#c7171a] rounded-lg py-3 font-semibold"
      >
        <Circle className="w-3 h-3" fill="currentColor" />
        {recording ? 'עצור הקלטה' : 'הקלט עכשיו'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}

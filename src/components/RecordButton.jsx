import { useEffect, useRef, useState } from 'react'
import { Circle } from 'lucide-react'

function pickMimeType() {
  const candidates = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm']
  return candidates.find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) ?? ''
}

export default function RecordButton() {
  const [recording, setRecording] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [fallbackUrl, setFallbackUrl] = useState('')
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  async function start() {
    if (starting || recording) return
    setError('')
    setFallbackUrl('')
    setStarting(true)
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = handleStop
      recorder.onerror = () => {
        setError('אירעה שגיאה בהקלטה. נסה שוב.')
        stream.getTracks().forEach(track => track.stop())
        setRecording(false)
      }
      chunksRef.current = []
      recorder.start()
      streamRef.current = stream
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      stream?.getTracks().forEach(track => track.stop())
      setError('לא ניתן לגשת למצלמה. ודא שהאפליקציה קיבלה הרשאת מצלמה בדפדפן.')
    } finally {
      setStarting(false)
    }
  }

  function stop() {
    if (recorderRef.current?.state !== 'recording') return
    recorderRef.current.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setRecording(false)
  }

  async function handleStop() {
    if (chunksRef.current.length === 0) {
      setError('ההקלטה הייתה קצרה מדי. נסה שוב.')
      return
    }
    const mimeType = recorderRef.current?.mimeType || 'video/webm'
    const blob = new Blob(chunksRef.current, { type: mimeType })
    if (blob.size === 0) {
      setError('ההקלטה הייתה ריקה. נסה שוב.')
      return
    }
    const file = new File([blob], `fight-lab-tip-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`, { type: mimeType })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Fight Lab clip' })
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('השיתוף נכשל. ניתן להוריד את הסרטון ולהעלות אותו ידנית.')
          setFallbackUrl(URL.createObjectURL(blob))
        }
      }
    } else {
      setError('שיתוף קבצים אינו נתמך בדפדפן זה. ניתן להוריד את הסרטון ולהעלות אותו ידנית.')
      setFallbackUrl(URL.createObjectURL(blob))
    }
  }

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={starting}
        className="w-full flex items-center justify-center gap-2 bg-[#c7171a] rounded-lg py-3 font-semibold disabled:opacity-50"
      >
        <Circle className="w-3 h-3" fill="currentColor" />
        {recording ? 'עצור הקלטה' : starting ? 'מתחיל...' : 'הקלט עכשיו'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {fallbackUrl && (
        <a href={fallbackUrl} download className="text-[#c7171a] text-xs underline mt-1 block">
          הורד את הסרטון
        </a>
      )}
    </div>
  )
}

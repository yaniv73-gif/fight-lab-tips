import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { fetchTips } from '../lib/tips'

export function useTips() {
  const [tips, setTips] = useState(undefined) // undefined = loading
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const reload = useCallback(() => {
    const id = ++requestIdRef.current
    fetchTips()
      .then(data => { if (id === requestIdRef.current) { setTips(data); setError(null) } })
      .catch(err => { if (id === requestIdRef.current) setError(err) })
  }, [])

  useEffect(() => {
    reload()
    const channel = supabase
      .channel('tips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tips' }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'publications' }, reload)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [reload])

  return { tips, error, reload }
}

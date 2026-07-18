import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchTips } from '../lib/tips'

export function useTips() {
  const [tips, setTips] = useState(undefined) // undefined = loading
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    fetchTips().then(setTips).catch(setError)
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

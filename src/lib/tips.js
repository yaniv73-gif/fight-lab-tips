import { supabase } from './supabase'

export async function fetchTips() {
  const { data, error } = await supabase
    .from('tips')
    .select('*, publications(*)')
    .order('date_added', { ascending: false })
  if (error) throw error
  return data
}

export async function createTip({ title, category, tags, note, youtube_url = null }) {
  const { data, error } = await supabase
    .from('tips')
    .insert({ title, category, tags, note, youtube_url })
    .select('*, publications(*)')
    .single()
  if (error) throw error
  return data
}

export async function attachVideo(tipId, youtubeUrl) {
  const { data, error } = await supabase
    .from('tips')
    .update({ youtube_url: youtubeUrl, date_filmed: new Date().toISOString() })
    .eq('id', tipId)
    .select('*, publications(*)')
    .single()
  if (error) throw error
  return data
}

export async function addPublication(tipId, { platform, postUrl = null }) {
  const { data, error } = await supabase
    .from('publications')
    .insert({ tip_id: tipId, platform, post_url: postUrl })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTip(id, { title, category, tags, note, youtube_url }) {
  const { data: current, error: fetchError } = await supabase
    .from('tips')
    .select('youtube_url')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const fields = { title, category, tags, note, youtube_url }
  if (!current.youtube_url && youtube_url) {
    fields.date_filmed = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('tips')
    .update(fields)
    .eq('id', id)
    .select('*, publications(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteTip(id) {
  const { error } = await supabase
    .from('tips')
    .delete()
    .eq('id', id)
  if (error) throw error
}

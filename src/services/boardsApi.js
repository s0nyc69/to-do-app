import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchBoards(userId) {
  if (!userId) return []

  const { data, error } = await requireClient()
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createBoard(userId, title = 'My board') {
  if (!userId) return null

  const trimmedtitle = title.trim() || 'My board'

  const { data, error } = await requireClient()
    .from('boards')
    .insert({ user_id: userId, title: trimmedtitle })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getOrCreateUserBoard(userId, title = 'My board') {
  if (!userId) return null

  const client = requireClient()

  const { data: existingBoard, error: fetchError } = await client
    .from('boards')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError
  }

  if (existingBoard) return existingBoard.id

  const { data: createdBoard, error: insertError } = await client
    .from('boards')
    .insert({ user_id: userId, title })
    .select('id')
    .single()

  if (insertError) throw insertError
  return createdBoard.id
}

import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

export const isTasksApiConfigured = isSupabaseConfigured

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchTasks(boardId) {
  const { data, error } = await requireClient()
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTask(task) {
  const { data, error } = await requireClient()
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(taskId, changes, boardId) {
  const query = requireClient().from('tasks').update(changes).eq('id', taskId)

  if (boardId) query.eq('board_id', boardId)

  const { error } = await query

  if (error) throw error
}

export async function removeTask(taskId, boardId) {
  const query = requireClient().from('tasks').delete().eq('id', taskId)

  if (boardId) query.eq('board_id', boardId)

  const { error } = await query

  if (error) throw error
}
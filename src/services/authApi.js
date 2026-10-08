import { supabase } from '../lib/supabase.js'

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add your anon key to .env.')
  return supabase
}

export async function registerUser({ username, email, password }) {
  const { data, error } = await requireClient().auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) throw error
  return data
}

export async function loginUser({ email, password }) {
  const { data, error } = await requireClient().auth.signInWithPassword({ email, password })

  if (error) throw error
  return data
}

export async function logoutUser() {
  const { error } = await requireClient().auth.signOut()

  if (error) throw error
}

export async function getCurrentSession() {
  const { data, error } = await requireClient().auth.getSession()

  if (error) throw error
  return data.session
}

export function subscribeToAuthChanges(callback) {
  return requireClient().auth.onAuthStateChange((_event, session) => callback(session)).data.subscription
}
import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase.js'
import {
  getCurrentSession,
  loginUser,
  logoutUser,
  registerUser,
  subscribeToAuthChanges,
} from '../services/authApi.js'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true
    const subscription = subscribeToAuthChanges((nextSession) => {
      if (active) {
        setSession(nextSession)
        setLoading(false)
      }
    })

    getCurrentSession()
      .then((currentSession) => {
        if (active) setSession(currentSession)
      })
      .catch((sessionError) => {
        if (active) setError(sessionError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function register(credentials) {
    setBusy(true)
    setError('')
    try {
      await registerUser(credentials)
    } catch (registerError) {
      setError(registerError.message)
    } finally {
      setBusy(false)
    }
  }

  async function login(credentials) {
    setBusy(true)
    setError('')
    try {
      await loginUser(credentials)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError('')
    try {
      await logoutUser()
    } catch (logoutError) {
      setError(logoutError.message)
    } finally {
      setBusy(false)
    }
  }

  return {
    session,
    user: session?.user ?? null,
    loading,
    busy,
    error,
    register,
    login,
    logout,
  }
}
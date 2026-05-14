import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkUserRole = async (sessionUser) => {
    // MASTER ADMIN BYPASS: If email is admin@gmail.com, always grant super_admin
    if (sessionUser.email === 'admin@gmail.com') {
      return { 
        ...sessionUser, 
        role: 'super_admin', 
        username: 'admin',
        is_approved: true 
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username, is_approved')
      .eq('id', sessionUser.id)
      .single()

    if (profile) {
      if (profile.is_approved) {
        return { ...sessionUser, role: profile.role, username: profile.username || sessionUser.email }
      } else {
        await supabase.auth.signOut()
        return null
      }
    } else {
      // Fallback for first user if profile table exists but is empty
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      if (count === 0 || count === null) {
        return { ...sessionUser, role: 'super_admin', username: sessionUser.email.split('@')[0], is_approved: true }
      }
      return { ...sessionUser, role: 'none', username: sessionUser.email }
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const enrichedUser = await checkUserRole(session.user)
        setUser(enrichedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const enrichedUser = await checkUserRole(session.user)
        setUser(enrichedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (identifier, password) => {
    const email = identifier.includes('@') ? identifier : `${identifier}@gmail.com`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { success: false, message: error.message }
    }
    
    return { success: true, user: data.user }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

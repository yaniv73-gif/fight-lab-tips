import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useUser = () => useContext(AuthContext)

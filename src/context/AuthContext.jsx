import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      loading,

      // --- email + parola (functioneaza imediat, nimic de configurat) ---
      async signInWithEmail(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(traduceEroare(error.message))
      },
      async signUpWithEmail(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw new Error(traduceEroare(error.message))
        // daca proiectul cere confirmarea pe email, session vine goala
        if (!data.session) {
          throw new Error('CONT_CREAT_VERIFICA_EMAIL')
        }
      },

      // --- Google (merge doar daca e activat in Supabase) ---
      async signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
        })
        if (error) throw new Error(traduceEroare(error.message))
      },

      async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
    }),
    [session, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** mesaje de la Supabase sunt in engleza - le traducem, ca sa fie citibile */
function traduceEroare(msg = '') {
  if (/Invalid login credentials/i.test(msg))
    return 'Email sau parola gresite.'
  if (/User already registered/i.test(msg))
    return 'Ai deja cont cu acest email. Incearca sa te autentifici.'
  if (/Password should be at least/i.test(msg))
    return 'Parola trebuie sa aiba cel putin 6 caractere.'
  if (/rate limit|too many/i.test(msg))
    return 'Prea multe incercari. Astepta putin si reincearca.'
  return msg
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth trebuie folosit in AuthProvider')
  return ctx
}

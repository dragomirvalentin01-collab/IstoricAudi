import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'

function GoogleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12a6.6 6.6 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" />
    </svg>
  )
}

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const err = hash.get('error_description')
    if (err) setError(decodeURIComponent(err))
  }, [])

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Spinner className="w-8 h-8 text-accent-600" /></div>
  }
  if (user) return <Navigate to="/" replace />

  async function handleGoogle() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent-600 text-white grid place-items-center text-xl font-bold">
          IA
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Istoric Auto</h1>
        <p className="text-sm text-garage-500 dark:text-garage-400 mt-2">
          Tine minte fiecare schimb de ulei si filtre. Datele raman in contul tau.
        </p>

        {error && (
          <div className="mt-6 flex gap-2.5 text-left text-sm p-3 rounded-xl
                          bg-amber-50 dark:bg-amber-500/10
                          border border-amber-200 dark:border-amber-500/30
                          text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button onClick={handleGoogle} disabled={busy} className="btn-ghost w-full mt-6 py-3 bg-white dark:bg-garage-900">
          {busy ? <Spinner className="w-5 h-5" /> : <GoogleIcon />}
          <span className="text-sm font-medium">Continua cu Google</span>
        </button>

        <p className="text-xs text-garage-400 dark:text-garage-500 mt-6">
          Autentificarea cu Google trebuie activata in proiectul Supabase.
        </p>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react'
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
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()

  const [mode, setMode] = useState('login')   // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(null)

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Spinner className="w-8 h-8 text-accent-600" /></div>
  }
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true); setError(null); setOk(null)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
    } catch (err) {
      if (err.message === 'CONT_CREAT_VERIFICA_EMAIL') {
        setOk('Cont creat! Verifica emailul si apasa linkul din mesaj, apoi intra.')
      } else {
        setError(err.message)
      }
    }
    setBusy(false)
  }

  async function handleGoogle() {
    setBusy(true); setError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError('Autentificarea cu Google nu este activata inca. Foloseste emailul de mai jos.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-7">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-600 text-white grid place-items-center text-xl font-bold">IA</div>
          <h1 className="text-2xl font-bold tracking-tight">Istoric Auto</h1>
          <p className="text-sm text-garage-500 dark:text-garage-400 mt-1">
            {mode === 'login' ? 'Intra in cont' : 'Creeaza-ti cont'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex gap-2.5 text-sm p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10
                          border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        {ok && (
          <div className="mb-4 flex gap-2.5 text-sm p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10
                          border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{ok}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block relative">
            <span className="sr-only">Email</span>
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-garage-400 pointer-events-none" />
            <input
              className="input pl-10" type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.com"
            />
          </label>

          <label className="block relative">
            <span className="sr-only">Parola</span>
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-garage-400 pointer-events-none" />
            <input
              className="input pl-10" type="password" required minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Parola (minim 6 caractere)"
            />
          </label>

          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? <Spinner className="w-5 h-5" /> : mode === 'login' ? 'Intra' : 'Creeaza cont'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setOk(null) }}
          className="w-full mt-3 text-sm text-accent-600 dark:text-accent-400"
        >
          {mode === 'login' ? 'Nu ai cont? Creeaza unul' : 'Ai deja cont? Intra'}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-garage-200 dark:bg-garage-800" />
          <span className="text-xs text-garage-400 dark:text-garage-500">sau</span>
          <div className="flex-1 h-px bg-garage-200 dark:bg-garage-800" />
        </div>

        <button onClick={handleGoogle} disabled={busy} className="btn-ghost w-full py-3 bg-white dark:bg-garage-900">
          {busy ? <Spinner className="w-5 h-5" /> : <GoogleIcon />}
          <span className="text-sm font-medium">Continua cu Google</span>
        </button>
      </motion.div>
    </div>
  )
}

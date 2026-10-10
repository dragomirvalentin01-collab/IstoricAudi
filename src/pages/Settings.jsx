import { useEffect, useState } from 'react'
import { Bell, BellOff, Moon, Sun, LogOut, Smartphone, Info, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useGarage } from '../hooks/useGarage'
import { pushSupported, requestPermission, enablePush, disablePush, isPushEnabled } from '../lib/push'
import { Card, PageHeader, Field } from '../components/ui'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { isDark, toggle } = useTheme()
  const { vehiclesWithStatus, changes, notes } = useGarage()

  const [pushOn, setPushOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  const supported = pushSupported()

  useEffect(() => {
    isPushEnabled().then(setPushOn).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function togglePush() {
    setBusy(true)
    setMsg(null)
    try {
      if (pushOn) {
        await disablePush()
        setPushOn(false)
        setMsg({ ok: true, text: 'Notificarile au fost oprite.' })
      } else {
        await requestPermission()
        await enablePush(user.id, vapidKey)
        setPushOn(true)
        setMsg({ ok: true, text: 'Notificarile sunt active pe acest dispozitiv.' })
      }
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    }
    setBusy(false)
  }

  async function install() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <>
      <PageHeader title="Setari" subtitle="Cont, temă și notificări" />

      {/* CONT */}
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-11 h-11 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-accent-600/15 text-accent-600 dark:text-accent-400
                            grid place-items-center font-semibold">
              {(user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{user?.user_metadata?.full_name || 'Utilizator'}</p>
            <p className="text-sm text-garage-500 dark:text-garage-400 truncate">{user?.email}</p>
          </div>
          <button onClick={signOut} className="btn-ghost px-3" title="Deconectare">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Iesi</span>
          </button>
        </div>
      </Card>

      {/* TEMA */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-garage-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="font-medium text-sm">Tema</p>
              <p className="text-xs text-garage-500 dark:text-garage-400">
                {isDark ? 'Intunecata' : 'Luminoasa'}
              </p>
            </div>
          </div>
          <button onClick={toggle} className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? 'bg-accent-600' : 'bg-garage-300 dark:bg-garage-700'}`}>
            <motionKnob isDark={isDark} />
          </button>
        </div>
      </Card>

      {/* NOTIFICARI */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {pushOn ? <Bell className="w-5 h-5 text-accent-600 dark:text-accent-400" /> : <BellOff className="w-5 h-5 text-garage-400" />}
            <div className="min-w-0">
              <p className="font-medium text-sm">Notificari push</p>
              <p className="text-xs text-garage-500 dark:text-garage-400">
                {!supported
                  ? 'Browserul nu suporta notificari'
                  : !vapidKey
                    ? 'Cheia VAPID nu este configurata inca'
                    : pushOn ? 'Active pe acest dispozitiv' : 'Primesti alerta cand e timpul de schimb'}
              </p>
            </div>
          </div>
          <button
            onClick={togglePush}
            disabled={busy || !supported || !vapidKey}
            className={`btn px-4 shrink-0 ${pushOn ? 'btn-ghost' : 'btn-primary'}`}
          >
            {pushOn ? 'Oprește' : 'Activeaza'}
          </button>
        </div>

        {msg && (
          <p className={`mt-3 text-xs ${msg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {msg.text}
          </p>
        )}

        {!vapidKey && supported && (
          <p className="mt-3 text-xs text-garage-400 dark:text-garage-500">
            Pentru notificari reale e nevoie de o cheie VAPID si de un sender (Supabase Edge Function).
            Pana atunci, alerta apare in aplicatie la deschidere.
          </p>
        )}
      </Card>

      {/* PWA */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-garage-400" />
            <div>
              <p className="font-medium text-sm">Instaleaza aplicatia</p>
              <p className="text-xs text-garage-500 dark:text-garage-400">
                {installPrompt ? 'Se poate instala pe telefon' : 'Deja instalata sau nu e disponibila aici'}
              </p>
            </div>
          </div>
          <button onClick={install} disabled={!installPrompt} className="btn-primary px-4 shrink-0">
            Instaleaza
          </button>
        </div>
      </Card>

      {/* DATE */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-garage-400" />
          <p className="font-medium text-sm">Datele tale</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-garage-400 dark:text-garage-500">Masini</p>
            <p className="text-lg font-bold">{vehiclesWithStatus.length}</p>
          </div>
          <div>
            <p className="text-xs text-garage-400 dark:text-garage-500">Schimburi</p>
            <p className="text-lg font-bold">{changes.length}</p>
          </div>
          <div>
            <p className="text-xs text-garage-400 dark:text-garage-500">Notite</p>
            <p className="text-lg font-bold">{notes.length}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-garage-400 dark:text-garage-500 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Fiecare utilizator vede doar datele lui — politca de securitate e activă pe toate tabelele.
        </p>
      </Card>
    </>
  )
}

function motionKnob({ isDark }) {
  return (
    <span
      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${isDark ? 'left-6' : 'left-1'}`}
    />
  )
}

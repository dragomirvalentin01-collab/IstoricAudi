import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import OilChanges from './pages/OilChanges'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import { Spinner } from './components/ui'
import { isSupabaseConfigured } from './lib/supabase'
import { AlertTriangle } from 'lucide-react'

function MissingConfigScreen() {
  return (
    <div className="min-h-screen grid place-items-center px-5 py-10 bg-garage-50 dark:bg-garage-950 text-garage-900 dark:text-garage-100">
      <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-garage-900 border border-garage-200 dark:border-garage-800 shadow-sm text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold mb-2">Configurare necesară</h1>
        <p className="text-sm text-garage-600 dark:text-garage-300 mb-4">
          Aplicația <strong>Istoric Auto</strong> necesită configurarea variabilelor de mediu Supabase pentru a funcționa.
        </p>
        <div className="text-left text-xs bg-garage-100 dark:bg-garage-950 p-3.5 rounded-lg font-mono text-garage-700 dark:text-garage-300 mb-4 space-y-1 overflow-x-auto">
          <div># Copiază .env.example în .env și completează cheile:</div>
          <div>cp .env.example .env</div>
          <div>VITE_SUPABASE_URL=...</div>
          <div>VITE_SUPABASE_ANON_KEY=...</div>
        </div>
        <p className="text-xs text-garage-500 dark:text-garage-400">
          După salvarea fișierului <code>.env</code>, reîncarcă pagina sau repornește serverul de dezvoltare.
        </p>
      </div>
    </div>
  )
}

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner className="w-8 h-8 text-accent-600" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <ThemeProvider>
        <MissingConfigScreen />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Protected>
                  <Layout />
                </Protected>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="masini" element={<Vehicles />} />
              <Route path="schimburi" element={<OilChanges />} />
              <Route path="notite" element={<Notes />} />
              <Route path="setari" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

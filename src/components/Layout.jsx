import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Car, Droplets, StickyNote, Settings as SettingsIcon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',          label: 'Acasa',    icon: LayoutDashboard, end: true },
  { to: '/masini',    label: 'Masini',   icon: Car },
  { to: '/schimburi', label: 'Schimburi',icon: Droplets },
  { to: '/notite',    label: 'Notite',   icon: StickyNote },
  { to: '/setari',    label: 'Setari',   icon: SettingsIcon }
]

export default function Layout() {
  const { isDark, toggle } = useTheme()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* sidebar - doar pe desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-garage-200 dark:border-garage-800 p-5">
        <Brand />
        <nav className="flex-1 space-y-1 mt-8">
          {NAV.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <button onClick={toggle} className="btn-ghost w-full justify-start">
          {isDark ? '☀️' : '🌙'} <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* bara de sus - doar pe mobil */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between
                           px-4 h-14 bg-garage-50/80 dark:bg-garage-950/80 backdrop-blur
                           border-b border-garage-200 dark:border-garage-800">
          <Brand />
          <button onClick={toggle} className="w-9 h-9 rounded-xl grid place-items-center
                                              bg-garage-100 dark:bg-garage-800">
            {isDark ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8 max-w-4xl w-full mx-auto">
          <Outlet />
        </main>

        {/* navigatie jos - ca in nativa, pe mobil */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex
                        border-t border-garage-200 dark:border-garage-800
                        bg-garage-50/95 dark:bg-garage-950/95 backdrop-blur
                        pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute top-0 h-0.5 w-8 bg-accent-500 rounded-full"
                    />
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-garage-400'}`} />
                  <span className={`text-[10px] ${isActive ? 'text-accent-600 dark:text-accent-400 font-medium' : 'text-garage-400'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-accent-600 text-white grid place-items-center font-bold">IA</div>
      <div className="leading-tight">
        <p className="font-semibold text-sm">Istoric Auto</p>
        <p className="text-[11px] text-garage-400 dark:text-garage-500">ulei & filtre</p>
      </div>
    </div>
  )
}

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? 'bg-accent-600/10 text-accent-700 dark:text-accent-400'
            : 'text-garage-500 dark:text-garage-400 hover:bg-garage-100 dark:hover:bg-garage-800'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  )
}

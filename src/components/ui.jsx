import { useId } from 'react'
import { motion } from 'framer-motion'

export function Card({ children, className = '', ...props }) {
  return <div className={`card ${className}`} {...props}>{children}</div>
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-garage-500 dark:text-garage-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Empty({ icon: Icon, title, hint, action }) {
  return (
    <div className="text-center py-16 px-4">
      {Icon && (
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-garage-100 dark:bg-garage-800 grid place-items-center">
          <Icon className="w-7 h-7 text-garage-400" />
        </div>
      )}
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-garage-500 dark:text-garage-400 mt-1 max-w-sm mx-auto">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="block text-xs text-garage-400 dark:text-garage-500 mt-1">{hint}</span>}
    </label>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className={`relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto
                    bg-white dark:bg-garage-900 rounded-t-3xl sm:rounded-3xl border border-garage-200 dark:border-garage-800 p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-garage-400 hover:text-garage-700 dark:hover:text-garage-200 text-xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

export function Spinner({ className = 'w-5 h-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export function Stat({ label, value, hint, tone = '' }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-garage-500 dark:text-garage-400">{label}</p>
      <p className={`text-2xl font-bold tracking-tight mt-1 ${tone}`}>{value}</p>
      {hint && <p className="text-xs text-garage-400 dark:text-garage-500 mt-0.5">{hint}</p>}
    </Card>
  )
}

/**
 * Camp cu lista de suggestii. Se poate scrie orice - lista doar ajuta.
 * (foloseste <datalist>, nativ, merge bine si pe telefon)
 */
export function Picker({ label, value, onChange, options, placeholder, hint, type = 'text' }) {
  const id = useId()
  return (
    <Field label={label} hint={hint}>
      <input
        className="input"
        type={type}
        list={options?.length ? id : undefined}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {options?.length ? (
        <datalist id={id}>
          {options.map((o) => <option key={o} value={o} />)}
        </datalist>
      ) : null}
    </Field>
  )
}

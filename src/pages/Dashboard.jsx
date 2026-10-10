import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplets, Wallet, Car, AlertTriangle, ArrowRight, Plus } from 'lucide-react'
import { useGarage } from '../hooks/useGarage'
import { STATUS_STYLE } from '../lib/reminders'
import { Card, Stat, Empty, PageHeader, Spinner } from '../components/ui'

export default function Dashboard() {
  const { vehiclesWithStatus, changes, totalSpend, dueSoon, loading } = useGarage()

  if (loading) {
    return <div className="grid place-items-center py-20"><Spinner className="w-8 h-8 text-accent-600" /></div>
  }

  const recent = changes.slice(0, 5)

  return (
    <>
      <PageHeader
        title="Acasa"
        subtitle={`${vehiclesWithStatus.length} masina${vehiclesWithStatus.length === 1 ? '' : 'i'} · ${changes.length} schimburi inregistrate`}
      />

      {dueSoon.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <Card className="p-4 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-sm text-amber-900 dark:text-amber-200">
                  {dueSoon.length === 1 ? 'O masina are nevoie' : `${dueSoon.length} masini au nevoie`} de schimb de ulei
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {dueSoon.map((v) => (
                    <li key={v.id} className="text-xs text-amber-800 dark:text-amber-300/80">
                      {v.name} — {STATUS_STYLE[v.status.level].text.toLowerCase()}
                      {v.status.level !== 'unknown' && v.status.kmLeft > 0 && ` (pana la ${v.status.kmLeft} km)`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label="Total cheltuieli" value={`${totalSpend.toFixed(0)} lei`} hint="piese + manopera" />
        <Stat label="Schimburi" value={changes.length} hint="in total" />
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Masinile tale</h2>
          <Link to="/masini" className="text-sm text-accent-600 dark:text-accent-400">vezi tot</Link>
        </div>

        {vehiclesWithStatus.length === 0 ? (
          <Card>
            <Empty
              icon={Car}
              title="Nicio masina inca"
              hint="Adauga masina ta si aplicația îți va urmari automat cand e timpul de schimb."
              action={<Link to="/masini" className="btn-primary"><Plus className="w-4 h-4" /> Adauga masina</Link>}
            />
          </Card>
        ) : (
          <div className="space-y-2.5">
            {vehiclesWithStatus.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <Link to="/masini" className="block">
                  <Card className="p-4 flex items-center gap-4 hover:border-accent-500/50 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-garage-100 dark:bg-garage-800 grid place-items-center shrink-0">
                      <Car className="w-5 h-5 text-garage-500 dark:text-garage-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{v.name}</p>
                      <p className="text-xs text-garage-500 dark:text-garage-400">
                        {v.current_km?.toLocaleString('ro-RO')} km
                        {v.lastChange && ` · ultimul schimb ${new Date(v.lastChange.date).toLocaleDateString('ro-RO')}`}
                      </p>
                    </div>
                    <span className={`chip ${STATUS_STYLE[v.status.level].chip}`}>
                      {STATUS_STYLE[v.status.level].text}
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Ultimele schimburi</h2>
          <Link to="/schimburi" className="text-sm text-accent-600 dark:text-accent-400 flex items-center gap-1">
            vezi tot <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card><Empty icon={Droplets} title="Niciun schimb inregistrat" hint="Primul schimb iti arata imediat cum arata istoricul." /></Card>
        ) : (
          <div className="space-y-2.5">
            {recent.map((c) => {
              const v = vehiclesWithStatus.find((x) => x.id === c.vehicle_id)
              const total = Number(c.part_cost || 0) + Number(c.labor_cost || 0)
              return (
                <Card key={c.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-600/10 text-accent-600 dark:text-accent-400 grid place-items-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{v?.name || 'Masina eliminata'}</p>
                    <p className="text-xs text-garage-500 dark:text-garage-400">
                      {new Date(c.date).toLocaleDateString('ro-RO')} · {c.km?.toLocaleString('ro-RO')} km
                      {c.oil_brand && ` · ${c.oil_brand}`}
                    </p>
                  </div>
                  <p className="font-semibold text-sm shrink-0">{total.toFixed(0)} lei</p>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {vehiclesWithStatus.length > 0 && changes.length > 0 && (
        <p className="mt-6 text-xs text-garage-400 dark:text-garage-500 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" /> Totalul include doar piese si manopera, fara taxe si consumabile.
        </p>
      )}
    </>
  )
}

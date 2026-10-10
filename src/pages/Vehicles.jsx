import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Car, Fuel } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useGarage } from '../hooks/useGarage'
import { STATUS_STYLE } from '../lib/reminders'
import { Card, PageHeader, Empty, Modal, Field, Spinner } from '../components/ui'

const EMPTY = {
  name: '', make: '', model: '', year: '', vin: '', plate: '',
  current_km: 0, oil_interval_km: 15000, oil_interval_months: 12
}

export default function Vehicles() {
  const { user } = useAuth()
  const { vehiclesWithStatus, loading, reload } = useGarage()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setForm(EMPTY)
    setEditing('new')
  }

  function openEdit(v) {
    setForm({
      name: v.name || '', make: v.make || '', model: v.model || '', year: v.year || '',
      vin: v.vin || '', plate: v.plate || '', current_km: v.current_km || 0,
      oil_interval_km: v.oil_interval_km || 15000, oil_interval_months: v.oil_interval_months || 12
    })
    setEditing(v)
  }

  function close() { setEditing(null) }

  async function save(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      year: form.year ? Number(form.year) : null,
      vin: form.vin.trim() || null,
      plate: form.plate.trim() || null,
      current_km: Number(form.current_km || 0),
      oil_interval_km: Number(form.oil_interval_km || 15000),
      oil_interval_months: Number(form.oil_interval_months || 12)
    }

    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('vehicles').insert({ ...payload, user_id: user.id }))
    } else {
      ;({ error } = await supabase.from('vehicles').update(payload).eq('id', editing.id))
    }

    setSaving(false)
    if (error) { alert(error.message); return }
    close()
    reload()
  }

  async function remove(v) {
    if (!confirm(`Ștergi masina „${v.name}"? Se șterg și toate schimburile și notițele ei.`)) return
    const { error } = await supabase.from('vehicles').delete().eq('id', v.id)
    if (error) { alert(error.message); return }
    reload()
  }

  if (loading) return <div className="grid place-items-center py-20"><Spinner className="w-8 h-8 text-accent-600" /></div>

  return (
    <>
      <PageHeader
        title="Masini"
        subtitle="Configureaza intervalul de schimb ca sa primesti alerta corect"
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adauga</button>}
      />

      {vehiclesWithStatus.length === 0 ? (
        <Card>
          <Empty
            icon={Car}
            title="Nicio masina"
            hint="Adauga prima masina. Intervalul de schimb implicit este 15.000 km sau 12 luni."
            action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adauga masina</button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {vehiclesWithStatus.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-garage-100 dark:bg-garage-800 grid place-items-center shrink-0">
                    <Car className="w-5 h-5 text-garage-500 dark:text-garage-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{v.name}</p>
                      <span className={`chip ${STATUS_STYLE[v.status.level].chip}`}>
                        {STATUS_STYLE[v.status.level].text}
                      </span>
                    </div>
                    <p className="text-sm text-garage-500 dark:text-garage-400 mt-0.5">
                      {[v.make, v.model, v.year].filter(Boolean).join(' ') || 'Detalii necompletate'}
                      {v.plate && ` · ${v.plate}`}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(v)} className="w-9 h-9 rounded-lg grid place-items-center
                            bg-garage-100 dark:bg-garage-800 hover:bg-garage-200 dark:hover:bg-garage-700">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(v)} className="w-9 h-9 rounded-lg grid place-items-center
                            bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400
                            hover:bg-red-100 dark:hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-garage-100 dark:border-garage-800 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-garage-400 dark:text-garage-500">Kilometraj</p>
                    <p className="text-sm font-semibold mt-0.5">{v.current_km?.toLocaleString('ro-RO')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-garage-400 dark:text-garage-500">Interval</p>
                    <p className="text-sm font-semibold mt-0.5">{v.oil_interval_km?.toLocaleString('ro-RO')} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-garage-400 dark:text-garage-500">La fiecare</p>
                    <p className="text-sm font-semibold mt-0.5">{v.oil_interval_months} luni</p>
                  </div>
                </div>

                {v.status.level !== 'unknown' && (
                  <p className="mt-3 text-xs flex items-center gap-1.5 text-garage-500 dark:text-garage-400">
                    <Fuel className="w-3.5 h-3.5" />
                    {v.status.kmLeft > 0
                      ? `Mai ai ${v.status.kmLeft.toLocaleString('ro-RO')} km pana la schimb`
                      : 'Intervalul a fost depasit'}
                    {v.status.daysLeft > 0 && ` · ${v.status.daysLeft} zile`}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={close} title={editing === 'new' ? 'Adauga masina' : 'Editeaza masina'}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Nume *">
            <input className="input" value={form.name} required
                   onChange={(e) => setForm({ ...form, name: e.target.value })}
                   placeholder="ex: Audi A4 B6 Avant" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca"><input className="input" value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Audi" /></Field>
            <Field label="Model"><input className="input" value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="A4 B6" /></Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="An"><input className="input" inputMode="numeric" value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2002" /></Field>
            <Field label="Nr. inmatriculare"><input className="input" value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="XX 123 ABC" /></Field>
            <Field label="VIN"><input className="input" value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })} placeholder="…" /></Field>
          </div>

          <Field label="Kilometraj curent" hint="Folosit pentru calculul alertei">
            <input className="input" type="number" inputMode="numeric" value={form.current_km}
              onChange={(e) => setForm({ ...form, current_km: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Schimb la (km)" hint="Implicit 15000">
              <input className="input" type="number" value={form.oil_interval_km}
                onChange={(e) => setForm({ ...form, oil_interval_km: e.target.value })} />
            </Field>
            <Field label="Schimb la (luni)" hint="Implicit 12">
              <input className="input" type="number" value={form.oil_interval_months}
                onChange={(e) => setForm({ ...form, oil_interval_months: e.target.value })} />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={close} className="btn-ghost flex-1">Renunta</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner className="w-4 h-4" /> : 'Salveaza'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

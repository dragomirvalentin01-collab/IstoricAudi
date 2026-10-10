import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Droplets, FileText, Sheet, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useGarage } from '../hooks/useGarage'
import { exportPdf, exportExcel } from '../lib/export'
import { Card, PageHeader, Empty, Modal, Field, Spinner } from '../components/ui'

const EMPTY = {
  vehicle_id: '', date: new Date().toISOString().slice(0, 10), km: '',
  oil_brand: '', oil_spec: '', oil_quantity: '',
  filter_oil: '', filter_air: '', filter_cabin: '',
  part_cost: '', labor_cost: '', shop: '', notes: ''
}

const money = (n) => Number(n || 0).toFixed(0)

export default function OilChanges() {
  const { user } = useAuth()
  const { vehiclesWithStatus, changes, loading, reload } = useGarage()
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const list = useMemo(
    () => (filter === 'all' ? changes : changes.filter((c) => c.vehicle_id === filter)),
    [changes, filter]
  )

  const activeVehicle = vehiclesWithStatus.find((v) => v.id === filter)

  function openNew() {
    const preset = filter !== 'all' ? filter : vehiclesWithStatus[0]?.id || ''
    setForm({
      ...EMPTY,
      vehicle_id: preset,
      km: vehiclesWithStatus.find((v) => v.id === preset)?.current_km || ''
    })
    setEditing('new')
  }

  function openEdit(c) {
    setForm({
      vehicle_id: c.vehicle_id || '',
      date: c.date || '',
      km: c.km ?? '',
      oil_brand: c.oil_brand || '', oil_spec: c.oil_spec || '', oil_quantity: c.oil_quantity ?? '',
      filter_oil: c.filter_oil || '', filter_air: c.filter_air || '', filter_cabin: c.filter_cabin || '',
      part_cost: c.part_cost ?? '', labor_cost: c.labor_cost ?? '',
      shop: c.shop || '', notes: c.notes || ''
    })
    setEditing(c)
  }

  async function save(e) {
    e.preventDefault()
    if (!form.vehicle_id) { alert('Alege masina'); return }
    setSaving(true)

    const payload = {
      vehicle_id: form.vehicle_id,
      date: form.date,
      km: Number(form.km || 0),
      oil_brand: form.oil_brand.trim() || null,
      oil_spec: form.oil_spec.trim() || null,
      oil_quantity: form.oil_quantity === '' ? null : Number(form.oil_quantity),
      filter_oil: form.filter_oil.trim() || null,
      filter_air: form.filter_air.trim() || null,
      filter_cabin: form.filter_cabin.trim() || null,
      part_cost: Number(form.part_cost || 0),
      labor_cost: Number(form.labor_cost || 0),
      shop: form.shop.trim() || null,
      notes: form.notes.trim() || null
    }

    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('oil_changes').insert({ ...payload, user_id: user.id }))
    } else {
      ;({ error } = await supabase.from('oil_changes').update(payload).eq('id', editing.id))
    }

    setSaving(false)
    if (error) { alert(error.message); return }

    // actualizeaza automat kilometrajul masinii daca a crescut
    if (editing === 'new' || editing) {
      const v = vehiclesWithStatus.find((x) => x.id === payload.vehicle_id)
      if (v && payload.km > (v.current_km || 0)) {
        await supabase.from('vehicles').update({ current_km: payload.km }).eq('id', payload.vehicle_id)
      }
    }

    setEditing(null)
    reload()
  }

  async function remove(c) {
    if (!confirm('Ștergi acest schimb din istoric?')) return
    const { error } = await supabase.from('oil_changes').delete().eq('id', c.id)
    if (error) { alert(error.message); return }
    reload()
  }

  if (loading) return <div className="grid place-items-center py-20"><Spinner className="w-8 h-8 text-accent-600" /></div>

  if (vehiclesWithStatus.length === 0) {
    return (
      <>
        <PageHeader title="Schimburi" />
        <Card>
          <Empty
            icon={Droplets}
            title="Adauga o masina mai intai"
            hint="Schimburile se leaga de o masina, ca sa putem calcula corect cand e urmatorul."
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Schimburi"
        subtitle={`${list.length} inregistrari`}
        action={
          <div className="flex gap-2">
            <button onClick={() => exportPdf(list, activeVehicle)} disabled={!list.length}
                    className="btn-ghost px-3" title="Export PDF">
              <FileText className="w-4 h-4" /><span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => exportExcel(list, activeVehicle)} disabled={!list.length}
                    className="btn-ghost px-3" title="Export Excel">
              <Sheet className="w-4 h-4" /><span className="hidden sm:inline">Excel</span>
            </button>
            <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adauga</button>
          </div>
        }
      />

      {/* filtru masina */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-4 px-4">
        <button onClick={() => setFilter('all')}
          className={`chip shrink-0 ${filter === 'all'
            ? 'bg-accent-600 text-white'
            : 'bg-garage-100 dark:bg-garage-800 text-garage-600 dark:text-garage-300'}`}>
          Toate
        </button>
        {vehiclesWithStatus.map((v) => (
          <button key={v.id} onClick={() => setFilter(v.id)}
            className={`chip shrink-0 ${filter === v.id
              ? 'bg-accent-600 text-white'
              : 'bg-garage-100 dark:bg-garage-800 text-garage-600 dark:text-garage-300'}`}>
            {v.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card>
          <Empty
            icon={Droplets}
            title="Niciun schimb aici"
            hint="Adauga primul schimb si istoricul incepe sa se construiasca."
            action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adauga schimb</button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((c, i) => {
            const v = vehiclesWithStatus.find((x) => x.id === c.vehicle_id)
            const total = Number(c.part_cost || 0) + Number(c.labor_cost || 0)
            const filtre = [c.filter_oil, c.filter_air, c.filter_cabin].filter(Boolean)
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">
                          {new Date(c.date).toLocaleDateString('ro-RO')}
                        </p>
                        <span className="text-xs text-garage-400 dark:text-garage-500">
                          {v?.name || 'Masina eliminata'} · {Number(c.km).toLocaleString('ro-RO')} km
                        </span>
                      </div>
                      {(c.oil_brand || c.oil_spec || c.oil_quantity) && (
                        <p className="text-sm mt-1.5 text-garage-600 dark:text-garage-300">
                          {[c.oil_brand, c.oil_spec, c.oil_quantity && `${c.oil_quantity} L`].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {filtre.length > 0 && (
                        <p className="text-xs mt-1 text-garage-500 dark:text-garage-400">
                          Filtre: {filtre.join(', ')}
                        </p>
                      )}
                      {c.shop && <p className="text-xs mt-0.5 text-garage-400 dark:text-garage-500">Service: {c.shop}</p>}
                      {c.notes && <p className="text-xs mt-1.5 text-garage-500 dark:text-garage-400 italic">{c.notes}</p>}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-semibold text-sm">{money(total)} lei</p>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg grid place-items-center
                                bg-garage-100 dark:bg-garage-800">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => remove(c)} className="w-8 h-8 rounded-lg grid place-items-center
                                bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {(Number(c.part_cost) > 0 || Number(c.labor_cost) > 0) && (
                    <p className="mt-3 pt-3 border-t border-garage-100 dark:border-garage-800 text-xs text-garage-400 dark:text-garage-500">
                      Piese {money(c.part_cost)} lei · Manopera {money(c.labor_cost)} lei
                    </p>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {list.length > 0 && (
        <p className="mt-5 text-xs text-garage-400 dark:text-garage-500 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Butoanele PDF si Excel genereaza istoricul filtrat de acum.
        </p>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} wide
             title={editing === 'new' ? 'Adauga schimb' : 'Editeaza schimb'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Masina *">
              <select className="input" value={form.vehicle_id} required
                      onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">Alege...</option>
                {vehiclesWithStatus.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Field>
            <Field label="Data *">
              <input className="input" type="date" value={form.date} required
                     onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>

          <Field label="Kilometraj *">
            <input className="input" type="number" inputMode="numeric" value={form.km} required
                   onChange={(e) => setForm({ ...form, km: e.target.value })} />
          </Field>

          <div className="pt-1 border-t border-garage-100 dark:border-garage-800">
            <p className="text-xs font-semibold text-garage-500 dark:text-garage-400 mb-3">ULEI</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Brand"><input className="input" value={form.oil_brand}
                onChange={(e) => setForm({ ...form, oil_brand: e.target.value })} placeholder="Motul" /></Field>
              <Field label="Specificatie"><input className="input" value={form.oil_spec}
                onChange={(e) => setForm({ ...form, oil_spec: e.target.value })} placeholder="5W-30" /></Field>
              <Field label="Cantitate (L)"><input className="input" type="number" step="0.1" value={form.oil_quantity}
                onChange={(e) => setForm({ ...form, oil_quantity: e.target.value })} placeholder="4.5" /></Field>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-garage-500 dark:text-garage-400 mb-3">FILTRE</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Ulei"><input className="input" value={form.filter_oil}
                onChange={(e) => setForm({ ...form, filter_oil: e.target.value })} placeholder="Mahle" /></Field>
              <Field label="Aer"><input className="input" value={form.filter_air}
                onChange={(e) => setForm({ ...form, filter_air: e.target.value })} placeholder="Mann" /></Field>
              <Field label="Habitaclu"><input className="input" value={form.filter_cabin}
                onChange={(e) => setForm({ ...form, filter_cabin: e.target.value })} placeholder="Bosch" /></Field>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-garage-500 dark:text-garage-400 mb-3">COSTURI</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Piese (lei)"><input className="input" type="number" value={form.part_cost}
                onChange={(e) => setForm({ ...form, part_cost: e.target.value })} placeholder="0" /></Field>
              <Field label="Manopera (lei)"><input className="input" type="number" value={form.labor_cost}
                onChange={(e) => setForm({ ...form, labor_cost: e.target.value })} placeholder="0" /></Field>
            </div>
          </div>

          <Field label="Service / atelier">
            <input className="input" value={form.shop}
                   onChange={(e) => setForm({ ...form, shop: e.target.value })} placeholder="ex: Autoliv Constanta" />
          </Field>

          <Field label="Observatii">
            <textarea className="input min-h-20 resize-y" value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost flex-1">Renunta</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner className="w-4 h-4" /> : 'Salveaza'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

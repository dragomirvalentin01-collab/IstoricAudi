import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useGarage } from '../hooks/useGarage'
import { Card, PageHeader, Empty, Modal, Field, Spinner } from '../components/ui'

const EMPTY = { vehicle_id: '', date: new Date().toISOString().slice(0, 10), km: '', title: '', body: '' }

export default function Notes() {
  const { user } = useAuth()
  const { notes, vehiclesWithStatus, loading, reload } = useGarage()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setForm(EMPTY)
    setEditing('new')
  }

  function openEdit(n) {
    setForm({
      vehicle_id: n.vehicle_id || '', date: n.date || '', km: n.km ?? '',
      title: n.title || '', body: n.body || ''
    })
    setEditing(n)
  }

  async function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)

    const payload = {
      vehicle_id: form.vehicle_id || null,
      date: form.date,
      km: form.km === '' ? null : Number(form.km),
      title: form.title.trim(),
      body: form.body.trim() || null
    }

    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('notes').insert({ ...payload, user_id: user.id }))
    } else {
      ;({ error } = await supabase.from('notes').update(payload).eq('id', editing.id))
    }

    setSaving(false)
    if (error) { alert(error.message); return }
    setEditing(null)
    reload()
  }

  async function remove(n) {
    if (!confirm(`Ștergi nota „${n.title}"?`)) return
    const { error } = await supabase.from('notes').delete().eq('id', n.id)
    if (error) { alert(error.message); return }
    reload()
  }

  if (loading) return <div className="grid place-items-center py-20"><Spinner className="w-8 h-8 text-accent-600" /></div>

  return (
    <>
      <PageHeader
        title="Notite"
        subtitle="Piese schimbate, reparatii, orice altceva de retinut"
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adauga</button>}
      />

      {notes.length === 0 ? (
        <Card>
          <Empty
            icon={StickyNote}
            title="Nicio notita"
            hint="Bun loc pentru ce ai schimbat recent, sau pentru observatii despre masina."
            action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adauga notita</button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((n, i) => {
            const v = vehiclesWithStatus.find((x) => x.id === n.vehicle_id)
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-xs text-garage-400 dark:text-garage-500 mt-0.5">
                        {new Date(n.date).toLocaleDateString('ro-RO')}
                        {v && ` · ${v.name}`}
                        {n.km != null && ` · ${Number(n.km).toLocaleString('ro-RO')} km`}
                      </p>
                      {n.body && <p className="text-sm mt-2 text-garage-600 dark:text-garage-300 whitespace-pre-wrap">{n.body}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(n)} className="w-8 h-8 rounded-lg grid place-items-center
                              bg-garage-100 dark:bg-garage-800">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(n)} className="w-8 h-8 rounded-lg grid place-items-center
                              bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Adauga notita' : 'Editeaza notita'}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Titlu *">
            <input className="input" value={form.title} required
                   onChange={(e) => setForm({ ...form, title: e.target.value })}
                   placeholder="ex: Am schimbat si bushingi" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Masina">
              <select className="input" value={form.vehicle_id}
                      onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">—</option>
                {vehiclesWithStatus.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Field>
            <Field label="Data">
              <input className="input" type="date" value={form.date}
                     onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Km">
              <input className="input" type="number" value={form.km}
                     onChange={(e) => setForm({ ...form, km: e.target.value })} />
            </Field>
          </div>

          <Field label="Detalii">
            <textarea className="input min-h-32 resize-y" value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })} />
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

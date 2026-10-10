import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { serviceStatus } from '../lib/reminders'

/**
 * Incarca masinile + schimburile odata si tine calculul statusului
 * (km / timp de la ultimul schimb) mereu la zi.
 */
export function useGarage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [changes, setChanges] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) return
    setError(null)
    const [v, c, n] = await Promise.all([
      supabase.from('vehicles').select('*').order('created_at'),
      supabase.from('oil_changes').select('*').order('date', { ascending: false }),
      supabase.from('notes').select('*').order('date', { ascending: false })
    ])
    const err = v.error || c.error || n.error
    if (err) setError(err.message)
    setVehicles(v.data || [])
    setChanges(c.data || [])
    setNotes(n.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { reload() }, [reload])

  /** ultimul schimb pentru fiecare masina */
  const lastByVehicle = changes.reduce((acc, c) => {
    if (!c.vehicle_id) return acc
    const cur = acc[c.vehicle_id]
    if (!cur || new Date(c.date) > new Date(cur.date)) acc[c.vehicle_id] = c
    return acc
  }, {})

  const vehiclesWithStatus = vehicles.map((v) => ({
    ...v,
    status: serviceStatus(v, lastByVehicle[v.id]),
    lastChange: lastByVehicle[v.id] || null
  }))

  const totalSpend = changes.reduce(
    (sum, c) => sum + Number(c.part_cost || 0) + Number(c.labor_cost || 0), 0
  )

  const dueSoon = vehiclesWithStatus.filter(
    (v) => v.status.level === 'due' || v.status.level === 'soon'
  )

  return {
    vehicles, vehiclesWithStatus, changes, notes,
    loading, error, reload,
    totalSpend, dueSoon,
    lastByVehicle
  }
}

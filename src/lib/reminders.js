/**
 * Calculeaza starea unui vehicul fata de ultimul schimb de ulei.
 * Returneaza nivelul de alerta dupa km sau timp, oricare se atinge primul.
 */
export function serviceStatus(vehicle, lastChange) {
  const intervalKm = vehicle.oil_interval_km || 15000
  const intervalMonths = vehicle.oil_interval_months || 12
  const currentKm = vehicle.current_km || 0

  if (!lastChange) {
    return { level: 'unknown', kmLeft: intervalKm, daysLeft: intervalMonths * 30, label: 'Fara istoric' }
  }

  const kmSince = currentKm - (lastChange.km || currentKm)
  const kmLeft = intervalKm - kmSince

  const then = new Date(lastChange.date)
  const now = new Date()
  const monthsSince = (now - then) / (1000 * 60 * 60 * 24 * 30.44)
  const monthsLeft = intervalMonths - monthsSince
  const daysLeft = Math.round(monthsLeft * 30.44)

  let level = 'ok'
  if (kmLeft <= 0 || monthsLeft <= 0) level = 'due'
  else if (kmLeft <= intervalKm * 0.1 || monthsLeft <= 1) level = 'soon'

  return { level, kmLeft: Math.round(kmLeft), daysLeft, kmSince: Math.round(kmSince) }
}

export const STATUS_STYLE = {
  ok:      { chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', text: 'OK' },
  soon:    { chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',       text: 'Curand' },
  due:     { chip: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',                text: 'De facut' },
  unknown: { chip: 'bg-garage-100 text-garage-600 dark:bg-garage-800 dark:text-garage-400',         text: 'Fara istoric' }
}

import { supabase } from './supabase'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** cere permisiunea pentru notificari */
export async function requestPermission() {
  if (!pushSupported()) throw new Error('Browserul nu suporta notificari push.')
  const result = await Notification.requestPermission()
  if (result !== 'granted') throw new Error('Permisiune refuzata.')
  return result
}

/** activeaza abonamentul push si il salveaza in baza de date */
export async function enablePush(userId, vapidPublicKey) {
  if (!vapidPublicKey) throw new Error('Cheia VAPID nu este configurata.')

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.toJSON().keys?.p256dh,
      auth: subscription.toJSON().keys?.auth
    },
    { onConflict: 'endpoint' }
  )
  if (error) throw error

  return subscription
}

/** retrage abonamentul */
export async function disablePush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
    await subscription.unsubscribe()
  }
}

export async function isPushEnabled() {
  if (!pushSupported()) return false
  const registration = await navigator.serviceWorker.ready
  return !!(await registration.pushManager.getSubscription())
}

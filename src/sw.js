/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

// Service worker generat de vite-plugin-pwa (strategie injectManifest)
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// --- Push: alerta de schimb ulei ---
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'Istoric Auto', body: event.data?.text() || 'Ai o notificatie noua.' }
  }

  const title = payload.title || 'Istoric Auto'
  const options = {
    body: payload.body || 'E timpul pentru un schimb de ulei.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.tag || 'istoric-auto-reminder',
    renotify: true,
    vibrate: [120, 60, 120],
    data: { url: payload.url || '/' }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Click pe notificatie -> deschide aplicatia
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// inregistreaza service worker-ul pentru PWA + push
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true })
      return navigator.serviceWorker.ready
    })
    .then((registration) => {
      // la o versiune noua, ia automat controlul fara reîncarcare
      registration.addEventListener('updatefound', () => {
        const sw = registration.installing
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            sw.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    })
    .catch(() => {})
}

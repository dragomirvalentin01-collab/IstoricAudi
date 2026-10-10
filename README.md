# Istoric Auto

Aplicatie PWA pentru urmarirea schimburilor de ulei si filtre.
React 18 + Vite 5 + Tailwind + Supabase.

## Ce face

- **Masini** - mai multe masini, fiecare cu interval de schimb configurabil (km sau luni)
- **Schimburi** - ulei (brand, specificatie, cantitate) + filtre (ulei, aer, habitaclu) + costuri
- **Istoric** - filtrabil pe masina, export PDF si Excel
- **Notite** - piese schimbate, reparatii, observatii
- **Alerta** - aplicatia iti spune cand e timpul de schimb, dupa km sau timp
- **Sincronizare cloud** - datele sunt in Supabase, pe telefon si calculator
- **Autentificare Google**
- **Dark/Light**, **PWA instalabil**, **notificari push**

## Pornire

```bash
npm install
npm run dev
```

Build de productie:

```bash
npm run build
npm run preview
```

## Configurare

`.env` (copiaza din `.env.example`):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_VAPID_PUBLIC_KEY=...   # optional, doar pentru push
```

Baza de date: ruleaza `supabase/schema.sql` in SQL Editor.

## Ce mai trebuie facut

**Google Auth** - in Supabase: Authentication > Providers > Google, completeaza
Client ID si Client Secret din Google Cloud Console. Redirect URI:
`https://<ref>.supabase.co/auth/v1/callback`

**Notificari push** - doua lucruri:
1. chei VAPID (generează-le si pune publică in `.env`)
2. un sender - Supabase Edge Function care citește din `push_subscriptions`
   și trimite push. Până vine asta, alerta apare în aplicație la deschidere.

## Structura

```
src/
  components/   Layout, ui (Card, Modal, Field...)
  context/      AuthContext, ThemeContext
  hooks/        useGarage - date + status calculat
  lib/          supabase, export (PDF/Excel), push, reminders
  pages/        Login, Dashboard, Vehicles, OilChanges, Notes, Settings
  sw.js         service worker (precache + push)
supabase/
  schema.sql
```

## Securitate

Fiecare tabel are RLS activ cu politica `own` - un utilizator vede doar
datele lui. Cheile anon sunt publice prin design; service_role nu ajunge
în client.

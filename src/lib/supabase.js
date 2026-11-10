import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('chenar') &&
  !rawKey.includes('chenar') &&
  !rawUrl.includes('<ref>')
)

// Folosim valori dummy sigure dacă nu sunt furnizate în .env,
// pentru ca apelul createClient să nu arunce excepție la importul modulului și să nu blocheze randarea React
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'

export const supabase = createClient(
  rawUrl || fallbackUrl,
  rawKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

/** arunca daca supabase nu e configurat, ca sa nu iti arunce erori ciudate */
export function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase neconfigurat. Copiaza .env.example in .env si completeaza cheile.')
  }
}

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

/** arunca daca supabase nu e configurat, ca sa nu iti arunce erori ciudate */
export function assertConfigured() {
  if (!url || !key || url.includes('chenar') || key.includes('chenar')) {
    throw new Error('Supabase neconfigurat. Copiaza .env.example in .env si completeaza cheile.')
  }
}

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Versão compatível do createServerClient que não depende de next/headers
export function createServerClientCompat() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL e Key são necessários")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Função que estava faltando
export function getSupabaseServerCompat() {
  return createServerClientCompat()
}

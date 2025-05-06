// Versão que não usa next/headers
import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Função que não depende de cookies do servidor
export function createServerClientSafe() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Re-exportar a função original para manter compatibilidade
export { createServerClient } from "./server"

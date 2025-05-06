import { createServerClient as createServerClientOriginal } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { createServerClientCompat, getSupabaseServerCompat } from "./server-compat"

// Função para obter cookies de forma segura
async function getCookieStore() {
  // Importação dinâmica para evitar problemas durante a construção
  const { cookies } = await import("next/headers")
  return cookies()
}

export async function getSupabaseServer(cookieStore?: any) {
  // Log para debug
  console.log("[DEBUG-SUPABASE-SERVER] Criando cliente Supabase Server")

  try {
    // Se cookieStore não for fornecido, obtenha-o dinamicamente
    const store = cookieStore || (await getCookieStore())

    const client = createServerClientOriginal<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = store.get(name)?.value
            console.log(`[DEBUG-SUPABASE-SERVER] Obtendo cookie: ${name}`, cookie ? "Encontrado" : "Não encontrado")
            return cookie
          },
          set(name: string, value: string, options: any) {
            try {
              console.log(`[DEBUG-SUPABASE-SERVER] Definindo cookie: ${name}`)
              store.set({ name, value, ...options })
            } catch (error) {
              // This might happen in middleware where cookies are readonly
              console.error("[DEBUG-SUPABASE-SERVER] Falha ao definir cookie:", error)
            }
          },
          remove(name: string, options: any) {
            try {
              console.log(`[DEBUG-SUPABASE-SERVER] Removendo cookie: ${name}`)
              store.set({ name, value: "", ...options })
            } catch (error) {
              // This might happen in middleware where cookies are readonly
              console.error("[DEBUG-SUPABASE-SERVER] Falha ao remover cookie:", error)
            }
          },
        },
      },
    )

    console.log("[DEBUG-SUPABASE-SERVER] Cliente Supabase Server criado com sucesso")
    return client
  } catch (error) {
    console.error("[DEBUG-SUPABASE-SERVER] Erro ao criar cliente Supabase Server:", error)
    throw error
  }
}

// Modificar a exportação da função createServerClient para incluir as variáveis de ambiente necessárias
export async function createServerClient(cookieStore: any) {
  return createServerClientOriginal<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // This might happen in middleware where cookies are readonly
            console.error("Falha ao definir cookie:", error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // This might happen in middleware where cookies are readonly
            console.error("Falha ao remover cookie:", error)
          }
        },
      },
    },
  )
}

// Re-exportar as versões compatíveis
export { createServerClientCompat, getSupabaseServerCompat }

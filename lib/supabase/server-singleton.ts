import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

// Cache para armazenar a instância do cliente por requisição
const clientCache = new Map()

export function getSupabaseServerClient() {
  const cookieStore = cookies()

  // Criar um identificador único para a requisição atual
  // Isso é uma simplificação, em produção você pode querer usar um ID de requisição mais robusto
  const requestId = Math.random().toString(36).substring(2, 15)

  if (!clientCache.has(requestId)) {
    console.log("[Supabase Server] Criando nova instância do cliente para requisição")

    const client = createServerClient<Database>(
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
              console.error("[Supabase Server] Falha ao definir cookie:", error)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options })
            } catch (error) {
              console.error("[Supabase Server] Falha ao remover cookie:", error)
            }
          },
        },
      },
    )

    clientCache.set(requestId, client)

    // Limpar o cache após um tempo para evitar vazamento de memória
    setTimeout(() => {
      clientCache.delete(requestId)
    }, 5000) // 5 segundos é geralmente suficiente para uma requisição completa
  }

  return clientCache.get(requestId)
}

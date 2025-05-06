import { cookies } from "next/headers"
import { createServerClient as createServerClientOriginal } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Cliente Supabase para o servidor (módulo escola)
export function getEscolaSupabaseServer(cookieStore = cookies()) {
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
            console.error("[Escola Supabase] Falha ao definir cookie:", error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.error("[Escola Supabase] Falha ao remover cookie:", error)
          }
        },
      },
    },
  )
}

// Cliente Supabase para o cliente (módulo escola)
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getEscolaSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getEscolaSupabaseClient deve ser usado apenas no cliente")
  }

  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    })
  }

  return clientInstance
}

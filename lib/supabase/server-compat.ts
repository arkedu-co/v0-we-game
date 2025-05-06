import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Versão compatível para projetos que usam a versão antiga do Supabase
export function getSupabaseServerCompat() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Versão compatível para projetos que usam a versão antiga do Supabase
export function createServerClientCompat(cookieStore: any) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

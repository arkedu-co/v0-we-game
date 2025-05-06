import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

export default async function ProfessorLoginPage() {
  // Usar createServerClient diretamente para evitar problemas de importação
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

    if (profile && profile.user_type === "professor") {
      redirect("/professor/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Login do Professor</h1>
        <p className="text-center mb-4">Por favor, use o formulário de login no navegador para acessar sua conta.</p>
        <div className="text-center">
          <a
            href="/professor/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ir para o Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

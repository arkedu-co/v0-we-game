import { EscolaLoginForm } from "@/components/auth/escola-login-form"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function EscolaLoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string }
}) {
  // Verificar se o usuário já está autenticado
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se já estiver autenticado, redirecionar para o dashboard
  if (session) {
    // Verificar o tipo de usuário
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

    // Se for uma escola ou admin, redirecionar para o dashboard ou página solicitada
    if (profile?.user_type === "escola" || profile?.user_type === "admin") {
      const redirectTo = searchParams.redirectTo || "/escola/dashboard"
      return redirect(redirectTo)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Sistema Escolar</h1>
          <p className="mt-2 text-sm text-gray-600">Portal da Escola</p>
        </div>
        <EscolaLoginForm />
      </div>
    </div>
  )
}

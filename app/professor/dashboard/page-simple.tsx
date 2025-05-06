"use client"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

export default async function ProfessorDashboardPageSimple() {
  try {
    console.log("[Professor Dashboard Simple] Iniciando carregamento da página")

    // Usar cookies() para obter o cookie store
    const cookieStore = cookies()

    // Criar cliente Supabase para o servidor
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error("[Professor Dashboard Simple] Erro ao definir cookie:", error)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options })
            } catch (error) {
              console.error("[Professor Dashboard Simple] Erro ao remover cookie:", error)
            }
          },
        },
      },
    )

    console.log("[Professor Dashboard Simple] Cliente Supabase criado, verificando sessão")

    // Verificar sessão
    const sessionResponse = await supabase.auth.getSession()
    const session = sessionResponse.data.session

    if (!session) {
      console.log("[Professor Dashboard Simple] Sessão não encontrada, redirecionando para login")
      return redirect("/professor/login?reason=no_session")
    }

    console.log("[Professor Dashboard Simple] Sessão encontrada para usuário:", session.user.id)

    // Verificar se o usuário é um professor
    const profileResponse = await supabase
      .from("profiles")
      .select("user_type, full_name")
      .eq("id", session.user.id)
      .single()

    if (profileResponse.error) {
      console.error("[Professor Dashboard Simple] Erro ao buscar perfil:", profileResponse.error)
      return redirect("/professor/login?reason=profile_error")
    }

    const profile = profileResponse.data

    if (!profile || profile.user_type !== "professor") {
      console.log(
        `[Professor Dashboard Simple] Usuário não é professor (${profile?.user_type}), redirecionando para login`,
      )
      return redirect("/professor/login?reason=not_professor")
    }

    console.log("[Professor Dashboard Simple] Perfil de professor confirmado, renderizando dashboard simples")

    // Renderizar um dashboard simples
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <header className="bg-white border-b shadow-sm p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Dashboard do Professor</h1>
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Bem-vindo(a), {profile.full_name || "Professor(a)"}</h2>
            <p className="text-gray-600 mb-6">Este é o seu dashboard simplificado.</p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Minhas Turmas</h3>
                <p className="text-sm text-blue-600">Gerencie suas turmas e aulas</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="font-medium text-green-800 mb-2">Atividades</h3>
                <p className="text-sm text-green-600">Crie e gerencie atividades</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="font-medium text-purple-800 mb-2">Meu Perfil</h3>
                <p className="text-sm text-purple-600">Visualize e edite seus dados</p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/professor/login"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Voltar para o login
              </a>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("[Professor Dashboard Simple] Erro não tratado:", error)

    // Em vez de redirecionar, exibir uma página de erro
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Erro ao carregar o dashboard</h1>
          <p className="mb-4 text-gray-700">
            Ocorreu um erro ao carregar o dashboard do professor. Por favor, tente novamente mais tarde.
          </p>
          <div className="flex space-x-4">
            <a href="/professor/login" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              Voltar para o login
            </a>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
            >
              Tentar novamente
            </button>
          </div>
          <div className="mt-4 rounded-lg bg-gray-100 p-4">
            <p className="text-xs text-gray-500">
              Detalhes técnicos: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

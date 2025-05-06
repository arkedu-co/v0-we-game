"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { VinculoForm } from "./vinculo-form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export function VinculoPageWrapper() {
  const [loading, setLoading] = useState(true)
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificar sessão
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Erro ao verificar sessão:", sessionError)
          router.push("/escola/login?redirectTo=/escola/vinculos/novo")
          return
        }

        if (!session) {
          console.log("Sem sessão, redirecionando para login")
          router.push("/escola/login?redirectTo=/escola/vinculos/novo")
          return
        }

        console.log("Usuário autenticado:", session.user.id)

        // Verificar se o usuário é uma escola
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, user_type")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError.message)
          setError("Erro ao buscar perfil do usuário")
          setLoading(false)
          return
        }

        let foundEscolaId = null

        // Se for uma escola, usar diretamente
        if (profile.user_type === "escola") {
          foundEscolaId = profile.id
          console.log("Usuário é uma escola com ID:", foundEscolaId)
        } else {
          // Buscar escola usando outra tabela
          const { data: escola, error: escolaError } = await supabase
            .from("schools")
            .select("id, name")
            .eq("owner_id", session.user.id)
            .single()

          if (escolaError && escolaError.code !== "PGRST116") {
            console.error("Erro ao buscar escola:", escolaError.message)
            setError("Erro ao buscar escola associada ao usuário")
            setLoading(false)
            return
          }

          if (escola) {
            foundEscolaId = escola.id
            console.log("Encontrada escola por ID direto:", escola.name)
          } else {
            // Verificar se o próprio ID do usuário é uma escola
            const { data: escolaDireta, error: escolaDiretaError } = await supabase
              .from("schools")
              .select("id, name")
              .eq("id", session.user.id)
              .single()

            if (escolaDiretaError && escolaDiretaError.code !== "PGRST116") {
              console.error("Erro ao buscar escola direta:", escolaDiretaError.message)
              setError("Erro ao buscar escola associada ao usuário")
              setLoading(false)
              return
            }

            if (escolaDireta) {
              foundEscolaId = escolaDireta.id
              console.log("Usuário é a própria escola:", escolaDireta.name)
            }
          }
        }

        if (!foundEscolaId) {
          console.log("Escola não encontrada, redirecionando para dashboard")
          router.push("/escola/dashboard")
          return
        }

        console.log("Usando ID do usuário como ID da escola:", foundEscolaId)
        setEscolaId(foundEscolaId)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setError("Erro ao verificar autenticação")
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  if (!escolaId) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Atenção!</strong>
          <span className="block sm:inline"> Não foi possível determinar a escola associada ao seu perfil.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Novo Vínculo</h1>
      <VinculoForm escolaId={escolaId} />
    </div>
  )
}

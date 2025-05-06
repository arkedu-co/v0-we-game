"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { LojaDashboard } from "@/components/escola/loja/loja-dashboard"

export function LojaContent() {
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchEscolaId() {
      try {
        setIsLoading(true)

        // Obter a sessão atual
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          setError("Sessão não encontrada")
          return
        }

        const userId = sessionData.session.user.id

        // Verificar o tipo de usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError)
          setError("Erro ao buscar perfil do usuário")
          return
        }

        // Buscar o ID da escola com base no tipo de usuário
        let id = null

        // Verificar se o usuário é uma escola diretamente
        const { data: escolaDireta } = await supabase.from("schools").select("id").eq("id", userId).single()

        if (escolaDireta) {
          id = escolaDireta.id
        } else {
          // Buscar pelo ID do diretor
          const { data: escolaDiretor } = await supabase.from("schools").select("id").eq("director_id", userId).single()

          if (escolaDiretor) {
            id = escolaDiretor.id
          } else {
            // Buscar pelo ID do proprietário
            const { data: escolaProprietario } = await supabase
              .from("schools")
              .select("id")
              .eq("owner_id", userId)
              .single()

            if (escolaProprietario) {
              id = escolaProprietario.id
            }
          }
        }

        if (!id) {
          setError("ID da escola não encontrado")
          return
        }

        setEscolaId(id)
      } catch (error) {
        console.error("Erro ao buscar ID da escola:", error)
        setError("Erro ao buscar dados da escola")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEscolaId()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  if (!escolaId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Atenção: </strong>
        <span className="block sm:inline">Não foi possível encontrar a escola associada ao seu usuário.</span>
      </div>
    )
  }

  return <LojaDashboard escolaId={escolaId} />
}

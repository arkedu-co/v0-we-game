"use client"

import { LojaAuthenticatedLayout } from "@/components/layout/loja-authenticated-layout"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { EstoqueList } from "@/components/escola/loja/estoque-list"
import { EstoqueAlertas } from "@/components/escola/loja/estoque-alertas"

export default function EstoquePage() {
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchEscolaData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("Sessão não encontrada")
          return
        }

        // Obter ID da escola
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, user_type")
          .eq("id", session.user.id)
          .single()

        if (!profile || profile.user_type !== "escola") {
          setError("Perfil não encontrado ou não é uma escola")
          return
        }

        setEscolaId(profile.id)
      } catch (err) {
        console.error("Erro ao buscar dados da escola:", err)
        setError("Erro ao buscar dados da escola")
      } finally {
        setLoading(false)
      }
    }

    fetchEscolaData()
  }, [supabase])

  return (
    <LojaAuthenticatedLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Controle de Estoque</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">{error}</div>
        ) : (
          escolaId && (
            <>
              <div className="relative min-h-[100px]">
                <EstoqueAlertas escolaId={escolaId} />
              </div>
              <div className="relative min-h-[200px]">
                <EstoqueList escolaId={escolaId} />
              </div>
            </>
          )
        )}
      </div>
    </LojaAuthenticatedLayout>
  )
}

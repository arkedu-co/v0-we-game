"use client"

import { LojaAuthenticatedLayout } from "@/components/layout/loja-authenticated-layout"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { ProdutosList } from "@/components/escola/loja/produtos-list"

export default function ProdutosPage() {
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

        const { data: escola } = await supabase.from("schools").select("id").eq("director_id", session.user.id).single()

        if (escola) {
          setEscolaId(escola.id)
        } else {
          setError("Escola não encontrada")
        }
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
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Produtos da Loja</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">{error}</div>
        ) : (
          escolaId && <ProdutosList escolaId={escolaId} />
        )}
      </div>
    </LojaAuthenticatedLayout>
  )
}

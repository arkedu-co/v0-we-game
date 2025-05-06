"use client"

import { LojaAuthenticatedLayout } from "@/components/layout/loja-authenticated-layout"
import { LojaDashboard } from "@/components/escola/loja/loja-dashboard"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function LojaPage() {
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchEscolaId() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("Sessão não encontrada")
          return
        }

        // Obter ID da escola
        const { data: escola } = await supabase.from("schools").select("id").eq("director_id", session.user.id).single()

        if (!escola) {
          setError("Escola não encontrada")
          return
        }

        setEscolaId(escola.id)
      } catch (err) {
        console.error("Erro ao buscar ID da escola:", err)
        setError("Erro ao buscar ID da escola")
      } finally {
        setLoading(false)
      }
    }

    fetchEscolaId()
  }, [supabase])

  return (
    <LojaAuthenticatedLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard da Loja</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">{error}</div>
        ) : (
          escolaId && <LojaDashboard escolaId={escolaId} />
        )}
      </div>
    </LojaAuthenticatedLayout>
  )
}

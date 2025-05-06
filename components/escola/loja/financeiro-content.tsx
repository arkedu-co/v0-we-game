"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { FinanceiroReport } from "@/components/escola/loja/financeiro-report"

export function FinanceiroContent() {
  const [storeId, setStoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchStoreData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("Sessão não encontrada")
          return
        }

        // Verificar se a escola tem uma loja
        const { data: storeData } = await supabase
          .from("school_stores")
          .select("*")
          .eq("school_id", session.user.id)
          .single()

        if (!storeData) {
          setError("Loja não encontrada")
          return
        }

        setStoreId(storeData.id)
      } catch (err) {
        console.error("Erro ao buscar dados da loja:", err)
        setError("Erro ao buscar dados da loja")
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error || !storeId) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        {error || "Loja não encontrada"}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financeiro da Loja</h1>
      <FinanceiroReport storeId={storeId} />
    </div>
  )
}

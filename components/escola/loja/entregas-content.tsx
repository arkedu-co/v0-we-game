"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { EntregasList } from "@/components/escola/loja/entregas-list"

export function EntregasContent() {
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [entregas, setEntregas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchEntregasData() {
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

        // Buscando entregas usando a mesma lógica do serviço
        const { data: entregas, error: entregasError } = await supabase
          .from("store_deliveries")
          .select(`
            *,
            order:order_id (
              *,
              student:student_id (*),
              items:store_order_items (
                *,
                product:product_id (*)
              )
            )
          `)
          .eq("school_id", escola.id)
          .order("created_at", { ascending: false })

        if (entregasError) {
          throw entregasError
        }

        setEntregas(entregas || [])
      } catch (err) {
        console.error("Erro ao carregar entregas:", err)
        setError("Erro ao carregar entregas")
      } finally {
        setLoading(false)
      }
    }

    fetchEntregasData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error || !escolaId) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        {error || "Escola não encontrada"}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Entregas</h1>
      <EntregasList entregas={entregas} escolaId={escolaId} />
    </div>
  )
}

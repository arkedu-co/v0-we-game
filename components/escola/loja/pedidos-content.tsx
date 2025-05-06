"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { PedidosList } from "@/components/escola/loja/pedidos-list"

export function PedidosContent() {
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchPedidosData() {
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

        // Verificar se a escola tem uma loja
        const { data: storeData } = await supabase.from("school_stores").select("*").eq("school_id", escola.id).single()

        if (!storeData) {
          setError("Loja não encontrada")
          return
        }

        // Buscar pedidos com informações do aluno e itens
        const { data: pedidosData } = await supabase
          .from("store_orders")
          .select(`
            *,
            student:student_id (
              *,
              profile:id (*)
            ),
            items:store_order_items (
              *,
              product:product_id (*)
            )
          `)
          .eq("store_id", storeData.id)
          .order("created_at", { ascending: false })

        setPedidos(pedidosData || [])
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err)
        setError("Erro ao buscar pedidos")
      } finally {
        setLoading(false)
      }
    }

    fetchPedidosData()
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pedidos da Loja</h1>
      <PedidosList pedidos={pedidos} escolaId={escolaId} />
    </div>
  )
}

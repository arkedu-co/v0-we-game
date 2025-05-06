"use client"

import { LojaAuthenticatedLayout } from "@/components/layout/loja-authenticated-layout"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { EntregasList } from "@/components/escola/loja/entregas-list"

export default function EntregasPage() {
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

        // Verificar a estrutura da tabela store_deliveries
        const { data: tableInfo, error: tableError } = await supabase.from("store_deliveries").select("*").limit(1)

        if (tableError) {
          console.error("Erro ao verificar estrutura da tabela store_deliveries:", tableError)
          throw new Error("Não foi possível verificar a estrutura da tabela de entregas")
        }

        // Verificar se a coluna school_id existe
        const hasSchoolId = tableInfo && tableInfo.length > 0 && "school_id" in tableInfo[0]

        // Buscando entregas
        let query = supabase.from("store_deliveries").select(`
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

        // Se a coluna school_id existir, filtramos por ela
        if (hasSchoolId) {
          query = query.eq("school_id", escola.id)
        } else {
          // Caso contrário, filtramos pelo school_id do pedido
          query = query.eq("order.school_id", escola.id)
        }

        query = query.order("created_at", { ascending: false })

        const { data: entregas, error: entregasError } = await query

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

  return (
    <LojaAuthenticatedLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Entregas</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">{error}</div>
        ) : (
          escolaId && <EntregasList entregas={entregas} escolaId={escolaId} />
        )}
      </div>
    </LojaAuthenticatedLayout>
  )
}

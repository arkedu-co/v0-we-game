"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HistoricoTransacoesProps {
  alunoId: string
}

interface Transacao {
  id: string
  data: string
  dataRelativa: string
  tipo: "credit" | "debit"
  valor: number
  descricao: string
}

export function HistoricoTransacoes({ alunoId }: HistoricoTransacoesProps) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarTransacoes() {
      if (!alunoId) return

      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("atom_transactions")
          .select("*")
          .eq("student_id", alunoId)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) {
          console.error("Erro ao buscar transações:", error)
          setError("Não foi possível carregar o histórico de transações")
          return
        }

        // Formatar dados das transações
        const transacoesFormatadas = data.map((transacao) => {
          const data = new Date(transacao.created_at)
          return {
            id: transacao.id,
            data: data.toLocaleDateString(),
            dataRelativa: formatDistanceToNow(data, { addSuffix: true, locale: ptBR }),
            tipo: transacao.transaction_type as "credit" | "debit",
            valor: transacao.amount,
            descricao: transacao.description || "Sem descrição",
          }
        })

        setTransacoes(transacoesFormatadas)
      } catch (error) {
        console.error("Erro ao carregar transações:", error)
        setError("Ocorreu um erro ao carregar o histórico de transações")
      } finally {
        setLoading(false)
      }
    }

    carregarTransacoes()
  }, [alunoId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações de Átomos</CardTitle>
      </CardHeader>
      <CardContent>
        {transacoes.length > 0 ? (
          <div className="space-y-4">
            {transacoes.map((transacao) => (
              <div key={transacao.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{transacao.descricao}</h4>
                    <p className="text-sm text-gray-500">
                      {transacao.data} ({transacao.dataRelativa})
                    </p>
                  </div>
                  <Badge
                    className={
                      transacao.tipo === "credit"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {transacao.tipo === "credit" ? "+" : "-"}
                    {transacao.valor} átomos
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Nenhuma transação registrada para este aluno.</div>
        )}
      </CardContent>
    </Card>
  )
}

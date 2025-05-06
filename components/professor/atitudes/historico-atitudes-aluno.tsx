"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HistoricoAtitudesAlunoProps {
  alunoId: string
}

interface Atitude {
  id: string
  data: string
  professor: string
  atitude: string
  tipo: string
  pontos: number
  observacoes?: string
}

export function HistoricoAtitudesAluno({ alunoId }: HistoricoAtitudesAlunoProps) {
  const [atitudes, setAtitudes] = useState<Atitude[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarAtitudes() {
      if (!alunoId) return

      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("applied_attitudes")
          .select(`
            id,
            created_at,
            notes,
            applied_by,
            attitude:attitude_id (
              id,
              name,
              type,
              reward_value,
              reward_type
            )
          `)
          .eq("student_id", alunoId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Erro ao buscar atitudes:", error)
          setError("Não foi possível carregar o histórico de atitudes")
          return
        }

        // Obter os IDs únicos dos professores
        const professorIds = [...new Set(data.map((item) => item.applied_by))].filter(Boolean)

        // Buscar os nomes dos professores
        let professoresMap = {}
        if (professorIds.length > 0) {
          const { data: professores, error: profError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", professorIds)

          if (!profError && professores) {
            professoresMap = professores.reduce((acc, prof) => {
              acc[prof.id] = prof.full_name
              return acc
            }, {})
          }
        }

        // Formatar dados das atitudes
        const atitudesFormatadas = data.map((atitude) => ({
          id: atitude.id,
          data: new Date(atitude.created_at).toLocaleDateString(),
          professor: professoresMap[atitude.applied_by] || "Professor não identificado",
          atitude: atitude.attitude?.name || "Atitude não identificada",
          tipo: atitude.attitude?.type || "N/A",
          pontos: atitude.attitude?.reward_value || 0,
          observacoes: atitude.notes || undefined,
        }))

        setAtitudes(atitudesFormatadas)
      } catch (error) {
        console.error("Erro ao carregar atitudes:", error)
        setError("Ocorreu um erro ao carregar o histórico de atitudes")
      } finally {
        setLoading(false)
      }
    }

    carregarAtitudes()
  }, [alunoId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atitudes</CardTitle>
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
          <CardTitle>Histórico de Atitudes</CardTitle>
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
        <CardTitle>Histórico de Atitudes</CardTitle>
      </CardHeader>
      <CardContent>
        {atitudes.length > 0 ? (
          <div className="space-y-4">
            {atitudes.map((atitude) => (
              <div key={atitude.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{atitude.atitude}</h4>
                    <p className="text-sm text-gray-500">
                      Aplicada por {atitude.professor} em {atitude.data}
                    </p>
                  </div>
                  <Badge
                    className={
                      atitude.tipo === "positive"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {atitude.tipo === "positive" ? "+" : "-"}
                    {atitude.pontos} pontos
                  </Badge>
                </div>
                {atitude.observacoes && <p className="text-sm bg-gray-50 p-2 rounded-md">{atitude.observacoes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Nenhuma atitude registrada para este aluno.</div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Subject } from "@/lib/types"

interface DisciplinasCardListProps {
  escolaId: string | null
}

export function DisciplinasCardList({ escolaId }: DisciplinasCardListProps) {
  const [disciplinas, setDisciplinas] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDisciplinas() {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        let query = supabase.from("subjects").select("*")

        if (escolaId) {
          query = query.eq("school_id", escolaId)
        }

        const { data, error } = await query.order("name")

        if (error) {
          throw error
        }

        setDisciplinas(data || [])
      } catch (err) {
        console.error("Erro ao buscar disciplinas:", err)
        setError("Não foi possível carregar as disciplinas. Por favor, tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchDisciplinas()
  }, [escolaId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  if (disciplinas.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">Nenhuma disciplina encontrada</h3>
        <p className="text-muted-foreground mb-4">Comece adicionando sua primeira disciplina.</p>
        <Link
          href="/escola/disciplinas/nova"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Adicionar Disciplina
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {disciplinas.map((disciplina) => (
        <Link href={`/escola/disciplinas/${disciplina.id}`} key={disciplina.id}>
          <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="aspect-video w-full relative overflow-hidden">
              {disciplina.image_url ? (
                <Image
                  src={disciplina.image_url || "/placeholder.svg"}
                  alt={disciplina.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-400">Sem imagem</span>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{disciplina.name}</h3>
                <Badge variant={disciplina.active ? "default" : "outline"}>
                  {disciplina.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{disciplina.description || "Sem descrição"}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {disciplina.workload ? `${disciplina.workload} horas` : "Carga horária não definida"}
              </div>
              <div className="text-sm font-medium">{disciplina.code || "Sem código"}</div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

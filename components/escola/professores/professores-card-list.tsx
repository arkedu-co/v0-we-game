"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, BookOpen, Mail } from "lucide-react"
import Link from "next/link"

type Professor = {
  id: string
  subjects: string[] | null
  profiles: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
    user_type: string | null
  } | null
  vinculos:
    | {
        id: string
        turma: {
          id: string
          name: string
          curso: {
            name: string
          } | null
        } | null
        disciplina: {
          id: string
          name: string
        } | null
      }[]
    | null
}

export function ProfessoresCardList() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfessores() {
      try {
        const supabase = createClientComponentClient<Database>()

        // Buscar a primeira escola disponível
        const { data: escolas, error: escolasError } = await supabase.from("schools").select("id, name").limit(1)

        if (escolasError) {
          throw new Error("Erro ao buscar escolas")
        }

        if (!escolas || escolas.length === 0) {
          setError("Nenhuma escola encontrada")
          setLoading(false)
          return
        }

        const escolaId = escolas[0].id

        // Buscar professores com JOIN na tabela profiles e vínculos
        const { data, error } = await supabase
          .from("teachers")
          .select(`
            id,
            subjects,
            profiles!inner(
              full_name,
              email,
              avatar_url,
              user_type
            ),
            vinculos:teacher_class_subjects(
              id,
              turma:class_id(
                id,
                name,
                curso:course_id(
                  name
                )
              ),
              disciplina:subject_id(
                id,
                name
              )
            )
          `)
          .eq("school_id", escolaId)

        if (error) {
          throw new Error("Erro ao buscar professores")
        }

        setProfessores(data || [])
        setLoading(false)
      } catch (error: any) {
        console.error("Erro ao buscar professores:", error)
        setError(error.message || "Erro ao buscar professores")
        setLoading(false)
      }
    }

    fetchProfessores()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p>Erro: {error}</p>
      </div>
    )
  }

  if (professores.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
        <p>Nenhum professor encontrado.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {professores.map((professor) => (
        <Link href={`/escola/professores/${professor.id}`} key={professor.id}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16 border-2 border-purple-100">
                  <AvatarImage src={professor.profiles?.avatar_url || ""} alt={professor.profiles?.full_name || ""} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{professor.profiles?.full_name || "Nome não disponível"}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{professor.profiles?.email || "Email não disponível"}</span>
                  </div>
                </div>
              </div>

              {professor.vinculos && professor.vinculos.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Turmas e Disciplinas</h4>
                  <div className="space-y-2">
                    {professor.vinculos.map((vinculo) => (
                      <div key={vinculo.id} className="bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-purple-600 mr-2" />
                          <span className="text-sm font-medium">
                            {vinculo.turma?.name || "Turma não disponível"}
                            {vinculo.turma?.curso?.name && ` - ${vinculo.turma.curso.name}`}
                          </span>
                        </div>
                        {vinculo.disciplina && (
                          <Badge variant="outline" className="mt-1 bg-purple-50">
                            {vinculo.disciplina.name}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Nenhuma turma vinculada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

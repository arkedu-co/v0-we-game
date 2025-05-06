"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, BookOpen, GraduationCap, Pencil, Plus, Trash2, Users } from "lucide-react"

type Professor = {
  id: string
  user_id: string
  profile: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url: string | null
  } | null
  specialties: string | null
  education: string | null
}

type Vinculo = {
  id: string
  teacher_id: string
  class_id: string
  subject_id: string
  turma: {
    id: string
    name: string
    year: number
    course: {
      id: string
      name: string
    } | null
  } | null
  disciplina: {
    id: string
    name: string
  } | null
}

type ProfessorDetalhesProps = {
  id: string
  schoolId: string
}

export function ProfessorDetalhes({ id, schoolId }: ProfessorDetalhesProps) {
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingVinculoId, setRemovingVinculoId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vinculoToDelete, setVinculoToDelete] = useState<Vinculo | null>(null)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchProfessorData() {
      try {
        setLoading(true)

        // Buscar dados do professor
        const { data: professorData, error: professorError } = await supabase
          .from("teachers")
          .select(`
        id,
        school_id,
        education,
        subjects,
        profile:profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
          .eq("id", id)
          .single()

        if (professorError) {
          console.error("Erro ao buscar professor:", professorError)
          throw new Error("Erro ao buscar dados do professor")
        }

        if (!professorData) {
          throw new Error("Professor não encontrado")
        }

        // Adaptar os dados para o formato esperado pelo componente
        const adaptedProfessor: Professor = {
          id: professorData.id,
          user_id: professorData.id, // Usando o mesmo ID como user_id
          profile: professorData.profile
            ? {
                id: professorData.profile.id,
                first_name: professorData.profile.full_name.split(" ")[0] || "",
                last_name: professorData.profile.full_name.split(" ").slice(1).join(" ") || "",
                email: professorData.profile.email,
                avatar_url: professorData.profile.avatar_url,
              }
            : null,
          specialties: Array.isArray(professorData.subjects) ? professorData.subjects.join(", ") : null,
          education: professorData.education,
        }

        setProfessor(adaptedProfessor)

        // Buscar vínculos do professor
        const { data: vinculosData, error: vinculosError } = await supabase
          .from("teacher_class_subjects")
          .select(`
        id,
        teacher_id,
        class_id,
        subject_id,
        turma:classes(
          id,
          name,
          year,
          course:courses(
            id,
            name
          )
        ),
        disciplina:subjects(
          id,
          name
        )
      `)
          .eq("teacher_id", id)

        if (vinculosError) {
          console.error("Erro ao buscar vínculos:", vinculosError)
          throw new Error("Erro ao buscar vínculos do professor")
        }

        setVinculos(vinculosData as Vinculo[])
        setLoading(false)
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao carregar os dados do professor")
        setLoading(false)
      }
    }

    if (id) {
      fetchProfessorData()
    }
  }, [id, supabase])

  const handleRemoveVinculo = async () => {
    if (!vinculoToDelete) return

    try {
      setRemovingVinculoId(vinculoToDelete.id)

      const { error } = await supabase.from("teacher_class_subjects").delete().eq("id", vinculoToDelete.id)

      if (error) {
        throw new Error("Erro ao remover vínculo")
      }

      // Atualizar a lista de vínculos
      setVinculos(vinculos.filter((v) => v.id !== vinculoToDelete.id))
      setDialogOpen(false)
      setVinculoToDelete(null)
    } catch (err) {
      console.error("Erro ao remover vínculo:", err)
      setError("Ocorreu um erro ao remover o vínculo")
    } finally {
      setRemovingVinculoId(null)
    }
  }

  const confirmDeleteVinculo = (vinculo: Vinculo) => {
    setVinculoToDelete(vinculo)
    setDialogOpen(true)
  }

  // Agrupar vínculos por turma
  const vinculosPorTurma = vinculos.reduce(
    (acc, vinculo) => {
      if (!vinculo.turma) return acc

      const turmaId = vinculo.turma.id
      if (!acc[turmaId]) {
        acc[turmaId] = {
          turma: vinculo.turma,
          disciplinas: [],
        }
      }

      if (vinculo.disciplina) {
        acc[turmaId].disciplinas.push({
          id: vinculo.id,
          disciplina: vinculo.disciplina,
        })
      }

      return acc
    },
    {} as Record<
      string,
      { turma: Vinculo["turma"]; disciplinas: { id: string; disciplina: NonNullable<Vinculo["disciplina"]> }[] }
    >,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do professor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex">
          <div className="py-1">
            <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
          </div>
          <div>
            <p className="font-bold">Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!professor) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <p className="font-bold">Professor não encontrado</p>
        <p className="text-sm">Não foi possível encontrar os dados deste professor.</p>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Informações do Professor</CardTitle>
            <Link href={`/escola/professores/${id}/editar`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Editar Professor
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 text-2xl">
                {professor.profile?.avatar_url ? (
                  <img
                    src={professor.profile.avatar_url || "/placeholder.svg"}
                    alt={`${professor.profile.first_name} ${professor.profile.last_name}`}
                  />
                ) : (
                  <div className="bg-primary text-white h-full w-full flex items-center justify-center">
                    {professor.profile ? getInitials(professor.profile.first_name, professor.profile.last_name) : "P"}
                  </div>
                )}
              </Avatar>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-semibold">
                  {professor.profile
                    ? `${professor.profile.first_name} ${professor.profile.last_name}`
                    : "Nome não disponível"}
                </h3>
                <p className="text-gray-500">{professor.profile?.email || "Email não disponível"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Formação</h4>
                  <p>{professor.education || "Não informado"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Especialidades</h4>
                  <p>{professor.specialties || "Não informado"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="turmas">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="turmas">
              <Users className="h-4 w-4 mr-2" />
              Turmas
            </TabsTrigger>
            <TabsTrigger value="disciplinas">
              <BookOpen className="h-4 w-4 mr-2" />
              Disciplinas
            </TabsTrigger>
          </TabsList>

          <Link href={`/escola/vinculos/novo?professor_id=${id}&school_id=${schoolId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Vínculo
            </Button>
          </Link>
        </div>

        <TabsContent value="turmas" className="space-y-4">
          {Object.keys(vinculosPorTurma).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma turma vinculada</h3>
              <p className="mt-1 text-sm text-gray-500">Este professor ainda não está vinculado a nenhuma turma.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(vinculosPorTurma).map(({ turma, disciplinas }) => (
                <Card key={turma?.id} className="overflow-hidden">
                  <div className="bg-primary h-2"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{turma?.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {turma?.course?.name} - {turma?.year}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-sm font-medium mb-2">Disciplinas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {disciplinas.map(({ id, disciplina }) => (
                        <div key={id} className="flex items-center">
                          <Badge variant="secondary" className="mr-1">
                            {disciplina.name}
                          </Badge>
                          <button
                            onClick={() => confirmDeleteVinculo(vinculos.find((v) => v.id === id)!)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                            aria-label={`Remover vínculo com ${disciplina.name}`}
                            disabled={removingVinculoId === id}
                          >
                            {removingVinculoId === id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="disciplinas" className="space-y-4">
          {vinculos.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma disciplina vinculada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Este professor ainda não está vinculado a nenhuma disciplina.
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vinculos.map(
                    (vinculo) =>
                      vinculo.disciplina && (
                        <div key={vinculo.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{vinculo.disciplina.name}</h3>
                              <p className="text-sm text-gray-500">
                                {vinculo.turma?.name} - {vinculo.turma?.course?.name}
                              </p>
                            </div>
                            <button
                              onClick={() => confirmDeleteVinculo(vinculo)}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                              aria-label={`Remover vínculo com ${vinculo.disciplina.name}`}
                              disabled={removingVinculoId === vinculo.id}
                            >
                              {removingVinculoId === vinculo.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o vínculo do professor com a disciplina{" "}
              <span className="font-semibold">{vinculoToDelete?.disciplina?.name}</span> na turma{" "}
              <span className="font-semibold">{vinculoToDelete?.turma?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveVinculo} disabled={removingVinculoId !== null}>
              {removingVinculoId ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

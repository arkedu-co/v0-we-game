"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Plus, Trash2, BookOpen, Users, School } from "lucide-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ProfessorDashboardProps {
  professorId: string
}

interface Professor {
  id: string
  education?: string
  subjects?: string[]
  profile?: {
    full_name: string
    email: string
    avatar_url?: string
    user_type: string
  }
}

interface Vinculo {
  id: string
  class: {
    id: string
    name: string
    year: number
    course?: {
      id: string
      name: string
    }
  }
  subject: {
    id: string
    name: string
  }
}

export function ProfessorDashboard({ professorId }: ProfessorDashboardProps) {
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingVinculo, setDeletingVinculo] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Buscar dados do professor
        const { data: professorData, error: professorError } = await supabase
          .from("teachers")
          .select(`
            *,
            profile:profiles!inner (
              full_name,
              email,
              avatar_url,
              user_type
            )
          `)
          .eq("id", professorId)
          .single()

        if (professorError) {
          throw new Error(`Erro ao buscar professor: ${professorError.message}`)
        }

        if (!professorData) {
          throw new Error("Professor não encontrado")
        }

        setProfessor({
          id: professorData.id,
          education: professorData.education,
          subjects: professorData.subjects,
          profile: {
            full_name: professorData.profile.full_name,
            email: professorData.profile.email,
            avatar_url: professorData.profile.avatar_url,
            user_type: professorData.profile.user_type,
          },
        })

        // Buscar vínculos do professor
        const { data: vinculosData, error: vinculosError } = await supabase
          .from("teacher_class_subjects")
          .select(`
            id,
            class:classes!inner (
              id,
              name,
              year,
              course:courses (
                id,
                name
              )
            ),
            subject:subjects!inner (
              id,
              name
            )
          `)
          .eq("teacher_id", professorId)

        if (vinculosError) {
          throw new Error(`Erro ao buscar vínculos: ${vinculosError.message}`)
        }

        setVinculos(vinculosData || [])
      } catch (err: any) {
        console.error("Erro:", err)
        setError(err.message || "Ocorreu um erro ao carregar os dados do professor")
      } finally {
        setLoading(false)
      }
    }

    fetchProfessor()
  }, [professorId])

  const handleRemoveVinculo = async (vinculoId: string) => {
    if (!confirm("Tem certeza que deseja remover este vínculo?")) {
      return
    }

    try {
      setDeletingVinculo(vinculoId)
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("teacher_class_subjects").delete().eq("id", vinculoId)

      if (error) {
        throw new Error(`Erro ao remover vínculo: ${error.message}`)
      }

      setVinculos(vinculos.filter((v) => v.id !== vinculoId))
      toast.success("Vínculo removido com sucesso")
    } catch (err: any) {
      console.error("Erro:", err)
      toast.error(err.message || "Ocorreu um erro ao remover o vínculo")
    } finally {
      setDeletingVinculo(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando dados do professor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!professor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Professor não encontrado</h2>
          <p className="text-amber-600 mb-4">Não foi possível encontrar o professor solicitado.</p>
          <Button variant="outline" onClick={() => router.push("/escola/professores")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de professores
          </Button>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/escola/professores")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Link href={`/escola/professores/${professorId}/editar`} passHref>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Professor
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de informações do professor */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações do Professor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              {professor.profile?.avatar_url ? (
                <AvatarImage
                  src={professor.profile.avatar_url || "/placeholder.svg"}
                  alt={professor.profile?.full_name || "Professor"}
                />
              ) : (
                <AvatarFallback>{getInitials(professor.profile?.full_name || "Professor")}</AvatarFallback>
              )}
            </Avatar>
            <h2 className="text-2xl font-bold">{professor.profile?.full_name}</h2>
            <p className="text-muted-foreground mb-2">{professor.profile?.email}</p>
            {professor.education && (
              <Badge variant="outline" className="mb-2">
                {professor.education}
              </Badge>
            )}
            {professor.subjects && professor.subjects.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Especialidades:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {professor.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard principal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Dashboard do Professor</CardTitle>
              <Link href={`/escola/vinculos/novo?professor=${professorId}`} passHref>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Vínculo
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="turmas">
              <TabsList className="mb-4">
                <TabsTrigger value="turmas">
                  <Users className="h-4 w-4 mr-2" />
                  Turmas
                </TabsTrigger>
                <TabsTrigger value="disciplinas">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Disciplinas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="turmas">
                {vinculos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <School className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Este professor não está vinculado a nenhuma turma.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`/escola/vinculos/novo?professor=${professorId}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Vínculo
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vinculos.map((vinculo) => (
                      <Card key={vinculo.id} className="overflow-hidden">
                        <div className="flex justify-between items-center p-4">
                          <div>
                            <h3 className="font-medium">
                              {vinculo.class.name} ({vinculo.class.year})
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {vinculo.class.course?.name || "Curso não especificado"}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {vinculo.subject.name}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveVinculo(vinculo.id)}
                            disabled={deletingVinculo === vinculo.id}
                          >
                            {deletingVinculo === vinculo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="disciplinas">
                {vinculos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Este professor não está vinculado a nenhuma disciplina.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`/escola/vinculos/novo?professor=${professorId}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Vínculo
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(vinculos.map((v) => v.subject.id))).map((subjectId) => {
                      const subject = vinculos.find((v) => v.subject.id === subjectId)?.subject
                      const classesWithSubject = vinculos.filter((v) => v.subject.id === subjectId).map((v) => v.class)

                      return (
                        <Card key={subjectId} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{subject?.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-sm font-medium mb-2">Turmas:</h4>
                            <div className="space-y-1">
                              {classesWithSubject.map((cls) => (
                                <div key={cls.id} className="flex items-center justify-between">
                                  <span>
                                    {cls.name} ({cls.year})
                                  </span>
                                  <Badge variant="outline" size="sm">
                                    {cls.course?.name || "Sem curso"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

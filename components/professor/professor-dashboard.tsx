"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Calendar, Clock, Award, ChevronRight } from "lucide-react"
import type { Database } from "@/lib/database.types"

interface Teacher {
  id: string
  name: string
  email: string
  school_id?: string
}

interface TeacherClass {
  id: string
  name: string
  course_name: string
  discipline_name: string
  students_count: number
}

export function ProfessorDashboard({ userId }: { userId: string }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    classesCount: 0,
    disciplinesCount: 0,
    studentsCount: 0,
    nextClassDate: "Hoje, 14:00",
  })

  // Usar createClientComponentClient diretamente
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function loadTeacherData() {
      try {
        console.log("[ProfessorDashboard] Carregando dados do professor:", userId)
        setLoading(true)
        setError(null)

        // Buscar dados do professor
        const { data: teacherData, error: teacherError } = await supabase
          .from("teachers")
          .select("*")
          .eq("id", userId)
          .single()

        if (teacherError) {
          console.log("[ProfessorDashboard] Erro ao buscar professor pelo ID:", teacherError.message)

          // Tentar buscar pelo email do usuário
          const { data: userData } = await supabase.auth.getUser()

          if (userData?.user?.email) {
            console.log("[ProfessorDashboard] Tentando buscar professor pelo email:", userData.user.email)

            const { data: teacherByEmail, error: emailError } = await supabase
              .from("teachers")
              .select("*")
              .eq("email", userData.user.email)
              .single()

            if (!emailError && teacherByEmail) {
              console.log("[ProfessorDashboard] Professor encontrado pelo email")
              setTeacher(teacherByEmail)
            } else {
              console.error("[ProfessorDashboard] Erro ao buscar professor pelo email:", emailError?.message)

              // Criar um professor básico com os dados disponíveis
              console.log("[ProfessorDashboard] Criando objeto de professor básico")
              setTeacher({
                id: userId,
                name: userData.user.user_metadata?.full_name || "Professor",
                email: userData.user.email,
              })
            }
          } else {
            console.error("[ProfessorDashboard] Não foi possível obter o email do usuário")
            setError("Não foi possível carregar os dados do professor.")
          }
        } else {
          console.log("[ProfessorDashboard] Professor encontrado pelo ID")
          setTeacher(teacherData)
        }

        // Buscar turmas do professor (simulado por enquanto)
        console.log("[ProfessorDashboard] Configurando dados de turmas simulados")
        setClasses([
          {
            id: "1",
            name: "Turma A",
            course_name: "Ensino Médio",
            discipline_name: "Matemática",
            students_count: 28,
          },
          {
            id: "2",
            name: "Turma B",
            course_name: "Ensino Médio",
            discipline_name: "Física",
            students_count: 25,
          },
          {
            id: "3",
            name: "Turma C",
            course_name: "Ensino Fundamental",
            discipline_name: "Matemática",
            students_count: 30,
          },
        ])

        // Calcular estatísticas
        console.log("[ProfessorDashboard] Configurando estatísticas")
        setStats({
          classesCount: 3,
          disciplinesCount: 2,
          studentsCount: 83,
          nextClassDate: "Hoje, 14:00",
        })
      } catch (err: any) {
        console.error("[ProfessorDashboard] Erro não tratado:", err)
        setError("Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
        console.log("[ProfessorDashboard] Carregamento concluído")
      }
    }

    loadTeacherData()
  }, [supabase, userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo(a), {teacher?.name || "Professor(a)"}</h1>
        <p className="text-muted-foreground">Gerencie suas turmas e acompanhe o desempenho dos alunos.</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turmas</p>
                <h3 className="text-2xl font-bold">{stats.classesCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disciplinas</p>
                <h3 className="text-2xl font-bold">{stats.disciplinesCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alunos</p>
                <h3 className="text-2xl font-bold">{stats.studentsCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próxima aula</p>
                <h3 className="text-lg font-bold">{stats.nextClassDate}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      <Tabs defaultValue="turmas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="turmas">Minhas Turmas</TabsTrigger>
          <TabsTrigger value="atividades">Atividades Recentes</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="turmas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <CardHeader className="bg-primary/5 pb-2">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <CardDescription>{cls.course_name}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disciplina:</span>
                      <span className="text-sm">{cls.discipline_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Alunos:</span>
                      <span className="text-sm">{cls.students_count}</span>
                    </div>
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-xs">
                        <span>Desempenho</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver detalhes
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button>
              Ver todas as turmas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="atividades">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Suas últimas atividades no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 border-b pb-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Notas lançadas</p>
                    <p className="text-sm text-muted-foreground">Você lançou notas para a Turma A</p>
                    <p className="text-xs text-muted-foreground mt-1">Hoje, 10:45</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-b pb-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Aula registrada</p>
                    <p className="text-sm text-muted-foreground">Aula de Matemática para a Turma C</p>
                    <p className="text-xs text-muted-foreground mt-1">Ontem, 14:30</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Frequência registrada</p>
                    <p className="text-sm text-muted-foreground">Você registrou a frequência da Turma B</p>
                    <p className="text-xs text-muted-foreground mt-1">Ontem, 09:15</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Aulas</CardTitle>
              <CardDescription>Suas próximas aulas e compromissos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Matemática - Turma A</p>
                      <p className="text-sm text-muted-foreground">Sala 101</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Hoje</p>
                    <p className="text-sm text-muted-foreground">14:00 - 15:30</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Física - Turma B</p>
                      <p className="text-sm text-muted-foreground">Laboratório 2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Amanhã</p>
                    <p className="text-sm text-muted-foreground">08:00 - 09:30</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Matemática - Turma C</p>
                      <p className="text-sm text-muted-foreground">Sala 203</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Amanhã</p>
                    <p className="text-sm text-muted-foreground">10:00 - 11:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

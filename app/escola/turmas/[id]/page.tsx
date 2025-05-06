"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TurmaForm } from "@/components/escola/turmas/turma-form"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users, ArrowLeft, UserPlus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MatriculaAlunos } from "@/components/escola/turmas/matricula-alunos"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function EditarTurmaPage({ params }: { params: { id: string } }) {
  const [turma, setTurma] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentCount, setStudentCount] = useState(0)
  const [alunos, setAlunos] = useState<any[]>([])
  const [showMatriculaForm, setShowMatriculaForm] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Verificar se estamos na página de nova turma
  const isNewTurma = params.id === "nova"

  // Função para buscar alunos da turma do lado do cliente
  const fetchAlunosTurma = async (turmaId: string) => {
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          enrollment_date,
          student:student_id (
            id,
            code,
            birth_date,
            profile:profiles!students_id_fkey (
              full_name
            )
          )
        `)
        .eq("class_id", turmaId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao listar alunos da turma:", error)
      return []
    }
  }

  // Função para contar alunos da turma do lado do cliente
  const countAlunosTurmaClient = async (turmaId: string) => {
    try {
      const { count, error } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("class_id", turmaId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error("Erro ao contar alunos da turma:", error)
      return 0
    }
  }

  // Função para buscar detalhes da turma do lado do cliente
  const fetchTurmaDetails = async (turmaId: string) => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          course:course_id (
            name
          )
        `)
        .eq("id", turmaId)
        .single()

      if (error) throw error

      // Buscar informações do professor em uma consulta separada
      let teacherName = null

      if (data.teacher_id) {
        try {
          const { data: teacherData, error: teacherError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.teacher_id)
            .single()

          if (!teacherError && teacherData) {
            teacherName = teacherData.full_name
          }
        } catch (err) {
          console.error(`Erro ao buscar professor ${data.teacher_id}:`, err)
        }
      }

      if (data) {
        const formattedData = {
          ...data,
          teacher_name: teacherName,
          course_name: data.course?.name || null,
        }

        return formattedData
      }

      return null
    } catch (error) {
      console.error("Erro ao buscar turma:", error)
      throw error
    }
  }

  const fetchTurma = async () => {
    // Se for a página de nova turma, não precisamos buscar dados
    if (isNewTurma) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Usar a função do lado do cliente para buscar detalhes da turma
      const data = await fetchTurmaDetails(params.id)
      setTurma(data)

      // Buscar contagem de alunos usando a função do lado do cliente
      try {
        const count = await countAlunosTurmaClient(params.id)
        setStudentCount(count)
      } catch (error) {
        console.error("Erro ao contar alunos:", error)
      }

      // Buscar alunos da turma usando a função do lado do cliente
      try {
        const alunosData = await fetchAlunosTurma(params.id)
        setAlunos(alunosData)
      } catch (error) {
        console.error("Erro ao listar alunos da turma:", error)
      }
    } catch (error: any) {
      console.error("Erro ao buscar turma:", error)
      setError(error.message || "Erro ao carregar dados da turma")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurma()
  }, [params.id, isNewTurma])

  const handleMatriculaSuccess = () => {
    setShowMatriculaForm(false)
    fetchTurma()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  // Renderização para a página de nova turma
  if (isNewTurma) {
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Turma</h1>
              <p className="text-gray-600">Preencha os dados abaixo para cadastrar uma nova turma.</p>
            </div>
            <Button variant="outline" onClick={() => router.back()} className="h-10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
          <TurmaForm redirectToList={true} />
        </div>
      </DashboardLayout>
    )
  }

  // Renderização para a página de edição de turma existente
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {loading
                ? "Carregando..."
                : turma
                  ? `${turma.course_name || ""} - ${turma.name}`
                  : "Turma não encontrada"}
            </h1>
            <p className="text-gray-600">Gerencie os dados da turma e seus alunos.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/escola/turmas")} className="h-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Turmas
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        ) : turma ? (
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-white shadow-md p-1 rounded-lg">
              <TabsTrigger
                value="details"
                className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
              >
                Detalhes da Turma
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
              >
                Alunos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <TurmaForm turma={turma} isEditing={true} onSuccess={fetchTurma} />
            </TabsContent>
            <TabsContent value="students" className="mt-6">
              {showMatriculaForm ? (
                <MatriculaAlunos
                  turmaId={params.id}
                  onSuccess={handleMatriculaSuccess}
                  onCancel={() => setShowMatriculaForm(false)}
                />
              ) : (
                <Card>
                  <CardHeader className="bg-primary/5 rounded-t-lg border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Alunos da Turma
                    </CardTitle>
                    <Button variant="gradient" onClick={() => setShowMatriculaForm(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Matricular Alunos
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {alunos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="text-4xl font-bold text-gradient">0</div>
                        <p className="text-center text-gray-600">Esta turma ainda não possui alunos matriculados.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary/5 hover:bg-primary/5">
                              <TableHead className="font-medium text-gray-900">Nome</TableHead>
                              <TableHead className="font-medium text-gray-900">Código</TableHead>
                              <TableHead className="font-medium text-gray-900">Data de Nascimento</TableHead>
                              <TableHead className="font-medium text-gray-900">Data de Matrícula</TableHead>
                              <TableHead className="w-[100px] font-medium text-gray-900">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alunos.map((matricula) => (
                              <TableRow key={matricula.id} className="hover:bg-primary/5">
                                <TableCell className="font-medium text-gray-900">
                                  {matricula.student.profile.full_name}
                                </TableCell>
                                <TableCell>{matricula.student.code}</TableCell>
                                <TableCell>{formatDate(matricula.student.birth_date)}</TableCell>
                                <TableCell>{formatDate(matricula.enrollment_date)}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/escola/alunos/${matricula.student.id}`)}
                                  >
                                    Ver Detalhes
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">Turma não encontrada</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}

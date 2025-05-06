"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserCheck, BookOpen, Calendar, Award, CheckCircle2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TurmaDashboardProps {
  turma: any
}

export function TurmaDashboard({ turma }: TurmaDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [alunosData, setAlunosData] = useState<any>({
    count: 0,
    list: [],
    genderDistribution: [],
    attendanceRate: 0,
  })
  const [professoresData, setProfessoresData] = useState<any>({
    count: 0,
    list: [],
    subjectDistribution: [],
  })
  const [activityData, setActivityData] = useState<any>({
    attendanceByMonth: [],
    gradesDistribution: [],
    lastActivities: [],
  })
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchAlunosData(), fetchProfessoresData(), fetchActivityData()])
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [turma.id])

  const fetchAlunosData = async () => {
    try {
      // Buscar matrículas da turma
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          enrollment_date,
          student:student_id (
            id,
            birth_date,
            profile:profiles!students_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq("class_id", turma.id)

      if (enrollmentsError) throw enrollmentsError

      // Como não temos a coluna gender, vamos usar uma distribuição simulada
      const genderDistribution = [
        { name: "Masculino", value: Math.floor(enrollments?.length * 0.55) || 0 },
        { name: "Feminino", value: Math.floor(enrollments?.length * 0.45) || 0 },
        { name: "Outro", value: 0 },
      ]

      // Buscar dados de presença para calcular taxa de frequência
      const { data: attendance, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("class_id", turma.id)

      if (attendanceError) throw attendanceError

      // Calcular taxa de presença (simplificado)
      const totalAttendanceRecords = attendance?.length || 0
      const presentCount = attendance?.filter((record) => record.status === "present")?.length || 0
      const attendanceRate = totalAttendanceRecords > 0 ? Math.round((presentCount / totalAttendanceRecords) * 100) : 0

      setAlunosData({
        count: enrollments?.length || 0,
        list: enrollments || [],
        genderDistribution,
        attendanceRate,
      })
    } catch (error) {
      console.error("Erro ao buscar dados dos alunos:", error)
    }
  }

  const fetchProfessoresData = async () => {
    try {
      // Buscar professores vinculados à turma
      const { data: vinculos, error: vinculosError } = await supabase
        .from("teacher_class_subjects")
        .select(`
          teachers:teacher_id (
            id,
            profiles!teachers_id_fkey (
              full_name,
              email
            )
          ),
          subjects:subject_id (
            id,
            name
          )
        `)
        .eq("class_id", turma.id)

      if (vinculosError) throw vinculosError

      // Calcular distribuição por disciplina
      const subjectCount: Record<string, number> = {}

      vinculos?.forEach((vinculo) => {
        const subjectName = vinculo.subjects?.name || "Sem disciplina"
        subjectCount[subjectName] = (subjectCount[subjectName] || 0) + 1
      })

      const subjectDistribution = Object.entries(subjectCount).map(([name, value]) => ({
        name,
        value,
      }))

      setProfessoresData({
        count: vinculos?.length || 0,
        list: vinculos || [],
        subjectDistribution,
      })
    } catch (error) {
      console.error("Erro ao buscar dados dos professores:", error)
    }
  }

  const fetchActivityData = async () => {
    try {
      // Dados de presença por mês (simulados para demonstração)
      const attendanceByMonth = [
        { month: "Jan", presença: 92 },
        { month: "Fev", presença: 88 },
        { month: "Mar", presença: 95 },
        { month: "Abr", presença: 90 },
        { month: "Mai", presença: 86 },
        { month: "Jun", presença: 82 },
        { month: "Jul", presença: 0 },
        { month: "Ago", presença: 91 },
        { month: "Set", presença: 89 },
        { month: "Out", presença: 94 },
        { month: "Nov", presença: 93 },
        { month: "Dez", presença: 85 },
      ]

      // Distribuição de notas (simulada para demonstração)
      const gradesDistribution = [
        { range: "0-2", count: 2 },
        { range: "3-5", count: 5 },
        { range: "6-7", count: 8 },
        { range: "8-9", count: 12 },
        { range: "10", count: 3 },
      ]

      // Últimas atividades (simuladas para demonstração)
      const lastActivities = [
        {
          id: 1,
          type: "attendance",
          description: "Registro de presença",
          date: new Date(2023, 10, 15),
          subject: "Matemática",
        },
        {
          id: 2,
          type: "grade",
          description: "Lançamento de notas",
          date: new Date(2023, 10, 12),
          subject: "Português",
        },
        {
          id: 3,
          type: "event",
          description: "Prova bimestral",
          date: new Date(2023, 10, 10),
          subject: "Ciências",
        },
        {
          id: 4,
          type: "attendance",
          description: "Registro de presença",
          date: new Date(2023, 10, 8),
          subject: "História",
        },
        {
          id: 5,
          type: "grade",
          description: "Lançamento de notas",
          date: new Date(2023, 10, 5),
          subject: "Geografia",
        },
      ]

      setActivityData({
        attendanceByMonth,
        gradesDistribution,
        lastActivities,
      })
    } catch (error) {
      console.error("Erro ao buscar dados de atividades:", error)
    }
  }

  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return String(dateString)
    }
  }

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alunos Matriculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              <div className="text-3xl font-bold">{alunosData.count}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Professores Vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-amber-600 mr-3" />
              <div className="text-3xl font-bold">{professoresData.count}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Presença</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-600 mr-3" />
              <div className="text-3xl font-bold">{alunosData.attendanceRate}%</div>
            </div>
            <Progress value={alunosData.attendanceRate} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ano Letivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div className="text-3xl font-bold">{turma.year}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white shadow-md p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
          >
            Alunos
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
          >
            Professores
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
          >
            Atividades
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de presença por mês */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Presença por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    presença: {
                      label: "Taxa de Presença (%)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData.attendanceByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="presença"
                        stroke="var(--color-presença)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Distribuição de notas */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Distribuição de Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Quantidade de Alunos",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData.gradesDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="count" fill="var(--color-count)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Distribuição por gênero */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Gênero</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full max-w-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={alunosData.genderDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {alunosData.genderDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por disciplina */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Professores por Disciplina</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full max-w-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={professoresData.subjectDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {professoresData.subjectDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Últimas atividades */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Últimas Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="font-medium text-gray-900">Tipo</TableHead>
                      <TableHead className="font-medium text-gray-900">Descrição</TableHead>
                      <TableHead className="font-medium text-gray-900">Disciplina</TableHead>
                      <TableHead className="font-medium text-gray-900">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.lastActivities.map((activity: any) => (
                      <TableRow key={activity.id} className="hover:bg-primary/5">
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                activity.type === "attendance"
                                  ? "bg-green-50 text-green-600"
                                  : activity.type === "grade"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-600"
                              }
                            `}
                          >
                            {activity.type === "attendance" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : activity.type === "grade" ? (
                              <Award className="h-3 w-3 mr-1" />
                            ) : (
                              <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {activity.type === "attendance"
                              ? "Presença"
                              : activity.type === "grade"
                                ? "Nota"
                                : "Evento"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.description}</TableCell>
                        <TableCell>{activity.subject}</TableCell>
                        <TableCell>{formatDate(activity.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alunos */}
        <TabsContent value="students" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Alunos Matriculados</CardTitle>
            </CardHeader>
            <CardContent>
              {alunosData.list.length === 0 ? (
                <div className="py-12 text-center text-gray-600">Nenhum aluno matriculado nesta turma.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5 hover:bg-primary/5">
                        <TableHead className="font-medium text-gray-900">Nome</TableHead>
                        <TableHead className="font-medium text-gray-900">Email</TableHead>
                        <TableHead className="font-medium text-gray-900">Data de Nascimento</TableHead>
                        <TableHead className="font-medium text-gray-900">Data de Matrícula</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alunosData.list.map((matricula: any) => (
                        <TableRow key={matricula.id} className="hover:bg-primary/5">
                          <TableCell className="font-medium text-gray-900">
                            {matricula.student?.profile?.full_name || "Nome não disponível"}
                          </TableCell>
                          <TableCell>{matricula.student?.profile?.email || "-"}</TableCell>
                          <TableCell>
                            {matricula.student?.birth_date ? formatDate(matricula.student.birth_date) : "-"}
                          </TableCell>
                          <TableCell>{formatDate(matricula.enrollment_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professores */}
        <TabsContent value="teachers" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Professores Vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              {professoresData.list.length === 0 ? (
                <div className="py-12 text-center text-gray-600">Nenhum professor vinculado a esta turma.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5 hover:bg-primary/5">
                        <TableHead className="font-medium text-gray-900">Professor</TableHead>
                        <TableHead className="font-medium text-gray-900">Email</TableHead>
                        <TableHead className="font-medium text-gray-900">Disciplina</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {professoresData.list.map((vinculo: any, index: number) => (
                        <TableRow key={index} className="hover:bg-primary/5">
                          <TableCell className="font-medium text-gray-900">
                            {vinculo.teachers?.profiles?.full_name || "Nome não disponível"}
                          </TableCell>
                          <TableCell>{vinculo.teachers?.profiles?.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/5 text-primary">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {vinculo.subjects?.name || "Disciplina não disponível"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atividades */}
        <TabsContent value="activities" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Registro de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="font-medium text-gray-900">Tipo</TableHead>
                      <TableHead className="font-medium text-gray-900">Descrição</TableHead>
                      <TableHead className="font-medium text-gray-900">Disciplina</TableHead>
                      <TableHead className="font-medium text-gray-900">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.lastActivities.map((activity: any) => (
                      <TableRow key={activity.id} className="hover:bg-primary/5">
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                activity.type === "attendance"
                                  ? "bg-green-50 text-green-600"
                                  : activity.type === "grade"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-600"
                              }
                            `}
                          >
                            {activity.type === "attendance" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : activity.type === "grade" ? (
                              <Award className="h-3 w-3 mr-1" />
                            ) : (
                              <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {activity.type === "attendance"
                              ? "Presença"
                              : activity.type === "grade"
                                ? "Nota"
                                : "Evento"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.description}</TableCell>
                        <TableCell>{activity.subject}</TableCell>
                        <TableCell>{formatDate(activity.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

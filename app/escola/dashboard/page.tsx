"use client"

import { AvatarFallback } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import {
  DashboardTabs,
  DashboardTabsList,
  DashboardTabsTrigger,
  DashboardTabsContent,
} from "@/components/ui/dashboard-tabs"
import { getSupabaseClient } from "@/lib/supabase/client"
import {
  Users,
  GraduationCap,
  UserCheck,
  CalendarDays,
  Award,
  Clock,
  ChevronRight,
  Plus,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EscolaDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalTurmas: 0,
    totalCursos: 0,
    totalProfessores: 0,
    totalAtitudes: 0,
    atitudesPositivas: 0,
    atitudesNegativas: 0,
    mediaXpAlunos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentStudents, setRecentStudents] = useState<any[]>([])
  const [recentClasses, setRecentClasses] = useState<any[]>([])
  const [topStudents, setTopStudents] = useState<any[]>([])
  const [recentAtitudes, setRecentAtitudes] = useState<any[]>([])
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Verificar autenticação primeiro
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao verificar sessão:", error)
          setError("Erro ao verificar autenticação. Por favor, faça login novamente.")
          setLoading(false)
          return
        }

        if (!data.session) {
          console.log("Sessão não encontrada, redirecionando para login")
          router.push("/escola/login?redirectTo=/escola/dashboard")
          return
        }

        setAuthChecked(true)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setError("Ocorreu um erro ao verificar sua autenticação. Por favor, tente novamente.")
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Carregar dados apenas após verificar autenticação
  useEffect(() => {
    if (!authChecked) return

    // First, get the current user's school ID
    const getCurrentUser = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setError("Erro ao obter sessão. Por favor, faça login novamente.")
          setLoading(false)
          return null
        }

        if (!session?.user?.id) {
          console.log("No active session found")
          setError("Sessão não encontrada. Por favor, faça login novamente.")
          setLoading(false)
          return null
        }

        // Check if the user is a school
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", session.user.id)
            .single()

          if (profileError) {
            console.error("Error getting profile:", profileError)
            setError("Erro ao obter perfil. Por favor, tente novamente.")
            setLoading(false)
            return null
          }

          if (profileData?.user_type === "escola") {
            console.log("User is a school with ID:", session.user.id)

            // Tentar obter o ID da escola pela tabela schools
            const { data: schoolData, error: schoolError } = await supabase
              .from("schools")
              .select("id")
              .or(`director_id.eq.${session.user.id},owner_id.eq.${session.user.id}`)
              .single()

            if (!schoolError && schoolData) {
              console.log("Found school ID:", schoolData.id)
              setSchoolId(schoolData.id)
              return schoolData.id
            } else {
              console.log("Using user ID as school ID:", session.user.id)
              setSchoolId(session.user.id)
              return session.user.id
            }
          } else {
            console.log("User is not a school:", profileData?.user_type)
            setError(
              `Você não tem permissão para acessar esta página. Seu tipo de usuário é: ${profileData?.user_type}`,
            )
            setLoading(false)
            return null
          }
        } catch (profileError) {
          console.error("Error processing profile:", profileError)
          setError("Erro ao processar perfil. Por favor, tente novamente.")
          setLoading(false)
          return null
        }
      } catch (error) {
        console.error("Error getting current user:", error)
        setError("Erro ao obter usuário atual. Por favor, tente novamente.")
        setLoading(false)
        return null
      }
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const currentSchoolId = await getCurrentUser()
        if (!currentSchoolId) {
          console.error("No school ID found")
          return
        }

        const supabase = getSupabaseClient()

        try {
          // Fetch counts using the correct table names
          const [
            { count: alunosCount, error: alunosError },
            { count: turmasCount, error: turmasError },
            { count: cursosCount, error: cursosError },
            { count: professoresCount, error: professoresError },
            { count: atitudesCount, error: atitudesError },
          ] = await Promise.all([
            supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", currentSchoolId),
            supabase.from("classes").select("id", { count: "exact", head: true }).eq("school_id", currentSchoolId),
            supabase.from("courses").select("id", { count: "exact", head: true }).eq("school_id", currentSchoolId),
            supabase.from("teachers").select("id", { count: "exact", head: true }).eq("school_id", currentSchoolId),
            supabase
              .from("applied_attitudes")
              .select("id", { count: "exact", head: true })
              .eq("school_id", currentSchoolId),
          ])

          // Fetch positive and negative attitudes counts
          // First, get all attitudes to check their types
          const { data: attitudes, error: attitudesListError } = await supabase
            .from("attitudes")
            .select("id, type")
            .eq("school_id", currentSchoolId)

          if (attitudesListError) {
            console.error("Error fetching attitudes list:", attitudesListError)
          }

          // Group attitude IDs by type
          const positiveAttitudeIds = attitudes?.filter((a) => a.type === "positive").map((a) => a.id) || []
          const negativeAttitudeIds = attitudes?.filter((a) => a.type === "negative").map((a) => a.id) || []

          // Count applied attitudes by type
          let atitudesPositivasCount = 0
          let atitudesNegativasCount = 0

          if (positiveAttitudeIds.length > 0) {
            const { count: positiveCount, error: positiveError } = await supabase
              .from("applied_attitudes")
              .select("id", { count: "exact", head: true })
              .eq("school_id", currentSchoolId)
              .in("attitude_id", positiveAttitudeIds)

            if (positiveError) {
              console.error("Error counting positive attitudes:", positiveError)
            } else {
              atitudesPositivasCount = positiveCount || 0
            }
          }

          if (negativeAttitudeIds.length > 0) {
            const { count: negativeCount, error: negativeError } = await supabase
              .from("applied_attitudes")
              .select("id", { count: "exact", head: true })
              .eq("school_id", currentSchoolId)
              .in("attitude_id", negativeAttitudeIds)

            if (negativeError) {
              console.error("Error counting negative attitudes:", negativeError)
            } else {
              atitudesNegativasCount = negativeCount || 0
            }
          }

          if (alunosError || turmasError || cursosError || professoresError || atitudesError) {
            console.error("Error fetching counts:", {
              alunosError,
              turmasError,
              cursosError,
              professoresError,
              atitudesError,
            })
          }

          // Fetch recent students
          const { data: recentStudentsData, error: recentStudentsError } = await supabase
            .from("students")
            .select(`
              id,
              code,
              registration_number,
              profile:profiles!students_id_fkey (
                full_name,
                avatar_url
              ),
              xp_total:student_xp(xp_amount)
            `)
            .eq("school_id", currentSchoolId)
            .order("created_at", { ascending: false })
            .limit(5)

          if (recentStudentsError) {
            console.error("Error fetching recent students:", recentStudentsError)
          }

          // Format student data
          const formattedStudents =
            recentStudentsData?.map((student) => ({
              id: student.id,
              nome: student.profile?.full_name || "Sem nome",
              matricula: student.registration_number || student.code,
              avatar_url: student.profile?.avatar_url,
              xp_total: student.xp_total?.[0]?.xp_amount || 0,
            })) || []

          // Fetch recent classes
          const { data: recentClassesData, error: recentClassesError } = await supabase
            .from("classes")
            .select(`
              id,
              name,
              year,
              course:courses(id, name)
            `)
            .eq("school_id", currentSchoolId)
            .order("created_at", { ascending: false })
            .limit(5)

          if (recentClassesError) {
            console.error("Error fetching recent classes:", recentClassesError)
          }

          // Format class data
          const formattedClasses =
            recentClassesData?.map((turma) => ({
              id: turma.id,
              nome: turma.name,
              ano: turma.year,
              cursos: {
                nome: turma.course?.name,
              },
            })) || []

          // Fetch top students by XP
          const { data: topStudentsData, error: topStudentsError } = await supabase
            .from("student_xp")
            .select(`
              student_id,
              xp_amount,
              student:student_id(
                id,
                profile:profiles!students_id_fkey(
                  full_name,
                  avatar_url
                )
              )
            `)
            .eq("school_id", currentSchoolId)
            .order("xp_amount", { ascending: false })
            .limit(5)

          if (topStudentsError) {
            console.error("Error fetching top students:", topStudentsError)
          }

          // Format top students data
          const formattedTopStudents =
            topStudentsData?.map((item) => ({
              id: item.student_id,
              nome: item.student?.profile?.full_name || "Sem nome",
              avatar_url: item.student?.profile?.avatar_url,
              xp_total: item.xp_amount,
            })) || []

          // Fetch recent attitudes with all columns to determine the correct XP column name
          const { data: recentAppliedAttitudes, error: recentAttitudesError } = await supabase
            .from("applied_attitudes")
            .select("*")
            .eq("school_id", currentSchoolId)
            .order("created_at", { ascending: false })
            .limit(5)

          if (recentAttitudesError) {
            console.error("Error fetching recent applied attitudes:", recentAttitudesError)
          }

          // Get attitude details for the applied attitudes
          let formattedAtitudes: any[] = []

          if (recentAppliedAttitudes && recentAppliedAttitudes.length > 0) {
            // Determine the XP value column name by inspecting the first record
            // Common possibilities: xp_value, xp, value, points, reward_value
            const xpColumnNames = ["xp_value", "xp", "value", "points", "reward_value"]
            let xpColumnName = null

            const firstRecord = recentAppliedAttitudes[0]
            for (const column of xpColumnNames) {
              if (column in firstRecord) {
                xpColumnName = column
                break
              }
            }

            console.log("Applied attitude record structure:", Object.keys(firstRecord))
            console.log("Using XP column name:", xpColumnName)

            // Get all attitude IDs from applied attitudes
            const attitudeIds = recentAppliedAttitudes.map((item) => item.attitude_id)
            const studentIds = recentAppliedAttitudes.map((item) => item.student_id)

            // Fetch attitude details
            const { data: attitudeDetails, error: attitudeDetailsError } = await supabase
              .from("attitudes")
              .select("id, name, type")
              .in("id", attitudeIds)

            if (attitudeDetailsError) {
              console.error("Error fetching attitude details:", attitudeDetailsError)
            }

            // Fetch student details
            const { data: studentDetails, error: studentDetailsError } = await supabase
              .from("students")
              .select(`
                id,
                profile:profiles!students_id_fkey(
                  full_name,
                  avatar_url
                )
              `)
              .in("id", studentIds)

            if (studentDetailsError) {
              console.error("Error fetching student details:", studentDetailsError)
            }

            // Create a map for quick lookups
            const attitudeMap = new Map()
            attitudeDetails?.forEach((att) => attitudeMap.set(att.id, att))

            const studentMap = new Map()
            studentDetails?.forEach((student) => studentMap.set(student.id, student))

            // Format the applied attitudes with their details
            formattedAtitudes = recentAppliedAttitudes.map((item) => {
              const attitude = attitudeMap.get(item.attitude_id)
              const student = studentMap.get(item.student_id)

              // Get XP value using the determined column name or fallback to 0
              let xpValue = 0
              if (xpColumnName && xpColumnName in item) {
                xpValue = item[xpColumnName]
              }

              return {
                id: item.id,
                data: item.created_at,
                tipo: attitude?.type === "positive" ? "positiva" : "negativa",
                valor_xp: xpValue,
                atitudes: {
                  nome: attitude?.name || "Atitude desconhecida",
                },
                alunos: {
                  id: item.student_id,
                  nome: student?.profile?.full_name || "Aluno desconhecido",
                  avatar_url: student?.profile?.avatar_url,
                },
              }
            })
          }

          // Calculate average XP
          const { data: xpData, error: xpError } = await supabase
            .from("student_xp")
            .select("xp_amount")
            .eq("school_id", currentSchoolId)

          if (xpError) {
            console.error("Error fetching XP data:", xpError)
          }

          const totalXp = xpData?.reduce((sum, student) => sum + (student.xp_amount || 0), 0) || 0
          const mediaXp = xpData?.length ? Math.round(totalXp / xpData.length) : 0

          setStats({
            totalAlunos: alunosCount || 0,
            totalTurmas: turmasCount || 0,
            totalCursos: cursosCount || 0,
            totalProfessores: professoresCount || 0,
            totalAtitudes: atitudesCount || 0,
            atitudesPositivas: atitudesPositivasCount || 0,
            atitudesNegativas: atitudesNegativasCount || 0,
            mediaXpAlunos: mediaXp,
          })

          setRecentStudents(formattedStudents)
          setRecentClasses(formattedClasses)
          setTopStudents(formattedTopStudents)
          setRecentAtitudes(formattedAtitudes)
        } catch (dataError) {
          console.error("Error processing dashboard data:", dataError)
          setError("Erro ao processar dados do dashboard. Alguns dados podem estar incompletos.")
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setError("Erro ao carregar dados do dashboard. Por favor, tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, authChecked])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setAuthChecked(false)
    // Isso vai disparar o useEffect de verificação de autenticação novamente
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center mb-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 text-center">Erro ao carregar dashboard</h2>
          </div>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleRetry} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Link href="/escola/login">
              <Button variant="outline">Fazer login novamente</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">Dashboard</h1>
            <p className="text-muted-foreground text-black">Bem-vindo ao painel de controle da sua escola.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button className="shadow-md" asChild>
              <Link href="/escola/turmas/nova">
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Link>
            </Button>
            <Button className="shadow-md" asChild>
              <Link href="/escola/alunos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Aluno
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Alunos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalAlunos}</div>
              <p className="text-xs text-muted-foreground text-black">{stats.mediaXpAlunos} XP em média por aluno</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/escola/alunos" className="text-xs text-primary flex items-center">
                Ver todos
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Turmas</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalTurmas}</div>
              <p className="text-xs text-muted-foreground text-black">{stats.totalCursos} cursos disponíveis</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/escola/turmas" className="text-xs text-primary flex items-center">
                Ver todas
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Professores</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalProfessores}</div>
              <p className="text-xs text-muted-foreground text-black">
                {Math.round((stats.totalProfessores / Math.max(stats.totalTurmas, 1)) * 10) / 10} professores por turma
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/escola/professores" className="text-xs text-primary flex items-center">
                Ver todos
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-black">Atitudes</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalAtitudes}</div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-black">{stats.atitudesPositivas}</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs text-black">{stats.atitudesNegativas}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/escola/atitudes" className="text-xs text-primary flex items-center">
                Ver todas
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Abas do Dashboard */}
        <DashboardTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DashboardTabsList className="w-full justify-start">
            <DashboardTabsTrigger value="overview">Visão Geral</DashboardTabsTrigger>
            <DashboardTabsTrigger value="students">Alunos</DashboardTabsTrigger>
            <DashboardTabsTrigger value="classes">Turmas</DashboardTabsTrigger>
            <DashboardTabsTrigger value="xp">XP & Atitudes</DashboardTabsTrigger>
          </DashboardTabsList>

          {/* Conteúdo das abas */}
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conteúdo da aba Visão Geral */}
              <DashboardTabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loading ? (
                        <p className="text-sm text-black">Carregando...</p>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm text-black">
                              {recentStudents.length} novos alunos recentemente
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm text-black">
                              {recentAtitudes.length} atitudes registradas recentemente
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm text-black">{stats.totalProfessores} professores ativos</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Distribuição de XP</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-black">
                          <span>Nível Iniciante (0-100 XP)</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-black">
                          <span>Nível Intermediário (101-500 XP)</span>
                          <span>35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-black">
                          <span>Nível Avançado (501+ XP)</span>
                          <span>20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Calendário Acadêmico</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-black">Conselho de Classe</p>
                          <p className="text-xs text-muted-foreground text-black">Em 5 dias</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-black">Reunião de Pais</p>
                          <p className="text-xs text-muted-foreground text-black">Em 2 semanas</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-black">Fim do Bimestre</p>
                          <p className="text-xs text-muted-foreground text-black">Em 3 semanas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DashboardTabsContent>

              {/* Conteúdo da aba Alunos */}
              <DashboardTabsContent value="students" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Alunos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentStudents.length > 0 ? (
                        <div className="space-y-4">
                          {recentStudents.map((student) => (
                            <div key={student.id} className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.avatar_url || "/placeholder.svg"} alt={student.nome} />
                                <AvatarFallback>{student.nome.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-black">{student.nome}</p>
                                <p className="text-xs text-muted-foreground text-black">
                                  Matrícula: {student.matricula}
                                </p>
                              </div>
                              <div className="ml-auto">
                                <p className="text-sm font-medium text-black">{student.xp_total} XP</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-black">Nenhum aluno recente encontrado.</p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Link href="/escola/alunos" className="text-xs text-primary flex items-center">
                        Ver todos os alunos
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </CardFooter>
                  </Card>

                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Top Alunos por XP</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topStudents.length > 0 ? (
                        <div className="space-y-4">
                          {topStudents.map((student) => (
                            <div key={student.id} className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.avatar_url || "/placeholder.svg"} alt={student.nome} />
                                <AvatarFallback>{student.nome.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-black">{student.nome}</p>
                              </div>
                              <div className="ml-auto">
                                <p className="text-sm font-medium text-black">{student.xp_total} XP</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-black">Nenhum aluno encontrado.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </DashboardTabsContent>

              {/* Conteúdo da aba Turmas */}
              <DashboardTabsContent value="classes" className="space-y-4">
                <Card className="shadow-card border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-black">Turmas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentClasses.length > 0 ? (
                      <div className="space-y-4">
                        {recentClasses.map((turma) => (
                          <div key={turma.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-black">{turma.nome}</p>
                              <p className="text-xs text-muted-foreground text-black">
                                {turma.cursos?.nome || "Sem curso"} - {turma.ano}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/escola/turmas/${turma.id}`}>Detalhes</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-black">Nenhuma turma recente encontrada.</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href="/escola/turmas" className="text-xs text-primary flex items-center">
                      Ver todas as turmas
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </CardFooter>
                </Card>
              </DashboardTabsContent>

              {/* Conteúdo da aba XP & Atitudes */}
              <DashboardTabsContent value="xp" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Atitudes Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentAtitudes.length > 0 ? (
                        <div className="space-y-4">
                          {recentAtitudes.map((atitude) => (
                            <div key={atitude.id} className="flex items-center space-x-3">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  atitude.tipo === "positiva" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <div>
                                <p className="text-sm font-medium text-black">{atitude.atitudes.nome}</p>
                                <p className="text-xs text-muted-foreground text-black">
                                  {atitude.alunos.nome} • {new Date(atitude.data).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="ml-auto">
                                <p
                                  className={`text-sm font-medium ${
                                    atitude.tipo === "positiva" ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {atitude.tipo === "positiva" ? "+" : "-"}
                                  {atitude.valor_xp} XP
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-black">Nenhuma atitude recente encontrada.</p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Link href="/escola/atitudes" className="text-xs text-primary flex items-center">
                        Ver todas as atitudes
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </CardFooter>
                  </Card>

                  <Card className="shadow-card border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-black">Resumo de XP</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-black">
                          <span>XP Total Distribuído</span>
                          <span>{stats.totalAlunos * stats.mediaXpAlunos}</span>
                        </div>
                        <div className="flex justify-between text-sm text-black">
                          <span>Média por Aluno</span>
                          <span>{stats.mediaXpAlunos}</span>
                        </div>
                        <div className="flex justify-between text-sm text-black">
                          <span>Atitudes Positivas</span>
                          <span className="text-green-600">{stats.atitudesPositivas}</span>
                        </div>
                        <div className="flex justify-between text-sm text-black">
                          <span>Atitudes Negativas</span>
                          <span className="text-red-600">{stats.atitudesNegativas}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DashboardTabsContent>
            </>
          )}
        </DashboardTabs>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { professorSidebarContent } from "@/components/professor/sidebar-content"
import { SidebarIcons } from "@/components/professor/sidebar-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Award,
  Search,
  Plus,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Users,
  Filter,
  X,
  MessageSquare,
  User,
  School,
  Star,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Atitude {
  id: string
  data: string
  dataCompleta: Date
  aluno: string
  aluno_id: string
  turma: string
  turma_id: string
  atitude: string
  tipo: string
  pontos: number
  observacoes?: string
}

interface Turma {
  id: string
  name: string
}

export default function ProfessorAtitudesPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [atitudes, setAtitudes] = useState<Atitude[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<string>("todas")
  const [periodoFiltro, setPeriodoFiltro] = useState("todos")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAtitude, setSelectedAtitude] = useState<Atitude | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadProfessorData() {
      try {
        const supabase = getSupabaseClient()

        // Verificar se há uma sessão
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          console.log("Sem sessão, redirecionando para login")
          router.push("/professor/login")
          return
        }

        const userId = sessionData.session.user.id

        // Buscar dados do perfil do professor
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError)
          throw new Error("Erro ao buscar dados do perfil")
        }

        setProfessorData(profileData)

        // Buscar turmas do professor
        const { data: vinculos, error: vinculosError } = await supabase
          .from("teacher_class_subjects")
          .select("class_id")
          .eq("teacher_id", userId)

        let turmaIds: string[] = []

        if (vinculosError) {
          console.error("Erro ao buscar vínculos:", vinculosError)

          // Buscar todas as turmas como fallback
          const { data: turmasData, error: turmasError } = await supabase
            .from("classes")
            .select("id, name")
            .order("name")
            .limit(10)

          if (!turmasError && turmasData) {
            setTurmas(turmasData)
            turmaIds = turmasData.map((t) => t.id)
          }
        } else {
          // Extrair IDs únicos de turmas
          turmaIds = [...new Set(vinculos?.map((v) => v.class_id) || [])]

          if (turmaIds.length > 0) {
            const { data: turmasData, error: turmasError } = await supabase
              .from("classes")
              .select("id, name")
              .in("id", turmaIds)
              .order("name")

            if (!turmasError && turmasData) {
              setTurmas(turmasData)
            }
          }
        }

        // Buscar atitudes aplicadas pelo professor
        try {
          // Primeiro, buscar as atitudes aplicadas sem tentar fazer join com class_id
          const { data: atitudesData, error: atitudesError } = await supabase
            .from("applied_attitudes")
            .select(`
              id,
              created_at,
              notes,
              student_id,
              attitude_id,
              applied_by
            `)
            .eq("applied_by", userId)
            .order("created_at", { ascending: false })

          if (atitudesError) {
            console.error("Erro ao buscar atitudes:", atitudesError)
            throw new Error("Erro ao buscar atitudes aplicadas")
          }

          // Agora, buscar informações adicionais para cada atitude
          const atitudesFormatadas = await Promise.all(
            atitudesData.map(async (atitude) => {
              // Buscar dados do aluno
              const { data: studentData, error: studentError } = await supabase
                .from("students")
                .select(`
                  id,
                  class,
                  profiles!students_id_fkey (
                    full_name
                  )
                `)
                .eq("id", atitude.student_id)
                .single()

              if (studentError) {
                console.error("Erro ao buscar dados do aluno:", studentError)
              }

              // Buscar dados da atitude
              const { data: attitudeData, error: attitudeError } = await supabase
                .from("attitudes")
                .select("*")
                .eq("id", atitude.attitude_id)
                .single()

              if (attitudeError) {
                console.error("Erro ao buscar dados da atitude:", attitudeError)
              }

              // Buscar dados da turma
              let turmaName = "Turma não identificada"
              let turmaId = ""

              if (studentData && studentData.class) {
                const { data: classData, error: classError } = await supabase
                  .from("classes")
                  .select("id, name")
                  .eq("id", studentData.class)
                  .single()

                if (!classError && classData) {
                  turmaName = classData.name
                  turmaId = classData.id
                }
              }

              return {
                id: atitude.id,
                data: new Date(atitude.created_at).toLocaleDateString(),
                dataCompleta: new Date(atitude.created_at),
                aluno: studentData?.profiles?.full_name || "Aluno não identificado",
                aluno_id: atitude.student_id,
                turma: turmaName,
                turma_id: turmaId,
                atitude: attitudeData?.name || "Atitude não identificada",
                tipo: attitudeData?.type || "N/A",
                pontos: attitudeData?.reward_value || 0,
                observacoes: atitude.notes || undefined,
              }
            }),
          )

          setAtitudes(atitudesFormatadas)
        } catch (error) {
          console.error("Erro ao buscar atitudes:", error)
          setAtitudes([])
        }
      } catch (error) {
        console.error("Erro ao carregar dados do professor:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfessorData()
  }, [router])

  // Filtrar atitudes com base nos filtros selecionados
  const filtrarAtitudes = () => {
    return atitudes.filter((atitude) => {
      // Filtro por turma
      const matchesTurma = turmaSelecionada === "todas" || atitude.turma_id === turmaSelecionada

      // Filtro por tipo de atitude
      const matchesTipo =
        tipoFiltro === "todas" ||
        (tipoFiltro === "positivas" && atitude.tipo === "positive") ||
        (tipoFiltro === "negativas" && atitude.tipo === "negative")

      // Filtro por termo de busca
      const matchesSearch =
        searchTerm === "" ||
        atitude.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atitude.atitude.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atitude.turma.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por período
      let matchesPeriodo = true
      const hoje = new Date()
      const dataAtitude = atitude.dataCompleta

      if (periodoFiltro === "hoje") {
        matchesPeriodo = dataAtitude.toDateString() === hoje.toDateString()
      } else if (periodoFiltro === "semana") {
        const umaSemanaAtras = new Date(hoje)
        umaSemanaAtras.setDate(hoje.getDate() - 7)
        matchesPeriodo = dataAtitude >= umaSemanaAtras
      } else if (periodoFiltro === "mes") {
        const umMesAtras = new Date(hoje)
        umMesAtras.setMonth(hoje.getMonth() - 1)
        matchesPeriodo = dataAtitude >= umMesAtras
      }

      return matchesTurma && matchesTipo && matchesSearch && matchesPeriodo
    })
  }

  const atitudesFiltradas = filtrarAtitudes()

  // Estatísticas
  const totalPositivas = atitudes.filter((a) => a.tipo === "positive").length
  const totalNegativas = atitudes.filter((a) => a.tipo === "negative").length
  const totalXP = atitudes.reduce((sum, a) => (a.tipo === "positive" ? sum + a.pontos : sum - a.pontos), 0)

  // Abrir modal com detalhes da atitude
  const handleOpenModal = (atitude: Atitude) => {
    setSelectedAtitude(atitude)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <DashboardLayout userType="professor" sidebarContent={professorSidebarContent} sidebarIcons={SidebarIcons}>
      <div className="space-y-6">
        {/* Cabeçalho da página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Atitudes</h1>
            <p className="text-muted-foreground">Gerencie e acompanhe as atitudes distribuídas aos alunos.</p>
          </div>
          <Button
            onClick={() => router.push("/professor/atitudes/distribuir")}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          >
            <Plus className="mr-2 h-4 w-4" /> Distribuir Atitudes
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Atitudes Positivas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-800">{totalPositivas}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Atitudes Negativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-2xl font-bold text-red-800">{totalNegativas}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Balanço de XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-purple-800">
                  {totalXP > 0 ? "+" : ""}
                  {totalXP}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por aluno, atitude ou turma..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className={showFilters ? "bg-gray-100" : ""}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
            {showFilters ? "Ocultar Filtros" : "Filtros"}
          </Button>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <Card className="p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Turma</label>
                <Select value={turmaSelecionada} onValueChange={setTurmaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as turmas</SelectItem>
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de Atitude</label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de atitude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="positivas">Positivas</SelectItem>
                    <SelectItem value="negativas">Negativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Período</label>
                <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todo período</SelectItem>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Última semana</SelectItem>
                    <SelectItem value="mes">Último mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Grid de atitudes */}
        {atitudesFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {atitudesFiltradas.map((atitude) => (
              <Card
                key={atitude.id}
                className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-200 ${
                  atitude.tipo === "positive"
                    ? "hover:border-green-300 hover:bg-green-50"
                    : "hover:border-red-300 hover:bg-red-50"
                }`}
                onClick={() => handleOpenModal(atitude)}
              >
                <div className={`h-2 w-full ${atitude.tipo === "positive" ? "bg-green-500" : "bg-red-500"}`}></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 truncate max-w-[70%]">{atitude.atitude}</h3>
                    <Badge variant={atitude.tipo === "positive" ? "success" : "destructive"} className="ml-2">
                      {atitude.tipo === "positive" ? "+" : "-"}
                      {atitude.pontos}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {atitude.aluno.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <div className="font-medium text-sm truncate">{atitude.aluno}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{atitude.turma}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{atitude.data}</span>
                    </div>
                    {atitude.observacoes && (
                      <div className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>Observações</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Award className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma atitude encontrada</h3>
              <p className="text-gray-500 text-center mb-4">
                Não foram encontradas atitudes com os filtros selecionados.
              </p>
              <Button
                onClick={() => router.push("/professor/atitudes/distribuir")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Distribuir Atitudes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de detalhes da atitude */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border border-gray-200">
          {selectedAtitude && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAtitude.tipo === "positive" ? (
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                  )}
                  {selectedAtitude.atitude}
                </DialogTitle>
                <DialogDescription>
                  Distribuída em {selectedAtitude.data} •{" "}
                  {selectedAtitude.tipo === "positive" ? "Positiva" : "Negativa"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Informações do aluno */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Aluno</h4>
                    <p className="text-gray-700">{selectedAtitude.aluno}</p>
                  </div>
                </div>

                {/* Informações da turma */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <School className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Turma</h4>
                    <p className="text-gray-700">{selectedAtitude.turma}</p>
                  </div>
                </div>

                {/* Pontuação */}
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Pontuação</h4>
                    <p className="text-gray-700">
                      {selectedAtitude.tipo === "positive" ? "+" : "-"}
                      {selectedAtitude.pontos} pontos
                    </p>
                  </div>
                </div>

                {/* Observações (se houver) */}
                {selectedAtitude.observacoes && (
                  <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Observações</h4>
                      <p className="text-gray-700">{selectedAtitude.observacoes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fechar
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setIsModalOpen(false)
                    router.push(`/professor/alunos/${selectedAtitude.aluno_id}`)
                  }}
                >
                  Ver Aluno
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

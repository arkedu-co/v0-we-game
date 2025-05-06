"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Award, Calendar, BarChart3, LogOut, Menu, User, Bell, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Aluno {
  id: string
  nome: string
  email: string
  matricula: string
  turma: string
  turma_id: string
}

interface Turma {
  id: string
  name: string
}

export default function ProfessorAlunosPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("todas")
  const [menuAberto, setMenuAberto] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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

        // Tentar buscar vínculos usando o nome correto da tabela: teacher_class_subjects
        console.log("Buscando vínculos do professor na tabela teacher_class_subjects...")
        const { data: vinculos, error: vinculosError } = await supabase
          .from("teacher_class_subjects")
          .select("class_id")
          .eq("teacher_id", userId)

        if (vinculosError) {
          console.error("Erro ao buscar vínculos na tabela teacher_class_subjects:", vinculosError)
          console.log("Tentando buscar turmas diretamente...")

          // Se não conseguir buscar vínculos, buscar todas as turmas
          const { data: turmasData, error: turmasError } = await supabase
            .from("classes")
            .select(`
              id, 
              name
            `)
            .order("name")
            .limit(10)

          if (turmasError) {
            console.error("Erro ao buscar turmas diretamente:", turmasError)
            setTurmas([])
          } else {
            console.log("Turmas encontradas diretamente:", turmasData)
            setTurmas(turmasData)

            // Buscar alunos de todas as turmas
            await buscarAlunosPorTurmas(turmasData.map((t) => t.id))
          }
        } else {
          console.log("Vínculos encontrados na tabela teacher_class_subjects:", vinculos)

          // Extrair IDs únicos de turmas dos vínculos
          const turmaIds = [...new Set(vinculos?.map((v) => v.class_id) || [])]

          if (turmaIds.length > 0) {
            // Buscar detalhes das turmas
            const { data: turmasData, error: turmasError } = await supabase
              .from("classes")
              .select(`
                id, 
                name
              `)
              .in("id", turmaIds)
              .order("name")

            if (turmasError) {
              console.error("Erro ao buscar turmas:", turmasError)
              throw new Error("Erro ao buscar turmas do professor")
            }

            console.log("Turmas encontradas:", turmasData)
            setTurmas(turmasData)

            // Buscar alunos de todas as turmas
            await buscarAlunosPorTurmas(turmaIds)
          } else {
            console.log("Nenhuma turma encontrada para o professor")
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do professor:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfessorData()
  }, [router])

  const buscarAlunosPorTurmas = async (turmaIds: string[]) => {
    try {
      if (turmaIds.length === 0) {
        setAlunos([])
        return
      }

      const supabase = getSupabaseClient()

      // Buscar matrículas das turmas
      const { data: matriculasData, error: matriculasError } = await supabase
        .from("enrollments")
        .select(`
          id,
          class_id,
          student:student_id (
            id,
            code,
            registration_number,
            profile:profiles!students_id_fkey (
              full_name,
              email
            )
          ),
          class:class_id (
            id,
            name
          )
        `)
        .in("class_id", turmaIds)

      if (matriculasError) {
        console.error("Erro ao buscar matrículas:", matriculasError)
        throw new Error("Erro ao buscar alunos das turmas")
      }

      // Formatar dados dos alunos
      const alunosFormatados = matriculasData.map((matricula) => ({
        id: matricula.student?.id || "",
        nome: matricula.student?.profile?.full_name || "Nome não disponível",
        email: matricula.student?.profile?.email || "Email não disponível",
        matricula: matricula.student?.registration_number || matricula.student?.code || "N/A",
        turma: matricula.class?.name || "Turma não disponível",
        turma_id: matricula.class_id || "",
      }))

      setAlunos(alunosFormatados)
    } catch (error) {
      console.error("Erro ao buscar alunos:", error)
      setAlunos([])
    }
  }

  const handleTurmaChange = (value: string) => {
    setTurmaSelecionada(value)
  }

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push("/professor/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Filtrar alunos com base na turma selecionada e termo de busca
  const alunosFiltrados = alunos.filter((aluno) => {
    const matchesTurma = turmaSelecionada === "todas" || aluno.turma_id === turmaSelecionada
    const matchesSearch =
      searchTerm === "" ||
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesTurma && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu Lateral com sombra espessa */}
      <div
        className={`fixed h-full bg-purple-800 text-white transition-all duration-300 shadow-[5px_0_15px_rgba(0,0,0,0.2)] z-10 ${
          menuAberto ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-purple-700">
          <h1 className={`font-bold ${menuAberto ? "block" : "hidden"}`}>Sistema Escolar</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-purple-700"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-purple-700 rounded-full p-2">
              <User className="h-6 w-6" />
            </div>
            {menuAberto && (
              <div>
                <p className="font-medium">{professorData?.full_name}</p>
                <p className="text-xs text-purple-300">Professor</p>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            <a href="/professor/dashboard" className="flex items-center space-x-3 p-2 rounded-md hover:bg-purple-700">
              <BarChart3 className="h-5 w-5" />
              {menuAberto && <span>Dashboard</span>}
            </a>
            <a href="/professor/turmas" className="flex items-center space-x-3 p-2 rounded-md hover:bg-purple-700">
              <Users className="h-5 w-5" />
              {menuAberto && <span>Turmas</span>}
            </a>
            <a href="/professor/alunos" className="flex items-center space-x-3 p-2 rounded-md bg-purple-700">
              <Users className="h-5 w-5" />
              {menuAberto && <span>Alunos</span>}
            </a>
            <a href="/professor/atitudes" className="flex items-center space-x-3 p-2 rounded-md hover:bg-purple-700">
              <Award className="h-5 w-5" />
              {menuAberto && <span>Atitudes</span>}
            </a>
            <a href="/professor/calendario" className="flex items-center space-x-3 p-2 rounded-md hover:bg-purple-700">
              <Calendar className="h-5 w-5" />
              {menuAberto && <span>Calendário</span>}
            </a>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-purple-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-purple-700"
          >
            <LogOut className="h-5 w-5" />
            {menuAberto && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className={`flex-1 transition-all duration-300 ${menuAberto ? "ml-64" : "ml-20"}`}>
        {/* Barra Superior */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Meus Alunos</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                {professorData?.full_name?.charAt(0) || "P"}
              </div>
              <span className="font-medium">{professorData?.full_name}</span>
            </div>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Alunos</h2>
            <p className="text-gray-500">Visualize todos os alunos das suas turmas</p>
          </div>

          <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Lista de Alunos</CardTitle>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar aluno..."
                      className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={turmaSelecionada} onValueChange={handleTurmaChange}>
                    <SelectTrigger className="w-full md:w-48">
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
              </div>
            </CardHeader>
            <CardContent>
              {alunos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">Nenhum aluno encontrado</p>
                </div>
              ) : alunosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">Nenhum aluno corresponde aos filtros selecionados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Turma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alunosFiltrados.map((aluno) => (
                        <TableRow key={`${aluno.id}-${aluno.turma_id}`}>
                          <TableCell className="font-medium">{aluno.nome}</TableCell>
                          <TableCell>{aluno.matricula}</TableCell>
                          <TableCell>{aluno.email}</TableCell>
                          <TableCell>{aluno.turma}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

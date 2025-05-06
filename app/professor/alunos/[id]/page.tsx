"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Award, Calendar, BarChart3, LogOut, Menu, User, Bell, ArrowLeft } from "lucide-react"
import { HistoricoAtitudesAluno } from "@/components/professor/atitudes/historico-atitudes-aluno"
import { ResumoAtitudesAluno } from "@/components/professor/atitudes/resumo-atitudes-aluno"
import { SaldoAluno } from "@/components/professor/alunos/saldo-aluno"
import { HistoricoTransacoes } from "@/components/professor/alunos/historico-transacoes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Adicionar importações para os novos componentes de XP
import { HistoricoXPAluno } from "@/components/professor/xp/historico-xp-aluno"
import { ResumoXPAluno } from "@/components/professor/xp/resumo-xp-aluno"

interface AlunoData {
  id: string
  nome: string
  email: string
  matricula: string
  dataNascimento: string
  turmas: { id: string; nome: string }[]
}

export default function DetalhesAlunoPage() {
  const params = useParams()
  const router = useRouter()
  const alunoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [aluno, setAluno] = useState<AlunoData | null>(null)
  const [menuAberto, setMenuAberto] = useState(true)

  useEffect(() => {
    async function loadData() {
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

        // Buscar dados do aluno
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select(`
            id,
            birth_date,
            registration_number,
            profile:profiles!students_id_fkey (
              full_name,
              email
            )
          `)
          .eq("id", alunoId)
          .single()

        if (studentError) {
          console.error("Erro ao buscar aluno:", studentError)
          throw new Error("Erro ao buscar dados do aluno")
        }

        // Buscar turmas do aluno
        const { data: turmasData, error: turmasError } = await supabase
          .from("enrollments")
          .select(`
            class:class_id (
              id,
              name
            )
          `)
          .eq("student_id", alunoId)

        if (turmasError) {
          console.error("Erro ao buscar turmas:", turmasError)
        }

        // Formatar dados do aluno
        setAluno({
          id: studentData.id,
          nome: studentData.profile?.full_name || "Nome não disponível",
          email: studentData.profile?.email || "Email não disponível",
          matricula: studentData.registration_number || "Matrícula não disponível",
          dataNascimento: studentData.birth_date
            ? new Date(studentData.birth_date).toLocaleDateString()
            : "Data não disponível",
          turmas:
            turmasData
              ?.filter((t) => t.class)
              .map((t) => ({
                id: t.class.id,
                nome: t.class.name,
              })) || [],
        })
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [alunoId, router])

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push("/professor/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

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
            <Button variant="ghost" size="icon" onClick={() => router.push("/professor/alunos")} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Detalhes do Aluno</h1>
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
            <h2 className="text-2xl font-bold mb-2">{aluno?.nome}</h2>
            <p className="text-gray-500">Matrícula: {aluno?.matricula}</p>
          </div>

          <Tabs defaultValue="informacoes" className="w-[100%]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="atitudes">Atitudes</TabsTrigger>
              <TabsTrigger value="xp">XP</TabsTrigger>
            </TabsList>
            <TabsContent value="informacoes">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Aluno</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome completo</p>
                        <p className="font-medium">{aluno?.nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{aluno?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data de nascimento</p>
                        <p className="font-medium">{aluno?.dataNascimento}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Turmas</p>
                        {aluno?.turmas && aluno.turmas.length > 0 ? (
                          <div className="mt-1 space-y-1">
                            {aluno.turmas.map((turma) => (
                              <div
                                key={turma.id}
                                className="bg-gray-100 text-gray-800 text-sm py-1 px-2 rounded-md inline-block mr-2"
                              >
                                {turma.nome}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Nenhuma turma encontrada</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="financeiro">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <SaldoAluno alunoId={alunoId} />
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HistoricoTransacoes alunoId={alunoId} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="atitudes">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <ResumoAtitudesAluno alunoId={alunoId} />
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Histórico de Atitudes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HistoricoAtitudesAluno alunoId={alunoId} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="xp" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResumoXPAluno alunoId={params.id} />
                <HistoricoXPAluno alunoId={params.id} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              onClick={() => router.push(`/professor/atitudes/distribuir?aluno=${alunoId}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Distribuir Atitude para este Aluno
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

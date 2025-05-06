"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Award, ClipboardList, Home, Bell, Settings, ArrowLeft, BookOpen, Mail, Hash } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Aluno {
  id: string
  nome: string
  email: string
  matricula: string
}

interface Turma {
  id: string
  name: string
  year: string | number
  disciplina: string
  alunos: Aluno[]
}

export default function ProfessorTurmaDetalhesPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [turma, setTurma] = useState<Turma | null>(null)
  const router = useRouter()
  const params = useParams()
  const turmaId = params.id as string

  useEffect(() => {
    async function loadTurmaData() {
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

        // Buscar dados da turma
        const { data: turmaData, error: turmaError } = await supabase
          .from("classes")
          .select(`
            id, 
            name,
            year
          `)
          .eq("id", turmaId)
          .single()

        if (turmaError) {
          console.error("Erro ao buscar turma:", turmaError)
          throw new Error("Erro ao buscar dados da turma")
        }

        // Buscar disciplina do professor nesta turma
        let disciplina = "N/A"
        try {
          const { data: vinculoData, error: vinculoError } = await supabase
            .from("teacher_class_subjects")
            .select(`
              subjects:subject_id (
                id,
                name
              )
            `)
            .eq("teacher_id", userId)
            .eq("class_id", turmaId)
            .single()

          if (!vinculoError && vinculoData) {
            disciplina = vinculoData.subjects?.name || "N/A"
          }
        } catch (error) {
          console.log("Erro ao buscar disciplina:", error)
        }

        // Buscar alunos matriculados na turma
        const { data: matriculasData, error: matriculasError } = await supabase
          .from("enrollments")
          .select(`
            id,
            student:student_id (
              id,
              code,
              registration_number,
              profile:profiles!students_id_fkey (
                full_name,
                email
              )
            )
          `)
          .eq("class_id", turmaId)

        if (matriculasError) {
          console.error("Erro ao buscar matrículas:", matriculasError)
          throw new Error("Erro ao buscar alunos da turma")
        }

        // Formatar dados dos alunos
        const alunos = matriculasData.map((matricula) => ({
          id: matricula.student?.id || "",
          nome: matricula.student?.profile?.full_name || "Nome não disponível",
          email: matricula.student?.profile?.email || "Email não disponível",
          matricula: matricula.student?.registration_number || matricula.student?.code || "N/A",
        }))

        // Montar objeto da turma
        setTurma({
          id: turmaData.id,
          name: turmaData.name,
          year: turmaData.year || "N/A",
          disciplina: disciplina,
          alunos: alunos,
        })
      } catch (error) {
        console.error("Erro ao carregar dados da turma:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTurmaData()
  }, [router, turmaId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header com avatar e saudação */}
      <header className="p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/professor/turmas")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-14 w-14 border-2 border-purple-100 shadow-md">
            <AvatarImage src={professorData?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-lg">
              {professorData?.full_name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-gray-500 text-sm">Olá,</p>
            <h1 className="text-xl font-bold text-gray-900">{professorData?.full_name || "Professor"}</h1>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 px-6 pb-24">
        {!turma ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Turma não encontrada</h3>
            <p className="text-gray-500 text-center mb-6">Não foi possível encontrar os dados desta turma.</p>
            <Button onClick={() => router.push("/professor/turmas")}>Voltar para Turmas</Button>
          </div>
        ) : (
          <>
            {/* Cabeçalho da turma */}
            <div className="mb-6">
              <Card className="overflow-hidden rounded-xl border-none shadow-[0_10px_30px_-15px_rgba(149,76,233,0.3)]">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">{turma.name}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{turma.alunos.length} alunos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Disciplina: {turma.disciplina}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs de conteúdo */}
            <Tabs defaultValue="alunos" className="w-full">
              <TabsList className="mb-4 bg-purple-50 p-1 rounded-lg">
                <TabsTrigger
                  value="alunos"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Alunos
                </TabsTrigger>
                <TabsTrigger
                  value="atividades"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Atividades
                </TabsTrigger>
                <TabsTrigger
                  value="atitudes"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Atitudes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="alunos">
                {turma.alunos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Users className="h-10 w-10 text-purple-500" />
                    </div>
                    <p className="text-gray-500">Nenhum aluno matriculado nesta turma</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {turma.alunos.map((aluno) => (
                      <Card
                        key={aluno.id}
                        className="overflow-hidden rounded-xl border-none shadow-[0_15px_30px_-10px_rgba(149,76,233,0.25)] hover:shadow-[0_20px_40px_-15px_rgba(149,76,233,0.35)] transition-all duration-300 cursor-pointer"
                        onClick={() => router.push(`/professor/alunos/${aluno.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <Avatar className="h-12 w-12 mr-4">
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                {aluno.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{aluno.nome}</h3>
                              <div className="flex flex-col mt-1 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Hash className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{aluno.matricula}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <Mail className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{aluno.email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="atividades">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <ClipboardList className="h-10 w-10 text-purple-500" />
                  </div>
                  <p className="text-gray-500 mb-6">Nenhuma atividade cadastrada para esta turma</p>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300">
                    Criar Nova Atividade
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="atitudes">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Award className="h-10 w-10 text-purple-500" />
                  </div>
                  <p className="text-gray-500 mb-6">Nenhuma atitude aplicada nesta turma</p>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300"
                    onClick={() => router.push("/professor/atitudes/distribuir")}
                  >
                    Distribuir Atitudes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Barra inferior flutuante com efeito de vidro */}
      <footer className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md">
        <div className="backdrop-blur-md bg-white/70 rounded-full flex justify-around items-center py-4 px-6 shadow-[0_10px_30px_-5px_rgba(149,76,233,0.3)]">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
            onClick={() => router.push("/professor/dashboard")}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-purple-600"
            onClick={() => router.push("/professor/turmas")}
          >
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => router.push("/professor/xp")}>
            <Award className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
            onClick={() => router.push("/professor/configuracoes")}
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </footer>

      <style jsx global>{`
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  )
}

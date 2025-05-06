"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Award, Home, Bell, Settings, ChevronRight, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Turma {
  id: string
  name: string
  year: string | number
  alunos_count: number
  disciplina: string
}

export default function ProfessorTurmasPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
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
          .select(`
            id,
            class_id,
            subjects:subject_id (
              id,
              name
            )
          `)
          .eq("teacher_id", userId)

        if (vinculosError) {
          console.error("Erro ao buscar vínculos na tabela teacher_class_subjects:", vinculosError)
          console.log("Tentando buscar turmas diretamente...")

          // Se não conseguir buscar vínculos, buscar todas as turmas
          const { data: turmasData, error: turmasError } = await supabase
            .from("classes")
            .select(`
              id, 
              name,
              year
            `)
            .order("name")
            .limit(10)

          if (turmasError) {
            console.error("Erro ao buscar turmas diretamente:", turmasError)
            setTurmas([])
          } else {
            console.log("Turmas encontradas diretamente:", turmasData)

            // Para cada turma, buscar quantidade de alunos
            const turmasComAlunos = await Promise.all(
              turmasData.map(async (turma) => {
                let alunosCount = 0
                try {
                  const { count, error } = await supabase
                    .from("enrollments")
                    .select("*", { count: "exact", head: true })
                    .eq("class_id", turma.id)

                  if (!error) {
                    alunosCount = count || 0
                  }
                } catch (error) {
                  console.log("Erro ao contar alunos para turma", turma.id, error)
                }

                return {
                  id: turma.id,
                  name: turma.name,
                  year: turma.year || "N/A",
                  alunos_count: alunosCount,
                  disciplina: "Todas",
                }
              }),
            )

            setTurmas(turmasComAlunos)
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
                name,
                year
              `)
              .in("id", turmaIds)
              .order("name")

            if (turmasError) {
              console.error("Erro ao buscar turmas:", turmasError)
              throw new Error("Erro ao buscar turmas do professor")
            }

            console.log("Turmas encontradas:", turmasData)

            // Para cada turma, buscar quantidade de alunos e associar com a disciplina
            const turmasComAlunos = await Promise.all(
              turmasData.map(async (turma) => {
                let alunosCount = 0
                try {
                  const { count, error } = await supabase
                    .from("enrollments")
                    .select("*", { count: "exact", head: true })
                    .eq("class_id", turma.id)

                  if (!error) {
                    alunosCount = count || 0
                  }
                } catch (error) {
                  console.log("Erro ao contar alunos para turma", turma.id, error)
                }

                // Encontrar a disciplina para esta turma
                const vinculo = vinculos.find((v) => v.class_id === turma.id)
                const disciplina = vinculo?.subjects?.name || "N/A"

                return {
                  id: turma.id,
                  name: turma.name,
                  year: turma.year || "N/A",
                  alunos_count: alunosCount,
                  disciplina: disciplina,
                }
              }),
            )

            setTurmas(turmasComAlunos)
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

  const filteredTurmas = turmas.filter(
    (turma) =>
      turma.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Minhas Turmas</h2>
          <p className="text-gray-500">Visualize e gerencie suas turmas</p>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar turmas..."
            className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de turmas */}
        {filteredTurmas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Nenhuma turma encontrada</h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm ? "Tente outro termo de busca" : "Você não possui turmas vinculadas no momento"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTurmas.map((turma) => (
              <Card
                key={turma.id}
                className="overflow-hidden rounded-xl border-none shadow-[0_10px_30px_-15px_rgba(149,76,233,0.3)] hover:shadow-[0_15px_35px_-15px_rgba(149,76,233,0.4)] transition-shadow cursor-pointer"
                onClick={() => router.push(`/professor/turmas/${turma.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex h-24">
                    {/* Lado esquerdo - Nome da turma com fundo em degradê */}
                    <div className="w-1/3 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-4 text-white">
                      <h3 className="text-xl font-bold text-center">{turma.name}</h3>
                    </div>

                    {/* Lado direito - Informações da turma */}
                    <div className="w-2/3 p-4 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-700">{turma.alunos_count} alunos</span>
                        </div>
                        <Badge variant="outline" className="bg-purple-50">
                          {turma.year}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">Disciplina: {turma.disciplina}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

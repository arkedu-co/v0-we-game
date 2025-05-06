"use client"

import { useEffect, useState, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Award,
  BookOpen,
  Users,
  Home,
  Bell,
  Search,
  ClipboardList,
  ShoppingBag,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

interface Turma {
  id: string
  name: string
  course_name?: string
  students_count?: number
  next_class?: string
}

interface Aluno {
  id: string
  full_name: string
  email?: string
  avatar_url?: string
  code?: string
}

export default function ProfessorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Aluno[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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
          .select("*")
          .eq("teacher_id", userId)

        if (vinculosError) {
          console.error("Erro ao buscar vínculos:", vinculosError)

          // Dados de exemplo para demonstração
          setTurmas([
            {
              id: "1",
              name: "9º Ano A",
              course_name: "Ensino Fundamental",
              students_count: 28,
              next_class: "Hoje, 14:00",
            },
            {
              id: "2",
              name: "7º Ano B",
              course_name: "Ensino Fundamental",
              students_count: 32,
              next_class: "Amanhã, 10:30",
            },
          ])
        } else {
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
              .limit(2)

            if (turmasError) {
              console.error("Erro ao buscar turmas:", turmasError)
              // Dados de exemplo para demonstração
              setTurmas([
                {
                  id: "1",
                  name: "9º Ano A",
                  course_name: "Ensino Fundamental",
                  students_count: 28,
                  next_class: "Hoje, 14:00",
                },
                {
                  id: "2",
                  name: "7º Ano B",
                  course_name: "Ensino Fundamental",
                  students_count: 32,
                  next_class: "Amanhã, 10:30",
                },
              ])
            } else {
              // Formatar dados das turmas
              const turmasFormatadas = turmasData.map((turma) => ({
                id: turma.id,
                name: turma.name,
                course_name: `${turma.year || ""}`,
                students_count: Math.floor(Math.random() * 30) + 20, // Exemplo
                next_class: Math.random() > 0.5 ? "Hoje, 14:00" : "Amanhã, 10:30", // Exemplo
              }))

              setTurmas(
                turmasFormatadas.length > 0
                  ? turmasFormatadas
                  : [
                      {
                        id: "1",
                        name: "9º Ano A",
                        course_name: "Ensino Fundamental",
                        students_count: 28,
                        next_class: "Hoje, 14:00",
                      },
                      {
                        id: "2",
                        name: "7º Ano B",
                        course_name: "Ensino Fundamental",
                        students_count: 32,
                        next_class: "Amanhã, 10:30",
                      },
                    ],
              )
            }
          } else {
            // Dados de exemplo para demonstração
            setTurmas([
              {
                id: "1",
                name: "9º Ano A",
                course_name: "Ensino Fundamental",
                students_count: 28,
                next_class: "Hoje, 14:00",
              },
              {
                id: "2",
                name: "7º Ano B",
                course_name: "Ensino Fundamental",
                students_count: 32,
                next_class: "Amanhã, 10:30",
              },
            ])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do professor:", error)
        // Dados de exemplo para demonstração
        setProfessorData({
          full_name: "Professor Exemplo",
        })
        setTurmas([
          {
            id: "1",
            name: "9º Ano A",
            course_name: "Ensino Fundamental",
            students_count: 28,
            next_class: "Hoje, 14:00",
          },
          {
            id: "2",
            name: "7º Ano B",
            course_name: "Ensino Fundamental",
            students_count: 32,
            next_class: "Amanhã, 10:30",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadProfessorData()
  }, [router])

  // Função para buscar alunos com base no termo de busca
  const searchAlunos = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const supabase = getSupabaseClient()

      // Buscar alunos que correspondem ao termo de busca
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          students!inner (
            code
          )
        `)
        .eq("user_type", "aluno")
        .ilike("full_name", `%${term}%`)
        .limit(5)

      if (error) {
        console.error("Erro ao buscar alunos:", error)
        return
      }

      // Formatar os resultados
      const formattedResults = data.map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        code: profile.students?.[0]?.code,
      }))

      setSearchResults(formattedResults)
    } catch (error) {
      console.error("Erro na busca:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Implementar debounce para a busca
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setOpen(value.length > 0)

    // Limpar timeout anterior se existir
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Definir novo timeout (300ms de debounce)
    searchTimeoutRef.current = setTimeout(() => {
      searchAlunos(value)
    }, 300)
  }

  // Navegar para a página do aluno quando selecionado
  const handleSelectAluno = (alunoId: string) => {
    setOpen(false)
    setSearchTerm("")
    router.push(`/professor/alunos/${alunoId}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header com avatar e saudação */}
      <header className="p-4 bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-purple-100">
            <AvatarImage src={professorData?.avatar_url || ""} />
            <AvatarFallback className="bg-purple-600 text-white text-sm">
              {professorData?.full_name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-purple-600">
              Olá 👋 {professorData?.full_name?.split(" ")[0] || "Professor"}!
            </p>
            <p className="text-xs text-gray-500">Complete seu planejamento hoje</p>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>

        {/* Barra de pesquisa com autocomplete */}
        <div className="mt-4 relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar aluno..."
                  className="pl-10 h-10 bg-gray-100 border-none rounded-xl text-sm pr-10"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[calc(100vw-2rem)] max-w-sm" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>Nenhum aluno encontrado</CommandEmpty>
                  <CommandGroup heading="Alunos">
                    {searchResults.map((aluno) => (
                      <CommandItem
                        key={aluno.id}
                        onSelect={() => handleSelectAluno(aluno.id)}
                        className="flex items-center gap-2 py-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={aluno.avatar_url || ""} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {aluno.full_name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{aluno.full_name}</span>
                          <span className="text-xs text-gray-500">
                            {aluno.code ? `Código: ${aluno.code}` : aluno.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 px-4 pb-20 overflow-auto">
        {/* Card principal */}
        <div className="mt-4">
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl border-none shadow-lg overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="font-medium">Próxima Aula</h3>
                  </div>
                  <p className="text-lg font-bold mb-1">9º Ano A - Matemática</p>
                  <p className="text-sm opacity-90">Hoje, 14:00 - Sala 12</p>

                  <div className="mt-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">28 alunos</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-black/20 hover:bg-black/30 text-white border-none rounded-full h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  className="bg-black/20 hover:bg-black/30 text-white border-none rounded-full"
                  onClick={() => router.push(`/professor/turmas/1`)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Módulos */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold">Módulos</h2>
            <Button variant="link" className="text-purple-600 text-xs p-0">
              Ver Todos
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div
              className="flex flex-col items-center justify-center p-3 bg-pink-100 rounded-xl cursor-pointer"
              onClick={() => router.push("/professor/turmas")}
            >
              <div className="h-10 w-10 rounded-full bg-pink-200 flex items-center justify-center mb-1">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <span className="text-xs font-medium text-center text-gray-700">Turmas</span>
            </div>

            <div
              className="flex flex-col items-center justify-center p-3 bg-orange-100 rounded-xl cursor-pointer"
              onClick={() => router.push("/professor/notas")}
            >
              <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center mb-1">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-center text-gray-700">Notas</span>
            </div>

            <div
              className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-xl cursor-pointer"
              onClick={() => router.push("/professor/atitudes")}
            >
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center mb-1">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-center text-gray-700">Atitudes</span>
            </div>

            <div
              className="flex flex-col items-center justify-center p-3 bg-cyan-100 rounded-xl cursor-pointer"
              onClick={() => router.push("/professor/xp")}
            >
              <div className="h-10 w-10 rounded-full bg-cyan-200 flex items-center justify-center mb-1">
                <ShoppingBag className="h-5 w-5 text-cyan-600" />
              </div>
              <span className="text-xs font-medium text-center text-gray-700">XP</span>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold">Ações Rápidas</h2>
            <Button variant="link" className="text-purple-600 text-xs p-0">
              Ver Todas
            </Button>
          </div>

          <div className="space-y-3">
            <div
              className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer"
              onClick={() => router.push("/professor/atitudes/distribuir")}
            >
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Distribuir Atitudes</p>
                <p className="text-xs text-gray-500">Semanal: Faltam 2 dias</p>
              </div>
              <div className="text-sm font-semibold text-green-600">+150 pts</div>
            </div>

            <div
              className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer"
              onClick={() => router.push("/professor/xp/distribuir")}
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Distribuir XP</p>
                <p className="text-xs text-gray-500">Semanal: Faltam 2 dias</p>
              </div>
              <div className="text-sm font-semibold text-green-600">+200 pts</div>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de navegação inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center justify-center h-14 w-14 text-purple-600"
          onClick={() => router.push("/professor/dashboard")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center justify-center h-14 w-14 text-gray-500"
          onClick={() => router.push("/professor/turmas")}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Turmas</span>
        </Button>

        {/* Botão de ação central */}
        <div className="relative -mt-5">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            onClick={() => router.push("/professor/atitudes/distribuir")}
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center justify-center h-14 w-14 text-gray-500"
          onClick={() => router.push("/professor/atitudes")}
        >
          <Award className="h-5 w-5" />
          <span className="text-xs mt-1">Atitudes</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center justify-center h-14 w-14 text-gray-500"
          onClick={() => router.push("/professor/xp")}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs mt-1">XP</span>
        </Button>
      </nav>
    </div>
  )
}

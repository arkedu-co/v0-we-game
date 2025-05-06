"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Aluno {
  id: string
  name: string
  selected: boolean
}

interface RegraXP {
  id: string
  name: string
  description: string
  xp_value: number
}

export default function DistribuirXPClientPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [turmas, setTurmas] = useState<any[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("")
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [regrasXP, setRegrasXP] = useState<RegraXP[]>([])
  const [regraXPSelecionada, setRegraXPSelecionada] = useState<string>("")
  const [menuAberto, setMenuAberto] = useState(true)
  const [distribuindo, setDistribuindo] = useState(false)
  const [todosAlunos, setTodosAlunos] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

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

        // Verificar se o usuário é um professor
        if (profileData.user_type !== "professor") {
          console.error("Usuário não é um professor")
          router.push("/professor/login")
          return
        }

        setProfessorData(profileData)

        // Buscar turmas do professor
        const { data: vinculos, error: vinculosError } = await supabase
          .from("teacher_class_subjects")
          .select("*")
          .eq("teacher_id", userId)

        if (vinculosError) {
          console.error("Erro ao buscar vínculos:", vinculosError)

          // Buscar todas as turmas como fallback
          const { data: turmasData } = await supabase.from("classes").select("id, name, year").order("name").limit(10)

          const turmasFormatadas =
            turmasData?.map((turma) => ({
              id: turma.id,
              name: `${turma.name} (${turma.year || "Sem ano"})`,
            })) || []

          setTurmas(turmasFormatadas)

          // Verificar se há uma turma na URL
          const turmaId = searchParams.get("turma")
          if (turmaId && turmasFormatadas.some((t) => t.id === turmaId)) {
            setTurmaSelecionada(turmaId)
            await carregarDadosTurma(turmaId)
          } else if (turmasFormatadas.length > 0) {
            setTurmaSelecionada(turmasFormatadas[0].id)
            await carregarDadosTurma(turmasFormatadas[0].id)
          }
        } else {
          // Extrair IDs únicos de turmas dos vínculos
          const turmaIds = [...new Set(vinculos?.map((v) => v.class_id) || [])]

          if (turmaIds.length > 0) {
            // Buscar detalhes das turmas
            const { data: turmasData } = await supabase
              .from("classes")
              .select("id, name, year")
              .in("id", turmaIds)
              .order("name")

            // Formatar dados das turmas
            const turmasFormatadas =
              turmasData?.map((turma) => ({
                id: turma.id,
                name: `${turma.name} (${turma.year || "Sem ano"})`,
              })) || []

            setTurmas(turmasFormatadas)

            // Verificar se há uma turma na URL
            const turmaId = searchParams.get("turma")
            if (turmaId && turmasFormatadas.some((t) => t.id === turmaId)) {
              setTurmaSelecionada(turmaId)
              await carregarDadosTurma(turmaId)
            } else if (turmasFormatadas.length > 0) {
              setTurmaSelecionada(turmasFormatadas[0].id)
              await carregarDadosTurma(turmasFormatadas[0].id)
            }
          }
        }

        // Buscar regras de XP
        const { data: regrasData, error: regrasError } = await supabase
          .from("xp_rules")
          .select("id, name, description, xp_value")
          .order("name")

        if (regrasError) {
          console.error("Erro ao buscar regras de XP:", regrasError)
        } else {
          setRegrasXP(regrasData || [])
          if (regrasData && regrasData.length > 0) {
            setRegraXPSelecionada(regrasData[0].id)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do professor:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfessorData()
  }, [router, searchParams])

  const carregarDadosTurma = async (turmaId: string) => {
    try {
      const supabase = getSupabaseClient()

      // Buscar alunos matriculados na turma usando join explícito em vez de relação implícita
      const { data: matriculasData, error: matriculasError } = await supabase
        .from("enrollments")
        .select(`
        id,
        student_id
      `)
        .eq("class_id", turmaId)

      if (matriculasError) {
        console.error("Erro ao buscar matrículas:", matriculasError)
        setAlunos([])
      } else {
        // Obter os IDs dos alunos
        const studentIds = matriculasData.map((matricula) => matricula.student_id)

        if (studentIds.length > 0) {
          // Buscar os perfis dos alunos em uma consulta separada
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", studentIds)
            .order("full_name")

          if (profilesError) {
            console.error("Erro ao buscar perfis dos alunos:", profilesError)
            setAlunos([])
          } else {
            // Formatar dados dos alunos
            const alunosFormatados = profilesData.map((profile) => ({
              id: profile.id,
              name: profile.full_name || "Aluno sem nome",
              selected: false,
            }))

            setAlunos(alunosFormatados)
          }
        } else {
          setAlunos([])
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da turma:", error)
    }
  }

  const handleTurmaChange = (value: string) => {
    setTurmaSelecionada(value)
    carregarDadosTurma(value)
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

  const handleAlunoToggle = (alunoId: string) => {
    setAlunos(
      alunos.map((aluno) => {
        if (aluno.id === alunoId) {
          return { ...aluno, selected: !aluno.selected }
        }
        return aluno
      }),
    )
  }

  const handleToggleTodosAlunos = () => {
    const novoEstado = !todosAlunos
    setTodosAlunos(novoEstado)
    setAlunos(alunos.map((aluno) => ({ ...aluno, selected: novoEstado })))
  }

  const handleDistribuirXP = async () => {
    try {
      if (!regraXPSelecionada) {
        alert("Selecione uma regra de XP")
        return
      }

      const alunosSelecionados = alunos.filter((aluno) => aluno.selected)
      if (alunosSelecionados.length === 0) {
        alert("Selecione pelo menos um aluno")
        return
      }

      setDistribuindo(true)

      const supabase = getSupabaseClient()
      const regraXP = regrasXP.find((regra) => regra.id === regraXPSelecionada)

      if (!regraXP) {
        throw new Error("Regra de XP não encontrada")
      }

      // Obter a sessão para identificar o professor
      const { data: sessionData } = await supabase.auth.getSession()
      const professorId = sessionData.session?.user.id

      if (!professorId) {
        throw new Error("Sessão do professor não encontrada")
      }

      // Criar registros de aplicação de XP para cada aluno selecionado
      const aplicacoes = alunosSelecionados.map((aluno) => ({
        student_id: aluno.id,
        teacher_id: professorId,
        class_id: turmaSelecionada,
        xp_rule_id: regraXPSelecionada,
        xp_value: regraXP.xp_value,
      }))

      const { error } = await supabase.from("xp_applications").insert(aplicacoes)

      if (error) {
        throw error
      }

      // Atualizar o XP total de cada aluno
      for (const aluno of alunosSelecionados) {
        // Buscar XP atual do aluno
        const { data: xpData, error: xpError } = await supabase
          .from("student_xp")
          .select("total_xp")
          .eq("student_id", aluno.id)
          .single()

        if (xpError) {
          // Se não existir registro, criar um novo
          if (xpError.code === "PGRST116") {
            await supabase.from("student_xp").insert({
              student_id: aluno.id,
              total_xp: regraXP.xp_value,
            })
          } else {
            console.error("Erro ao buscar XP do aluno:", xpError)
          }
        } else if (xpData) {
          // Atualizar XP existente
          await supabase
            .from("student_xp")
            .update({ total_xp: (xpData.total_xp || 0) + regraXP.xp_value })
            .eq("student_id", aluno.id)
        }
      }

      toast({
        title: "XP distribuído com sucesso!",
        description: `${regraXP.xp_value} XP distribuído para ${alunosSelecionados.length} aluno(s)`,
      })

      // Resetar seleção
      setAlunos(alunos.map((aluno) => ({ ...aluno, selected: false })))
      setTodosAlunos(false)
    } catch (error) {
      console.error("Erro ao distribuir XP:", error)
      alert("Erro ao distribuir XP. Tente novamente.")
    } finally {
      setDistribuindo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  // Obter nome da turma selecionada
  const turmaSelecionadaNome = turmas.find((t) => t.id === turmaSelecionada)?.name || "Nenhuma turma selecionada"
  const regraXPSelecionadaObj = regrasXP.find((r) => r.id === regraXPSelecionada)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Link href="/professor/xp">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Distribuir XP</h2>
          <p className="text-muted-foreground">Selecione uma regra de XP e os alunos que receberão</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selecione a Regra de XP</CardTitle>
            <CardDescription>Escolha qual regra de XP será aplicada aos alunos selecionados</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="participacao">
              <div className="flex items-center space-x-2 mb-4">
                <RadioGroupItem value="participacao" id="participacao" />
                <Label htmlFor="participacao" className="flex flex-col">
                  <span className="font-medium">Participação em Aula (+10 XP)</span>
                  <span className="text-sm text-muted-foreground">Para alunos que participam ativamente das aulas</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <RadioGroupItem value="entrega" id="entrega" />
                <Label htmlFor="entrega" className="flex flex-col">
                  <span className="font-medium">Entrega de Atividade (+15 XP)</span>
                  <span className="text-sm text-muted-foreground">Para alunos que entregam atividades no prazo</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <RadioGroupItem value="nota" id="nota" />
                <Label htmlFor="nota" className="flex flex-col">
                  <span className="font-medium">Nota Máxima (+25 XP)</span>
                  <span className="text-sm text-muted-foreground">Para alunos que tiram nota máxima em avaliações</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ajuda" id="ajuda" />
                <Label htmlFor="ajuda" className="flex flex-col">
                  <span className="font-medium">Ajuda aos Colegas (+20 XP)</span>
                  <span className="text-sm text-muted-foreground">
                    Para alunos que auxiliam os colegas nas atividades
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selecione os Alunos</CardTitle>
            <CardDescription>Escolha quais alunos receberão o XP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="todos" />
                <Label htmlFor="todos" className="font-medium">
                  Selecionar todos
                </Label>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="aluno1" />
                  <Label htmlFor="aluno1">Ana Oliveira</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="aluno2" />
                  <Label htmlFor="aluno2">João Santos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="aluno3" />
                  <Label htmlFor="aluno3">Maria Silva</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="aluno4" />
                  <Label htmlFor="aluno4">Pedro Almeida</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="aluno5" />
                  <Label htmlFor="aluno5">Carla Mendes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="aluno6" />
                  <Label htmlFor="aluno6">Lucas Ferreira</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="w-full md:w-auto">Distribuir XP</Button>
      </div>
    </div>
  )
}

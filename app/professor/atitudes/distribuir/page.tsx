"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Award,
  Home,
  Bell,
  Settings,
  ArrowLeft,
  Check,
  User,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface Aluno {
  id: string
  nome: string
  selecionado: boolean
}

interface Turma {
  id: string
  name: string
}

interface Atitude {
  id: string
  name: string
  type: string
  reward_type: string
  reward_value: number
  reward_value_xp?: number
  reward_value_atoms?: number
  description?: string
}

// Função para converter ID numérico em formato UUID
function convertToUUID(id: string | number): string {
  // Se já for um UUID válido, retorna como está
  if (typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id
  }

  // Converte para string se for número
  const idStr = String(id)

  // Verifica se é um ID numérico
  if (/^\d+$/.test(idStr)) {
    // Cria um UUID determinístico baseado no ID numérico
    // Formato: 00000000-0000-0000-0000-xxxxxxxxxxxx onde x é o ID com padding
    const paddedId = idStr.padStart(12, "0")
    return `00000000-0000-0000-0000-${paddedId}`
  }

  // Se não for UUID nem número, retorna um UUID de fallback
  console.warn(`ID inválido convertido para UUID de fallback: ${id}`)
  return "00000000-0000-0000-0000-000000000000"
}

// Definir as etapas do processo
type Step = "turma" | "modo" | "alunos" | "tipoAtitude" | "atitude" | "observacoes" | "confirmacao"

export default function DistribuirAtitudesPage() {
  const [loading, setLoading] = useState(true)
  const [professorData, setProfessorData] = useState<any>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("")
  const [turmaNome, setTurmaNome] = useState<string>("")
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [atitudes, setAtitudes] = useState<Atitude[]>([])
  const [atitudesPositivas, setAtitudesPositivas] = useState<Atitude[]>([])
  const [atitudesNegativas, setAtitudesNegativas] = useState<Atitude[]>([])
  const [atitudeSelecionada, setAtitudeSelecionada] = useState<string>("")
  const [observacoes, setObservacoes] = useState<string>("")
  const [modoDistribuicao, setModoDistribuicao] = useState<"turma" | "individual">("turma")
  const [tipoAtitude, setTipoAtitude] = useState<"positive" | "negative" | "">("")
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("turma")
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

        // Buscar atitudes disponíveis
        const { data: atitudesData, error: atitudesError } = await supabase.from("attitudes").select("*").order("name")

        if (atitudesError) {
          console.error("Erro ao buscar atitudes:", atitudesError)
        } else {
          setAtitudes(atitudesData || [])

          // Separar atitudes positivas e negativas
          const positivas = atitudesData?.filter((a) => a.type === "positive") || []
          const negativas = atitudesData?.filter((a) => a.type === "negative") || []

          setAtitudesPositivas(positivas)
          setAtitudesNegativas(negativas)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do professor:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfessorData()
  }, [router])

  // Carregar alunos quando uma turma for selecionada
  useEffect(() => {
    async function carregarAlunos() {
      if (!turmaSelecionada) return

      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Buscar nome da turma
        const { data: turmaData, error: turmaError } = await supabase
          .from("classes")
          .select("name")
          .eq("id", turmaSelecionada)
          .single()

        if (!turmaError && turmaData) {
          setTurmaNome(turmaData.name)
        }

        // Buscar alunos matriculados na turma usando a tabela enrollments
        const { data, error } = await supabase
          .from("enrollments")
          .select(`
            id,
            student:student_id (
              id,
              profile:profiles!students_id_fkey (
                id,
                full_name
              )
            )
          `)
          .eq("class_id", turmaSelecionada)

        if (error) {
          console.error("Erro ao buscar alunos:", error)
          return
        }

        // Formatar dados dos alunos
        const alunosFormatados = data
          .filter((item) => item.student && item.student.profile)
          .map((item) => ({
            id: item.student.id,
            nome: item.student.profile.full_name,
            selecionado: false,
          }))

        setAlunos(alunosFormatados)
      } catch (error) {
        console.error("Erro ao carregar alunos:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarAlunos()
  }, [turmaSelecionada])

  const handleTurmaSelecionada = (turmaId: string) => {
    setTurmaSelecionada(turmaId)
    setCurrentStep("modo")
    setAtitudeSelecionada("")
    setObservacoes("")
    setSucesso(false)
  }

  const handleModoSelecionado = (modo: "turma" | "individual") => {
    setModoDistribuicao(modo)
    if (modo === "turma") {
      // Selecionar todos os alunos automaticamente
      setAlunos(alunos.map((aluno) => ({ ...aluno, selecionado: true })))
      setCurrentStep("tipoAtitude")
    } else {
      setCurrentStep("alunos")
    }
  }

  const handleAlunoToggle = (id: string) => {
    setAlunos(alunos.map((aluno) => (aluno.id === id ? { ...aluno, selecionado: !aluno.selecionado } : aluno)))
  }

  const handleTipoAtitudeSelecionado = (tipo: "positive" | "negative") => {
    setTipoAtitude(tipo)
    setCurrentStep("atitude")
  }

  const handleAtitudeSelecionada = (atitudeId: string) => {
    setAtitudeSelecionada(atitudeId)
    setCurrentStep("observacoes")
  }

  const handleObservacoesSubmit = () => {
    setCurrentStep("confirmacao")
  }

  const handleVoltar = () => {
    // Lógica para voltar à etapa anterior
    if (currentStep === "modo") setCurrentStep("turma")
    else if (currentStep === "alunos") setCurrentStep("modo")
    else if (currentStep === "tipoAtitude") {
      if (modoDistribuicao === "turma") setCurrentStep("modo")
      else setCurrentStep("alunos")
    } else if (currentStep === "atitude") setCurrentStep("tipoAtitude")
    else if (currentStep === "observacoes") setCurrentStep("atitude")
    else if (currentStep === "confirmacao") setCurrentStep("observacoes")
  }

  const handleReiniciar = () => {
    setTurmaSelecionada("")
    setAtitudeSelecionada("")
    setObservacoes("")
    setModoDistribuicao("turma")
    setTipoAtitude("")
    setSucesso(false)
    setCurrentStep("turma")
    setAlunos(alunos.map((aluno) => ({ ...aluno, selecionado: false })))
  }

  // Função para atualizar o saldo de XP do aluno
  async function atualizarSaldoXP(
    supabase: any,
    studentId: string,
    schoolId: string,
    xpAmount: number,
    isPositive: boolean,
  ) {
    try {
      // Verificar se o aluno já tem um registro de XP
      const { data: studentXP, error: xpError } = await supabase
        .from("student_xp")
        .select("*")
        .eq("student_id", studentId)
        .single()

      if (xpError && xpError.code !== "PGRST116") {
        // PGRST116 = registro não encontrado
        console.error("Erro ao verificar XP do aluno:", xpError)
        throw new Error("Não foi possível atualizar o XP do aluno")
      }

      // Calcular o novo valor de XP (adicionar ou subtrair dependendo do tipo de atitude)
      const xpValue = isPositive ? xpAmount : -xpAmount

      if (studentXP) {
        // Atualizar o XP existente
        const newXP = Math.max(0, studentXP.xp_amount + xpValue) // Garantir que não fique negativo

        // Buscar o nível correspondente ao novo XP
        const { data: levels, error: levelError } = await supabase
          .from("xp_levels")
          .select("*")
          .lte("min_xp", newXP)
          .order("min_xp", { ascending: false })
          .limit(1)

        if (levelError) {
          console.error("Erro ao buscar nível de XP:", levelError)
        }

        const levelId = levels && levels.length > 0 ? levels[0].id : null

        const { error: updateError } = await supabase
          .from("student_xp")
          .update({
            xp_amount: newXP,
            level_id: levelId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", studentXP.id)

        if (updateError) {
          console.error("Erro ao atualizar XP do aluno:", updateError)
          throw new Error("Não foi possível atualizar o XP do aluno")
        }
      } else {
        // Criar um novo registro de XP
        // Para atitudes negativas em alunos sem saldo, começamos com 0
        const initialXP = isPositive ? xpAmount : 0

        const { error: createError } = await supabase.from("student_xp").insert([
          {
            student_id: studentId,
            xp_amount: initialXP,
            school_id: schoolId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (createError) {
          console.error("Erro ao criar registro de XP do aluno:", createError)
          throw new Error("Não foi possível criar o registro de XP do aluno")
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar saldo de XP:", error)
      throw error
    }
  }

  // Função para atualizar o saldo de átomos do aluno
  async function atualizarSaldoAtomos(
    supabase: any,
    studentId: string,
    atomAmount: number,
    isPositive: boolean,
    attitudeId: string,
    attitudeName: string,
  ) {
    try {
      // Improved validation with better debugging
      console.log("Validando IDs para transação de átomos:", { studentId, attitudeId })

      // Verificar se os IDs são válidos
      if (!studentId || typeof studentId !== "string") {
        console.error("ID do aluno inválido (tipo ou vazio):", studentId)
        throw new Error(`ID do aluno inválido: ${studentId}`)
      }

      // Para o ID do aluno, ainda esperamos um UUID
      if (studentId.length < 10) {
        console.error("ID do aluno muito curto para ser um UUID válido:", studentId)
        throw new Error(`ID do aluno inválido (muito curto): ${studentId}`)
      }

      // Para o ID da atitude, aceitamos valores numéricos ou UUIDs
      if (!attitudeId) {
        console.error("ID da atitude inválido (vazio):", attitudeId)
        throw new Error(`ID da atitude inválido: ${attitudeId}`)
      }

      // Converter o ID da atitude para um formato UUID válido
      const uuidAttitudeId = convertToUUID(attitudeId)
      console.log(`ID da atitude convertido: ${attitudeId} -> ${uuidAttitudeId}`)

      // Determinar o tipo de transação
      const transactionType = isPositive ? "credit" : "debit"

      // Calcular o valor absoluto para a transação
      const amount = Math.abs(atomAmount)

      // Verificar o saldo atual e atualizar diretamente
      const { data: balance, error: balanceError } = await supabase
        .from("student_atom_balance")
        .select("id, balance")
        .eq("student_id", studentId)
        .single()

      // Calcular o novo saldo
      let newBalance = 0
      let balanceId = null

      if (balanceError && balanceError.code === "PGRST116") {
        // Registro não encontrado, criar um novo
        if (isPositive) {
          newBalance = amount
        } else {
          // Se for uma dedução e não há saldo, mantém em 0
          newBalance = 0
        }

        // Criar novo registro de saldo - sem os campos created_at e updated_at
        const { data: newBalanceData, error: insertError } = await supabase
          .from("student_atom_balance")
          .insert([
            {
              student_id: studentId,
              balance: newBalance,
              // Removidos os campos created_at e updated_at que não existem na tabela
            },
          ])
          .select()

        if (insertError) {
          console.error("Erro ao criar registro de saldo:", insertError)
          throw new Error("Não foi possível criar o registro de saldo")
        }

        if (newBalanceData && newBalanceData.length > 0) {
          balanceId = newBalanceData[0].id
        }
      } else if (balanceError) {
        console.error("Erro ao verificar saldo:", balanceError)
        throw new Error("Não foi possível verificar o saldo atual")
      } else {
        // Registro encontrado, atualizar
        balanceId = balance.id

        if (isPositive) {
          newBalance = balance.balance + amount
        } else {
          // Se for uma dedução, garantir que não fique negativo
          newBalance = Math.max(0, balance.balance - amount)
        }

        // Atualizar o registro existente - sem o campo updated_at
        const { error: updateError } = await supabase
          .from("student_atom_balance")
          .update({
            balance: newBalance,
            // Removido o campo updated_at que não existe na tabela
          })
          .eq("id", balanceId)

        if (updateError) {
          console.error("Erro ao atualizar saldo:", updateError)
          throw new Error("Não foi possível atualizar o saldo")
        }
      }

      // Registrar a transação
      const { error: atomError } = await supabase.from("atom_transactions").insert([
        {
          student_id: studentId,
          amount: amount,
          transaction_type: transactionType,
          reference_type: "attitude",
          reference_id: uuidAttitudeId, // Usando o ID convertido
          description: `${isPositive ? "Ganhou" : "Perdeu"} ${amount} átomos pela atitude: ${attitudeName}`,
          created_at: new Date().toISOString(),
        },
      ])

      if (atomError) {
        console.error("Erro ao registrar transação de átomos:", atomError)
        throw new Error("Não foi possível registrar a transação de átomos")
      }

      console.log(`Saldo de átomos ${isPositive ? "aumentado" : "reduzido"} para ${newBalance}`)
    } catch (error) {
      console.error("Erro ao atualizar saldo de átomos:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    const alunosSelecionados = alunos.filter((aluno) => aluno.selecionado)

    if (alunosSelecionados.length === 0) {
      alert("Selecione pelo menos um aluno")
      return
    }

    try {
      setEnviando(true)
      const supabase = getSupabaseClient()

      // Obter dados da sessão para identificar o professor
      const { data: sessionData } = await supabase.auth.getSession()
      const professorId = sessionData.session?.user.id

      if (!professorId) {
        alert("Sessão expirada. Faça login novamente.")
        router.push("/professor/login")
        return
      }

      // Obter dados da escola do professor
      const { data: professorData, error: professorError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", professorId)
        .single()

      if (professorError) {
        console.error("Erro ao buscar dados do professor:", professorError)
        throw new Error("Não foi possível identificar a escola do professor")
      }

      const schoolId = professorData.school_id

      // Obter detalhes da atitude selecionada
      const atitude = atitudes.find((a) => a.id === atitudeSelecionada)

      if (!atitude) {
        throw new Error("Atitude não encontrada")
      }

      // Determinar se a atitude é positiva ou negativa
      const isPositive = atitude.type === "positive"

      // Criar registros para cada aluno selecionado
      const registros = alunosSelecionados.map((aluno) => ({
        student_id: aluno.id,
        attitude_id: atitudeSelecionada,
        applied_by: professorId,
        notes: observacoes,
        school_id: schoolId,
        created_at: new Date().toISOString(),
      }))

      // Inserir registros na tabela applied_attitudes
      const { error: insertError } = await supabase.from("applied_attitudes").insert(registros)

      if (insertError) {
        console.error("Erro ao registrar atitudes:", insertError)
        throw new Error("Não foi possível registrar as atitudes")
      }

      // Atualizar saldos de XP e átomos para cada aluno
      for (const aluno of alunosSelecionados) {
        // Atualizar XP se a atitude concede/remove XP
        if (atitude.reward_type === "xp" || atitude.reward_type === "both") {
          await atualizarSaldoXP(
            supabase,
            aluno.id,
            schoolId,
            atitude.reward_value_xp || atitude.reward_value,
            isPositive,
          )
        }

        // Atualizar átomos se a atitude concede/remove átomos
        if ((atitude.reward_type === "atoms" || atitude.reward_type === "both") && atitude.reward_value_atoms > 0) {
          console.log("Preparando para atualizar átomos para aluno:", aluno.id, "com atitude:", atitude.id, atitude)

          // Verificar se os IDs são válidos antes de chamar a função
          if (!aluno.id || typeof aluno.id !== "string" || aluno.id.length < 10) {
            console.error("ID do aluno inválido antes de chamar atualizarSaldoAtomos:", aluno.id)
            throw new Error(`ID do aluno inválido: ${aluno.id}`)
          }

          if (!atitude.id) {
            console.error("ID da atitude inválido antes de chamar atualizarSaldoAtomos:", atitude.id)
            throw new Error(`ID da atitude inválido: ${atitude.id}`)
          }

          await atualizarSaldoAtomos(
            supabase,
            aluno.id,
            atitude.reward_value_atoms || atitude.reward_value,
            isPositive,
            atitude.id,
            atitude.name,
          )
        }
      }

      // Sucesso!
      setSucesso(true)
      setObservacoes("")

      // Mostrar toast de sucesso
      toast({
        title: "Atitudes distribuídas com sucesso!",
        description: `Atitude aplicada para ${alunosSelecionados.length} aluno(s).`,
        duration: 5000,
      })

      // Redirecionar para a página de listagem de atitudes após 1.5 segundos
      setTimeout(() => {
        router.push("/professor/atitudes")
      }, 1500)
    } catch (error: any) {
      console.error("Erro ao distribuir atitudes:", error)
      alert(`Erro ao distribuir atitudes: ${error.message}`)
    } finally {
      setEnviando(false)
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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header com avatar e saudação */}
      <header className="p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/professor/atitudes")} className="mr-2">
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
        {/* Indicador de progresso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Distribuir Atitudes</h2>
            {currentStep !== "turma" && (
              <Button variant="outline" size="sm" onClick={handleVoltar} className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            )}
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300"
              style={{
                width:
                  currentStep === "turma"
                    ? "14%"
                    : currentStep === "modo"
                      ? "28%"
                      : currentStep === "alunos"
                        ? "42%"
                        : currentStep === "tipoAtitude"
                          ? "56%"
                          : currentStep === "atitude"
                            ? "70%"
                            : currentStep === "observacoes"
                              ? "85%"
                              : "100%",
              }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span className={currentStep === "turma" ? "text-purple-600 font-medium" : ""}>Turma</span>
            <span className={currentStep === "modo" ? "text-purple-600 font-medium" : ""}>Modo</span>
            <span
              className={currentStep === "alunos" || currentStep === "tipoAtitude" ? "text-purple-600 font-medium" : ""}
            >
              {modoDistribuicao === "individual" ? "Alunos" : "Tipo"}
            </span>
            <span className={currentStep === "atitude" ? "text-purple-600 font-medium" : ""}>Atitude</span>
            <span className={currentStep === "observacoes" ? "text-purple-600 font-medium" : ""}>Obs</span>
            <span className={currentStep === "confirmacao" ? "text-purple-600 font-medium" : ""}>Confirmar</span>
          </div>
        </div>

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200 rounded-xl shadow-[0_5px_15px_-5px_rgba(34,197,94,0.3)]">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Atitudes distribuídas com sucesso!</AlertTitle>
            <AlertDescription className="text-green-700">
              As atitudes foram registradas e os alunos receberão os pontos correspondentes.
            </AlertDescription>
          </Alert>
        )}

        {/* Etapa 1: Seleção de Turma */}
        {currentStep === "turma" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium mb-4">Selecione uma turma:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turmas.map((turma) => (
                <Button
                  key={turma.id}
                  variant="outline"
                  className={`h-auto p-6 flex flex-col items-center justify-center gap-2 rounded-xl border-2 hover:border-purple-500 hover:bg-purple-50 transition-all ${
                    turmaSelecionada === turma.id ? "border-purple-500 bg-purple-50" : "border-gray-200"
                  }`}
                  onClick={() => handleTurmaSelecionada(turma.id)}
                >
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-lg font-medium">{turma.name}</span>
                  <span className="text-sm text-gray-500">Clique para selecionar</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Etapa 2: Modo de Distribuição */}
        {currentStep === "modo" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-purple-50 p-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Turma selecionada:</h3>
                <p className="text-purple-700">{turmaNome}</p>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Como deseja distribuir as atitudes?</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 hover:border-purple-500 hover:bg-purple-50 transition-all"
                onClick={() => handleModoSelecionado("turma")}
              >
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-lg font-medium">Para toda a turma</span>
                <span className="text-sm text-gray-500 text-center">
                  Aplicar a mesma atitude para todos os alunos da turma
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 hover:border-purple-500 hover:bg-purple-50 transition-all"
                onClick={() => handleModoSelecionado("individual")}
              >
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-lg font-medium">Para alunos específicos</span>
                <span className="text-sm text-gray-500 text-center">Selecionar quais alunos receberão a atitude</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Etapa 3: Seleção de Alunos */}
        {currentStep === "alunos" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-purple-50 p-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Turma: {turmaNome}</h3>
                <p className="text-purple-700">Modo: Alunos específicos</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Selecione os alunos:</h3>
              <span className="text-sm text-purple-600 font-medium">
                {alunos.filter((a) => a.selecionado).length} de {alunos.length} selecionados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {alunos.map((aluno) => (
                <Button
                  key={aluno.id}
                  variant="outline"
                  className={`h-auto p-4 flex items-center gap-3 rounded-xl border-2 hover:border-purple-500 hover:bg-purple-50 transition-all justify-start ${
                    aluno.selecionado ? "border-purple-500 bg-purple-50" : "border-gray-200"
                  }`}
                  onClick={() => handleAlunoToggle(aluno.id)}
                >
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600">
                      {aluno.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{aluno.nome}</div>
                    <div className="text-xs text-gray-500">
                      Clique para {aluno.selecionado ? "remover" : "selecionar"}
                    </div>
                  </div>
                  {aluno.selecionado && (
                    <div className="ml-auto h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                </Button>
              ))}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 rounded-lg h-12 text-base"
              disabled={alunos.filter((a) => a.selecionado).length === 0}
              onClick={() => setCurrentStep("tipoAtitude")}
            >
              Continuar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Etapa 4: Tipo de Atitude */}
        {currentStep === "tipoAtitude" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-purple-50 p-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Turma: {turmaNome}</h3>
                <p className="text-purple-700">
                  {modoDistribuicao === "turma"
                    ? "Modo: Toda a turma"
                    : `Modo: ${alunos.filter((a) => a.selecionado).length} alunos selecionados`}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Que tipo de atitude deseja distribuir?</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all"
                onClick={() => handleTipoAtitudeSelecionado("positive")}
              >
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <ThumbsUp className="h-8 w-8 text-green-600" />
                </div>
                <span className="text-lg font-medium text-green-700">Atitude Positiva</span>
                <span className="text-sm text-gray-500 text-center">
                  Reconhecer bom comportamento e premiar com XP ou átomos
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all"
                onClick={() => handleTipoAtitudeSelecionado("negative")}
              >
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <ThumbsDown className="h-8 w-8 text-red-600" />
                </div>
                <span className="text-lg font-medium text-red-700">Atitude Negativa</span>
                <span className="text-sm text-gray-500 text-center">
                  Registrar comportamento inadequado e aplicar consequências
                </span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Etapa 5: Seleção da Atitude */}
        {currentStep === "atitude" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-purple-50 p-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                {tipoAtitude === "positive" ? (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Atitude {tipoAtitude === "positive" ? "Positiva" : "Negativa"}</h3>
                <p className="text-purple-700">
                  {modoDistribuicao === "turma"
                    ? `Para toda a turma ${turmaNome}`
                    : `Para ${alunos.filter((a) => a.selecionado).length} alunos selecionados`}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Selecione a atitude específica:</h3>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {(tipoAtitude === "positive" ? atitudesPositivas : atitudesNegativas).map((atitude) => (
                <Button
                  key={atitude.id}
                  variant="outline"
                  className={`h-auto p-4 flex items-start gap-3 rounded-xl border-2 hover:border-purple-500 hover:bg-purple-50 transition-all justify-start ${
                    atitudeSelecionada === atitude.id ? "border-purple-500 bg-purple-50" : "border-gray-200"
                  }`}
                  onClick={() => handleAtitudeSelecionada(atitude.id)}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      tipoAtitude === "positive" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tipoAtitude === "positive" ? "+" : "-"}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">{atitude.name}</div>
                    {atitude.description && <div className="text-sm text-gray-500 mt-1">{atitude.description}</div>}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tipoAtitude === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {atitude.reward_type === "xp"
                          ? "XP"
                          : atitude.reward_type === "atoms"
                            ? "Átomos"
                            : "XP + Átomos"}
                      </span>
                      <span className="text-sm font-medium">
                        {tipoAtitude === "positive" ? "+" : "-"}
                        {atitude.reward_value}
                      </span>
                    </div>
                  </div>
                  {atitudeSelecionada === atitude.id && (
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Etapa 6: Observações */}
        {currentStep === "observacoes" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-purple-50 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    tipoAtitude === "positive" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}
                >
                  {tipoAtitude === "positive" ? <ThumbsUp className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-medium">{atitudes.find((a) => a.id === atitudeSelecionada)?.name}</h3>
                  <p className={tipoAtitude === "positive" ? "text-green-700" : "text-red-700"}>
                    Atitude {tipoAtitude === "positive" ? "Positiva" : "Negativa"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-13 pl-1">
                {modoDistribuicao === "turma"
                  ? `Para toda a turma ${turmaNome}`
                  : `Para ${alunos.filter((a) => a.selecionado).length} alunos selecionados`}
              </p>
            </div>

            <h3 className="text-lg font-medium mb-4">Adicione observações (opcional):</h3>

            <Textarea
              placeholder="Descreva o motivo da atitude ou adicione detalhes sobre o comportamento..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="min-h-[150px] rounded-lg border-gray-200 resize-none"
            />

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 rounded-lg h-12 text-base mt-6"
              onClick={handleObservacoesSubmit}
            >
              Continuar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Etapa 7: Confirmação */}
        {currentStep === "confirmacao" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card className="overflow-hidden rounded-xl border-none shadow-[0_10px_30px_-15px_rgba(149,76,233,0.3)]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Confirmar distribuição de atitude</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Turma</p>
                      <p className="font-medium">{turmaNome}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Alunos</p>
                      <p className="font-medium">
                        {modoDistribuicao === "turma"
                          ? `Toda a turma (${alunos.length} alunos)`
                          : `${alunos.filter((a) => a.selecionado).length} alunos selecionados`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Atitude</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            tipoAtitude === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tipoAtitude === "positive" ? "Positiva" : "Negativa"}
                        </span>
                        <p className="font-medium">{atitudes.find((a) => a.id === atitudeSelecionada)?.name}</p>
                      </div>
                    </div>
                  </div>

                  {observacoes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Observações</p>
                      <p className="text-sm">{observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleReiniciar}>
                    Cancelar
                  </Button>

                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                    onClick={handleSubmit}
                    disabled={enviando}
                  >
                    {enviando ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Distribuindo...
                      </>
                    ) : (
                      "Confirmar e Distribuir"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
            className="text-gray-500"
            onClick={() => router.push("/professor/turmas")}
          >
            <Users className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-purple-600"
            onClick={() => router.push("/professor/atitudes")}
          >
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

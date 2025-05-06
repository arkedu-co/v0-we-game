"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, UserIcon as UserSwitch } from "lucide-react"
import {
  createAluno,
  updateAluno,
  listTurmasAluno,
  matricularAluno,
  cancelarMatricula,
} from "@/lib/actions/aluno-actions"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Schema para validação do formulário
const alunoSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  guardianName: z.string().min(3, "Nome do responsável deve ter pelo menos 3 caracteres"),
  guardianEmail: z.string().email("Email do responsável inválido"),
  guardianPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  guardianPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

// Schema para validação do formulário de edição
const alunoEditSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
})

interface AlunoFormProps {
  aluno?: any
  isEditing?: boolean
  onSuccess?: () => void
}

export function AlunoForm({ aluno, isEditing = false, onSuccess }: AlunoFormProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [studentInfo, setStudentInfo] = useState<{
    code: string
    email: string
    password: string
  } | null>(null)
  const [remanejamentoDialogOpen, setRemanejamentoDialogOpen] = useState(false)
  const [turmasAluno, setTurmasAluno] = useState<any[]>([])
  const [todasTurmas, setTodasTurmas] = useState<any[]>([])
  const [selectedTurmaAtual, setSelectedTurmaAtual] = useState<string>("")
  const [selectedTurmaNova, setSelectedTurmaNova] = useState<string>("")
  const [loadingTurmas, setLoadingTurmas] = useState(false)
  const [remanejandoAluno, setRemanejandoAluno] = useState(false)

  const router = useRouter()
  const supabase = getSupabaseClient()

  // Definir o schema com base no modo (criação ou edição)
  const schema = isEditing ? alunoEditSchema : alunoSchema

  // Configurar o formulário com react-hook-form e zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          fullName: aluno?.profile?.full_name || "",
          birthDate: aluno?.birth_date ? format(new Date(aluno.birth_date), "yyyy-MM-dd") : "",
          email: aluno?.profile?.email || "",
        }
      : {
          fullName: "",
          birthDate: "",
          email: "",
          guardianName: "",
          guardianEmail: "",
          guardianPhone: "",
          guardianPassword: "",
        },
  })

  // Obter o ID da escola atual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session?.user) {
          setSchoolId(sessionData.session.user.id)
        }
      } catch (error) {
        console.error("Erro ao obter usuário atual:", error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Carregar turmas do aluno se estiver no modo de edição
  useEffect(() => {
    if (isEditing && aluno?.id) {
      fetchTurmasAluno()
    }
  }, [isEditing, aluno?.id])

  // Função para buscar turmas do aluno
  const fetchTurmasAluno = async () => {
    try {
      const turmas = await listTurmasAluno(aluno.id)
      setTurmasAluno(turmas)
    } catch (error) {
      console.error("Erro ao buscar turmas do aluno:", error)
    }
  }

  // Função para buscar todas as turmas disponíveis
  const fetchTodasTurmas = async () => {
    if (!schoolId) return

    setLoadingTurmas(true)
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          year,
          course:course_id (
            id,
            name
          )
        `)
        .eq("school_id", schoolId)
        .order("name")

      if (error) throw error
      setTodasTurmas(data || [])
    } catch (error) {
      console.error("Erro ao buscar turmas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas",
        variant: "destructive",
      })
    } finally {
      setLoadingTurmas(false)
    }
  }

  // Função para abrir o diálogo de remanejamento
  const handleOpenRemanejamento = () => {
    fetchTodasTurmas()
    setRemanejamentoDialogOpen(true)
  }

  // Função para realizar o remanejamento
  const handleRemanejarAluno = async () => {
    if (!selectedTurmaAtual || !selectedTurmaNova) {
      toast({
        title: "Erro",
        description: "Selecione as turmas de origem e destino",
        variant: "destructive",
      })
      return
    }

    setRemanejandoAluno(true)
    try {
      // Cancelar matrícula na turma atual
      await cancelarMatricula(selectedTurmaAtual)

      // Matricular na nova turma
      await matricularAluno({
        studentId: aluno.id,
        classId: selectedTurmaNova,
      })

      toast({
        title: "Sucesso",
        description: "Aluno remanejado com sucesso",
      })

      // Atualizar a lista de turmas
      fetchTurmasAluno()
      setRemanejamentoDialogOpen(false)
    } catch (error: any) {
      console.error("Erro ao remanejar aluno:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao remanejar aluno",
        variant: "destructive",
      })
    } finally {
      setRemanejandoAluno(false)
    }
  }

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: any) => {
    if (!schoolId && !isEditing) {
      toast({
        title: "Erro",
        description: "ID da escola não encontrado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        // Atualizar aluno existente
        await updateAluno(aluno.id, {
          fullName: data.fullName,
          birthDate: data.birthDate,
          email: data.email,
        })

        toast({
          title: "Aluno atualizado",
          description: "Os dados do aluno foram atualizados com sucesso.",
        })

        // Redirecionar para a página de detalhes do aluno
        router.push(`/escola/alunos/${aluno.id}/detalhes`)

        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Criar novo aluno usando a server action
        const result = await createAluno({
          schoolId: schoolId!,
          fullName: data.fullName,
          birthDate: data.birthDate,
          email: data.email,
          guardianName: data.guardianName,
          guardianEmail: data.guardianEmail,
          guardianPhone: data.guardianPhone,
          guardianPassword: data.guardianPassword,
        })

        // Mostrar informações do aluno
        const studentEmail = data.email || `aluno_${result.studentCode}@escola.com`
        const studentPassword = `Aluno${result.studentCode}`

        setStudentInfo({
          code: result.studentCode,
          email: studentEmail,
          password: studentPassword,
        })

        toast({
          title: "Aluno cadastrado",
          description: `O aluno foi cadastrado com sucesso. Código: ${result.studentCode}`,
        })
      }
    } catch (error: any) {
      console.error("Erro ao salvar aluno:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar aluno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {studentInfo ? (
        <Card>
          <CardHeader className="bg-green-50 rounded-t-lg border-b">
            <CardTitle className="text-xl text-green-800">Aluno Cadastrado com Sucesso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-800 mb-2">Informações de Acesso do Aluno</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Código:</span>
                    <span className="font-mono bg-white px-3 py-1 rounded border">{studentInfo.code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span className="font-mono bg-white px-3 py-1 rounded border">{studentInfo.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Senha:</span>
                    <span className="font-mono bg-white px-3 py-1 rounded border">{studentInfo.password}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-green-700">
                  Guarde estas informações! Elas serão necessárias para o aluno acessar o sistema.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-gray-50/50 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => router.push("/escola/alunos")}>
              Voltar para Lista
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={() => router.push(`/escola/alunos/${studentInfo.code}/detalhes`)}
            >
              Ver Detalhes do Aluno
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="bg-primary/5 rounded-t-lg border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-gray-900">{isEditing ? "Editar Aluno" : "Novo Aluno"}</CardTitle>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleOpenRemanejamento}
                  >
                    <UserSwitch className="h-4 w-4" />
                    Remanejar Turma
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Dados do Aluno</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      placeholder="Nome completo do aluno"
                      {...register("fullName")}
                      error={errors.fullName?.message}
                    />
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input id="birthDate" type="date" {...register("birthDate")} error={errors.birthDate?.message} />
                    {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email do aluno (opcional)"
                      {...register("email")}
                      error={errors.email?.message}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium text-gray-900">Dados do Responsável</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianName">Nome do Responsável *</Label>
                      <Input
                        id="guardianName"
                        placeholder="Nome completo do responsável"
                        {...register("guardianName")}
                        error={errors.guardianName?.message}
                      />
                      {errors.guardianName && (
                        <p className="text-sm text-red-500">{errors.guardianName.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianEmail">Email do Responsável *</Label>
                      <Input
                        id="guardianEmail"
                        type="email"
                        placeholder="Email do responsável"
                        {...register("guardianEmail")}
                        error={errors.guardianEmail?.message}
                      />
                      {errors.guardianEmail && (
                        <p className="text-sm text-red-500">{errors.guardianEmail.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianPhone">Telefone do Responsável *</Label>
                      <Input
                        id="guardianPhone"
                        placeholder="Telefone do responsável"
                        {...register("guardianPhone")}
                        error={errors.guardianPhone?.message}
                      />
                      {errors.guardianPhone && (
                        <p className="text-sm text-red-500">{errors.guardianPhone.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianPassword">Senha do Responsável *</Label>
                      <div className="relative">
                        <Input
                          id="guardianPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha para acesso do responsável"
                          {...register("guardianPassword")}
                          error={errors.guardianPassword?.message}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.guardianPassword && (
                        <p className="text-sm text-red-500">{errors.guardianPassword.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-gray-50/50 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Salvando..." : "Cadastrando..."}
                  </>
                ) : isEditing ? (
                  "Salvar Alterações"
                ) : (
                  "Cadastrar Aluno"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Modal de Remanejamento de Turma */}
      <Dialog open={remanejamentoDialogOpen} onOpenChange={setRemanejamentoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remanejar Aluno de Turma</DialogTitle>
            <DialogDescription>Selecione a turma atual e a nova turma para realizar o remanejamento.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="turmaAtual">Turma Atual</Label>
              <Select
                value={selectedTurmaAtual}
                onValueChange={setSelectedTurmaAtual}
                disabled={loadingTurmas || turmasAluno.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma atual" />
                </SelectTrigger>
                <SelectContent>
                  {turmasAluno.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.class.name} - {turma.class.course?.name || "Sem curso"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {turmasAluno.length === 0 && (
                <p className="text-sm text-amber-600">O aluno não está matriculado em nenhuma turma.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="turmaNova">Nova Turma</Label>
              <Select value={selectedTurmaNova} onValueChange={setSelectedTurmaNova} disabled={loadingTurmas}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a nova turma" />
                </SelectTrigger>
                <SelectContent>
                  {todasTurmas
                    .filter((turma) => !turmasAluno.some((t) => t.class.id === turma.id))
                    .map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.name} - {turma.course?.name || "Sem curso"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemanejamentoDialogOpen(false)}
              disabled={remanejandoAluno}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleRemanejarAluno}
              disabled={!selectedTurmaAtual || !selectedTurmaNova || remanejandoAluno}
            >
              {remanejandoAluno ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Remanejando...
                </>
              ) : (
                "Remanejar Aluno"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

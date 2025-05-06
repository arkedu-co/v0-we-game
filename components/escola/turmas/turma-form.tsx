"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, ArrowLeft, Save } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { createTurma, updateTurma, listProfessores, getAnosLetivos } from "@/lib/services/turma-service"
import { listCursos } from "@/lib/services/curso-service"
import type { Class, Course } from "@/lib/types"

interface TurmaFormProps {
  turma?: Class & { teacher_name?: string; course_name?: string }
  isEditing?: boolean
  onSuccess?: (data: any) => void
  redirectToList?: boolean
}

export function TurmaForm({ turma, isEditing = false, onSuccess, redirectToList = false }: TurmaFormProps) {
  const [courseId, setCourseId] = useState(turma?.course_id || "")
  const [name, setName] = useState(turma?.name || "")
  const [year, setYear] = useState<number>(turma?.year || new Date().getFullYear())
  const [teacherId, setTeacherId] = useState<string | undefined>(turma?.teacher_id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [professores, setProfessores] = useState<{ id: string; name: string }[]>([])
  const [cursos, setCursos] = useState<Course[]>([])
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Obter o ID da escola do usuário logado
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
  }, [supabase])

  // Buscar professores e cursos disponíveis
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return

      try {
        // Buscar professores
        const professoresData = await listProfessores(schoolId)
        setProfessores(professoresData)

        // Buscar cursos
        const cursosData = await listCursos(schoolId)
        setCursos(cursosData)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      }
    }

    if (schoolId) {
      fetchData()
    }
  }, [schoolId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!schoolId) {
        throw new Error("ID da escola não encontrado")
      }

      if (!courseId || !name || !year) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      if (isEditing && turma) {
        // Atualizar turma existente
        const updatedTurma = await updateTurma(turma.id, {
          course_id: courseId,
          name,
          year,
          teacher_id: teacherId || null,
        })

        setSuccessMessage("Turma atualizada com sucesso!")
        if (onSuccess) onSuccess(updatedTurma)
      } else {
        // Criar nova turma
        const newTurma = await createTurma({
          school_id: schoolId,
          course_id: courseId,
          name,
          year,
          teacher_id: teacherId,
        })

        setSuccessMessage("Turma criada com sucesso!")

        // Redirecionar após criar
        if (redirectToList) {
          // Redirecionar para a página de listagem de turmas
          setTimeout(() => {
            router.push("/escola/turmas")
          }, 1500)
        } else {
          // Comportamento anterior: redirecionar para a página de edição
          setTimeout(() => {
            router.push(`/escola/turmas/${newTurma.id}`)
          }, 1500)
        }

        if (onSuccess) onSuccess(newTurma)
      }
    } catch (error: any) {
      console.error("Erro ao salvar turma:", error)
      setError(error.message || "Erro ao salvar turma")
    } finally {
      setLoading(false)
    }
  }

  const anosLetivos = getAnosLetivos()

  return (
    <Card>
      <CardHeader className="bg-primary/5 rounded-t-lg border-b">
        <CardTitle className="text-xl text-gray-900">{isEditing ? "Editar Turma" : "Nova Turma"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="course" className="text-base font-medium text-gray-900">
                Curso *
              </Label>
              <Select value={courseId} onValueChange={setCourseId} required>
                <SelectTrigger id="course" className="h-12 bg-white border-gray-300 text-gray-900" disabled={loading}>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum curso cadastrado
                    </SelectItem>
                  ) : (
                    cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {cursos.length === 0 && (
                <p className="text-xs text-amber-600">
                  Você precisa{" "}
                  <a href="/escola/cursos/novo" className="underline">
                    cadastrar um curso
                  </a>{" "}
                  antes de criar uma turma.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium text-gray-900">
                Nome da Turma *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Turma A"
                disabled={loading}
                required
                className="h-12 bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-base font-medium text-gray-900">
                Ano Letivo *
              </Label>
              <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))} required>
                <SelectTrigger id="year" className="h-12 bg-white border-gray-300 text-gray-900" disabled={loading}>
                  <SelectValue placeholder="Selecione o ano letivo" />
                </SelectTrigger>
                <SelectContent>
                  {anosLetivos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher" className="text-base font-medium text-gray-900">
                Professor Responsável
              </Label>
              <Select value={teacherId || ""} onValueChange={setTeacherId}>
                <SelectTrigger id="teacher" className="h-12 bg-white border-gray-300 text-gray-900" disabled={loading}>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum professor</SelectItem>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200 shadow-md">
              <AlertDescription className="text-base">{successMessage}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between p-6 border-t bg-primary/5">
        <Button
          variant="outline"
          onClick={() => (redirectToList ? router.push("/escola/turmas") : router.back())}
          disabled={loading}
          className="font-medium h-12 px-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          variant="gradient"
          className="font-medium h-12 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isEditing ? "Atualizando..." : "Criando..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {isEditing ? "Atualizar Turma" : "Criar Turma"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

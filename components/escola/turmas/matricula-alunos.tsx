"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowLeft, Loader2, Check } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MatriculaAlunosProps {
  turmaId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function MatriculaAlunos({ turmaId, onSuccess, onCancel }: MatriculaAlunosProps) {
  const [alunos, setAlunos] = useState<any[]>([])
  const [alunosMatriculados, setAlunosMatriculados] = useState<string[]>([])
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseClient()

  // Buscar alunos não matriculados na turma
  const fetchAlunos = async () => {
    setLoading(true)
    setError(null)
    try {
      // Primeiro, buscar os IDs dos alunos já matriculados na turma
      const { data: matriculados, error: matriculadosError } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("class_id", turmaId)

      if (matriculadosError) throw matriculadosError

      const alunosMatriculadosIds = matriculados?.map((m) => m.student_id) || []
      setAlunosMatriculados(alunosMatriculadosIds)

      // Buscar todos os alunos da escola
      const { data: session } = await supabase.auth.getSession()
      const schoolId = session.session?.user.id

      if (!schoolId) {
        throw new Error("Não foi possível identificar a escola")
      }

      const { data: alunosData, error: alunosError } = await supabase
        .from("students")
        .select(`
          id,
          code,
          birth_date,
          profile:profile_id (
            full_name,
            email
          )
        `)
        .eq("school_id", schoolId)
        .order("code", { ascending: true })

      if (alunosError) throw alunosError

      setAlunos(alunosData || [])
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error)
      setError(error.message || "Erro ao carregar alunos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlunos()
  }, [turmaId])

  const handleSelectAluno = (alunoId: string) => {
    setSelectedAlunos((prev) => (prev.includes(alunoId) ? prev.filter((id) => id !== alunoId) : [...prev, alunoId]))
  }

  const handleSelectAll = () => {
    const alunosNaoMatriculados = alunos
      .filter((aluno) => !alunosMatriculados.includes(aluno.id))
      .map((aluno) => aluno.id)

    if (selectedAlunos.length === alunosNaoMatriculados.length) {
      setSelectedAlunos([])
    } else {
      setSelectedAlunos(alunosNaoMatriculados)
    }
  }

  const handleMatricular = async () => {
    if (selectedAlunos.length === 0) {
      setError("Selecione pelo menos um aluno para matricular")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      const enrollments = selectedAlunos.map((alunoId) => ({
        class_id: turmaId,
        student_id: alunoId,
        enrollment_date: now,
      }))

      const { error: insertError } = await supabase.from("enrollments").insert(enrollments)

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (error: any) {
      console.error("Erro ao matricular alunos:", error)
      setError(error.message || "Erro ao matricular alunos")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAlunos = alunos.filter(
    (aluno) =>
      !alunosMatriculados.includes(aluno.id) &&
      (searchTerm === "" ||
        aluno.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.code.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader className="bg-primary/5 rounded-t-lg border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-gray-900">Matricular Alunos</CardTitle>
        <Button variant="outline" onClick={onCancel} className="h-9">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">Alunos matriculados com sucesso!</p>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar alunos por nome ou código..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : filteredAlunos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm
                    ? "Nenhum aluno encontrado com os critérios de busca."
                    : "Todos os alunos já estão matriculados nesta turma."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5 hover:bg-primary/5">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={
                              filteredAlunos.length > 0 &&
                              filteredAlunos.every((aluno) => selectedAlunos.includes(aluno.id))
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Selecionar todos"
                          />
                        </TableHead>
                        <TableHead className="font-medium text-gray-900">Nome</TableHead>
                        <TableHead className="font-medium text-gray-900">Código</TableHead>
                        <TableHead className="font-medium text-gray-900">Data de Nascimento</TableHead>
                        <TableHead className="font-medium text-gray-900">Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlunos.map((aluno) => (
                        <TableRow key={aluno.id} className="hover:bg-primary/5">
                          <TableCell>
                            <Checkbox
                              checked={selectedAlunos.includes(aluno.id)}
                              onCheckedChange={() => handleSelectAluno(aluno.id)}
                              aria-label={`Selecionar ${aluno.profile.full_name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{aluno.profile.full_name}</TableCell>
                          <TableCell>{aluno.code}</TableCell>
                          <TableCell>{formatDate(aluno.birth_date)}</TableCell>
                          <TableCell>{aluno.profile.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleMatricular}
                    disabled={selectedAlunos.length === 0 || submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Matriculando...
                      </>
                    ) : (
                      `Matricular ${selectedAlunos.length} aluno${selectedAlunos.length !== 1 ? "s" : ""}`
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Mail, Pencil, Phone, Trash2, UserCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { listTurmasAluno, cancelarMatricula } from "@/lib/actions/aluno-actions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"

interface AlunoDetalhesProps {
  alunoId: string
}

interface Guardian {
  id: string
  phone: string
  address?: string
  relationship: string
  profile: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

export function AlunoDetalhes({ alunoId }: AlunoDetalhesProps) {
  const [aluno, setAluno] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [turmas, setTurmas] = useState<any[]>([])
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [loading, setLoading] = useState(true)
  const [guardiansLoading, setGuardiansLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guardiansError, setGuardiansError] = useState<string | null>(null)
  const [cancelarMatriculaDialogOpen, setCancelarMatriculaDialogOpen] = useState(false)
  const [selectedMatriculaId, setSelectedMatriculaId] = useState<string | null>(null)
  const [cancelarMatriculaLoading, setCancelarMatriculaLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Validate alunoId
  const isValidUUID =
    alunoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(alunoId)

  const fetchAlunoDetails = async () => {
    setLoading(true)
    setError(null)

    if (!isValidUUID) {
      setError("ID de aluno inválido ou não fornecido")
      setLoading(false)
      return
    }

    try {
      // Fetch student data
      const { data: alunoData, error: alunoError } = await supabase
        .from("students")
        .select("*")
        .eq("id", alunoId)
        .single()

      if (alunoError) throw alunoError

      // Fetch profile data separately
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", alunoId)
        .single()

      if (profileError) throw profileError

      setAluno(alunoData)
      setProfile(profileData)

      // Fetch turmas do aluno
      const turmasData = await listTurmasAluno(alunoId)
      setTurmas(turmasData)
    } catch (error: any) {
      console.error("Erro ao buscar detalhes do aluno:", error)
      setError(error.message || "Erro ao carregar detalhes do aluno")
    } finally {
      setLoading(false)
    }
  }

  const fetchGuardians = async () => {
    setGuardiansLoading(true)
    setGuardiansError(null)

    if (!isValidUUID) {
      setGuardiansError("ID de aluno inválido ou não fornecido")
      setGuardiansLoading(false)
      return
    }

    try {
      console.log("Fetching guardians for student:", alunoId)

      // Direct query to get guardian relationships
      const { data, error } = await supabase
        .from("student_guardian")
        .select(`
        student_id,
        guardian_id,
        relationship
      `)
        .eq("student_id", alunoId)

      if (error) {
        console.error("Error fetching student_guardian relationships:", error)
        throw error
      }

      console.log("Student guardian relationships:", data)

      if (!data || data.length === 0) {
        console.log("No guardians found for student")
        setGuardians([])
        return
      }

      // Get guardian details for each relationship
      const guardianPromises = data.map(async (relation) => {
        // Get guardian profile
        const { data: guardianData, error: guardianError } = await supabase
          .from("guardians")
          .select(`
          id,
          phone,
          address
        `)
          .eq("id", relation.guardian_id)
          .single()

        if (guardianError) {
          console.error("Error fetching guardian details:", guardianError)
          return null
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
          full_name,
          email,
          avatar_url
        `)
          .eq("id", relation.guardian_id)
          .single()

        if (profileError) {
          console.error("Error fetching guardian profile:", profileError)
          return null
        }

        return {
          id: relation.guardian_id,
          relationship: relation.relationship,
          phone: guardianData?.phone || "",
          address: guardianData?.address || "",
          profile: {
            full_name: profileData?.full_name || "",
            email: profileData?.email || "",
            avatar_url: profileData?.avatar_url || "",
          },
        }
      })

      const guardiansData = (await Promise.all(guardianPromises)).filter(Boolean) as Guardian[]
      console.log("Processed guardian data:", guardiansData)
      setGuardians(guardiansData)
    } catch (error: any) {
      console.error("Erro ao buscar responsáveis:", error)
      setGuardiansError(error.message || "Erro ao carregar responsáveis")
    } finally {
      setGuardiansLoading(false)
    }
  }

  useEffect(() => {
    fetchAlunoDetails()
    fetchGuardians() // Call this when component loads
  }, [alunoId])

  // Fetch guardians when the tab is selected
  const handleTabChange = (value: string) => {
    if (value === "responsaveis" && guardians.length === 0 && !guardiansLoading && !guardiansError) {
      fetchGuardians()
    }
  }

  const handleCancelarMatricula = async () => {
    if (!selectedMatriculaId) return

    setCancelarMatriculaLoading(true)
    try {
      await cancelarMatricula(selectedMatriculaId)
      toast({
        title: "Matrícula cancelada",
        description: "A matrícula foi cancelada com sucesso.",
      })
      fetchAlunoDetails() // Recarregar os dados
    } catch (error: any) {
      console.error("Erro ao cancelar matrícula:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar matrícula",
        variant: "destructive",
      })
    } finally {
      setCancelarMatriculaLoading(false)
      setCancelarMatriculaDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !aluno || !profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 font-medium">{error || "Erro ao carregar detalhes do aluno"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/escola/alunos/${alunoId}`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="bg-primary/5 rounded-t-lg border-b">
            <CardTitle className="text-xl text-gray-900">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
              <Badge variant="outline" className="mt-2 bg-primary/5 text-primary">
                {aluno.code}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Matrícula</p>
                <p className="font-medium">{aluno.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">{formatDate(aluno.birth_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cadastrado em</p>
                <p className="font-medium">{formatDate(aluno.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="bg-primary/5 rounded-t-lg border-b">
            <CardTitle className="text-xl text-gray-900">Detalhes do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="turmas" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="turmas">Turmas</TabsTrigger>
                <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
              </TabsList>

              <TabsContent value="turmas">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Turmas Matriculadas</h3>
                  {turmas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">O aluno não está matriculado em nenhuma turma.</div>
                  ) : (
                    <div className="space-y-4">
                      {turmas.map((turma) => (
                        <div key={turma.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {turma.class.name} ({turma.class.year})
                              </h4>
                              <p className="text-sm text-gray-500">
                                {turma.class.course?.name || "Curso não especificado"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Matriculado em: {formatDate(turma.enrollment_date)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setSelectedMatriculaId(turma.id)
                                setCancelarMatriculaDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="responsaveis">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Responsáveis</h3>
                  {guardiansLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-gray-500">Carregando informações dos responsáveis...</span>
                    </div>
                  ) : guardiansError ? (
                    <div className="text-center py-8 text-red-500">{guardiansError}</div>
                  ) : guardians.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Nenhum responsável encontrado para este aluno.</div>
                  ) : (
                    <div className="space-y-4">
                      {guardians.map((guardian) => (
                        <div key={guardian.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserCircle className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{guardian.profile.full_name}</h4>
                              <p className="text-sm text-gray-500 mb-2">{guardian.relationship}</p>

                              <div className="flex flex-col gap-2">
                                <div className="flex items-center text-sm">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                  <span>{guardian.profile.email}</span>
                                </div>
                                {guardian.phone && (
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{guardian.phone}</span>
                                  </div>
                                )}
                                {guardian.address && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span className="text-gray-400">Endereço:</span> {guardian.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal de cancelar matrícula */}
      <AlertDialog open={cancelarMatriculaDialogOpen} onOpenChange={setCancelarMatriculaDialogOpen}>
        <AlertDialogContent className="shadow-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900">Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Tem certeza que deseja cancelar a matrícula deste aluno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelarMatriculaLoading} className="font-medium">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarMatricula}
              disabled={cancelarMatriculaLoading}
              className="bg-red-600 hover:bg-red-700 font-medium"
            >
              {cancelarMatriculaLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Sim, cancelar matrícula"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

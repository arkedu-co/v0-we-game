"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, Pencil, Trash2, Plus, QrCode, School, Eye } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { deleteAluno, matricularAluno } from "@/lib/actions/aluno-actions"
import { listTurmas } from "@/lib/services/turma-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { NativeActionMenu } from "@/components/ui/native-action-menu"

interface Aluno {
  id: string
  school_id: string
  birth_date: string
  code: string
  registration_number: string
  created_at: string
  updated_at: string
  profile: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
    user_type: string
    created_at: string
    updated_at: string
  }
  turma?: {
    id: string
    name: string
    course_name?: string
    year: number
  } | null
}

export function AlunosList() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)
  const [matriculaDialogOpen, setMatriculaDialogOpen] = useState(false)
  const [turmas, setTurmas] = useState<any[]>([])
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("")
  const [matriculaLoading, setMatriculaLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

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

  const fetchAlunos = async () => {
    if (!schoolId) return

    setLoading(true)
    setError(null)
    try {
      // Fetch students first
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })

      if (studentsError) throw studentsError

      // For each student, fetch their profile separately
      const alunosWithProfiles = await Promise.all(
        studentsData.map(async (student) => {
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", student.id)
            .single()

          if (profileError) {
            console.error(`Error fetching profile for student ${student.id}:`, profileError)
            return null
          }

          // Fetch enrollment data
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from("enrollments")
            .select(`
              class_id,
              class:class_id (
                id,
                name,
                year,
                course:course_id (
                  name
                )
              )
            `)
            .eq("student_id", student.id)
            .limit(1)
            .maybeSingle()

          let turma = null
          if (enrollmentData && !enrollmentError) {
            turma = {
              id: enrollmentData.class.id,
              name: enrollmentData.class.name,
              course_name: enrollmentData.class.course?.name,
              year: enrollmentData.class.year,
            }
          }

          return {
            ...student,
            profile: profileData,
            turma,
          }
        }),
      )

      // Filter out any null values (failed profile fetches)
      const validAlunos = alunosWithProfiles.filter(Boolean) as Aluno[]

      setAlunos(validAlunos)
      setFilteredAlunos(validAlunos)
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error)
      setError(error.message || "Erro ao carregar alunos")
    } finally {
      setLoading(false)
    }
  }

  const fetchTurmas = async () => {
    if (!schoolId) return

    try {
      const data = await listTurmas(schoolId)
      setTurmas(data)
    } catch (error: any) {
      console.error("Erro ao buscar turmas:", error)
    }
  }

  useEffect(() => {
    if (schoolId) {
      fetchAlunos()
      fetchTurmas()
    }
  }, [schoolId])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAlunos(alunos)
    } else {
      const filtered = alunos.filter(
        (aluno) =>
          aluno.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.code.includes(searchTerm) ||
          aluno.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (aluno.turma?.name && aluno.turma.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredAlunos(filtered)
    }
  }, [searchTerm, alunos])

  const handleDeleteClick = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedAluno) return

    setLoading(true)
    try {
      await deleteAluno(selectedAluno.id)
      await fetchAlunos() // Recarregar a lista após excluir
      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao excluir aluno:", error)
      setError(error.message || "Erro ao excluir aluno")
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir aluno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleShowQRCode = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setQrCodeDialogOpen(true)
  }

  const handleMatriculaClick = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setMatriculaDialogOpen(true)
  }

  const handleMatricular = async () => {
    if (!selectedAluno || !selectedTurmaId) return

    setMatriculaLoading(true)
    try {
      await matricularAluno({
        studentId: selectedAluno.id,
        classId: selectedTurmaId,
      })

      toast({
        title: "Aluno matriculado",
        description: "O aluno foi matriculado com sucesso na turma selecionada.",
      })

      setMatriculaDialogOpen(false)
      setSelectedTurmaId("")

      // Atualizar a lista de alunos para mostrar a nova matrícula
      await fetchAlunos()
    } catch (error: any) {
      console.error("Erro ao matricular aluno:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao matricular aluno",
        variant: "destructive",
      })
    } finally {
      setMatriculaLoading(false)
    }
  }

  const handleViewDetails = (aluno: Aluno) => {
    router.push(`/escola/alunos/${aluno.id}/detalhes`)
  }

  const formatBirthDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alunos..."
            className="pl-10 h-12 rounded-full border-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => router.push("/escola/alunos/novo")}
          variant="gradient"
          className="rounded-full h-12 px-6 font-medium"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Aluno
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 rounded-t-lg border-b">
          <CardTitle className="text-xl text-gray-900">Alunos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && alunos.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-medium">{error}</div>
          ) : filteredAlunos.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              {searchTerm ? "Nenhum aluno encontrado para esta busca" : "Nenhum aluno cadastrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-medium text-gray-900">Nome</TableHead>
                    <TableHead className="font-medium text-gray-900">Código</TableHead>
                    <TableHead className="font-medium text-gray-900">Data de Nascimento</TableHead>
                    <TableHead className="font-medium text-gray-900">Email</TableHead>
                    <TableHead className="font-medium text-gray-900">Turma</TableHead>
                    <TableHead className="w-[100px] font-medium text-gray-900">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlunos.map((aluno) => (
                    <TableRow key={aluno.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-gray-900">{aluno.profile.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary">
                          {aluno.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900">{formatBirthDate(aluno.birth_date)}</TableCell>
                      <TableCell className="text-gray-900">{aluno.profile.email}</TableCell>
                      <TableCell>
                        {aluno.turma ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{aluno.turma.name}</span>
                            {aluno.turma.course_name && (
                              <span className="text-xs text-gray-500">
                                {aluno.turma.course_name} ({aluno.turma.year})
                              </span>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMatriculaClick(aluno)}
                            className="text-primary border-primary/30 hover:bg-primary/10"
                          >
                            <School className="h-4 w-4 mr-1" />
                            Matricular
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <NativeActionMenu
                          actions={[
                            {
                              label: "Detalhes",
                              icon: <Eye className="h-4 w-4 text-primary" />,
                              onClick: () => handleViewDetails(aluno),
                            },
                            {
                              label: "Editar",
                              icon: <Pencil className="h-4 w-4 text-primary" />,
                              href: `/escola/alunos/${aluno.id}`,
                            },
                            {
                              label: "Ver QR Code",
                              icon: <QrCode className="h-4 w-4 text-primary" />,
                              onClick: () => handleShowQRCode(aluno),
                            },
                            ...(aluno.turma
                              ? []
                              : [
                                  {
                                    label: "Matricular",
                                    icon: <School className="h-4 w-4 text-primary" />,
                                    onClick: () => handleMatriculaClick(aluno),
                                  },
                                ]),
                            {
                              label: "Excluir",
                              icon: <Trash2 className="h-4 w-4" />,
                              onClick: () => handleDeleteClick(aluno),
                              variant: "destructive",
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="shadow-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Tem certeza que deseja excluir o aluno &quot;{selectedAluno?.profile.full_name}&quot;? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="font-medium">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de QR Code */}
      <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">QR Code do Aluno</DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Este é o QR Code de acesso do aluno {selectedAluno?.profile.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {selectedAluno && (
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedAluno.code}`}
                  alt={`QR Code do aluno ${selectedAluno.profile.full_name}`}
                  width={200}
                  height={200}
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{selectedAluno?.profile.full_name}</p>
              <p className="text-sm text-gray-500">Código: {selectedAluno?.code}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrCodeDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Matrícula */}
      <Dialog open={matriculaDialogOpen} onOpenChange={setMatriculaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">Matricular Aluno</DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Selecione uma turma para matricular o aluno {selectedAluno?.profile.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="turma" className="text-sm font-medium text-gray-700">
                Turma
              </label>
              <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId}>
                <SelectTrigger id="turma" className="w-full">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.course_name ? `${turma.course_name} - ` : ""}
                      {turma.name} ({turma.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatriculaDialogOpen(false)} disabled={matriculaLoading}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleMatricular} disabled={!selectedTurmaId || matriculaLoading}>
              {matriculaLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Matriculando...
                </>
              ) : (
                "Matricular"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

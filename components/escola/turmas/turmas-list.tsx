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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Search, Pencil, Trash2, Plus, Users, BookOpen, UserCheck, Activity } from "lucide-react"
import { listTurmas, deleteTurma, countAlunosTurma } from "@/lib/services/turma-service"
import { fetchProfessoresByTurma } from "@/lib/services/vinculo-service"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { NativeActionMenu } from "@/components/ui/native-action-menu"

interface TurmaWithDetails {
  id: string
  course_id: string
  course_name?: string
  name: string
  year: number
  teacher_id?: string
  teacher_name?: string
  created_at: string
  updated_at: string
  student_count?: number
  professor_count?: number
  professores?: ProfessorVinculo[]
}

interface ProfessorVinculo {
  teachers: {
    id: string
    profiles: {
      full_name: string
    }
  }
  subjects: {
    id: string
    name: string
  }
}

export function TurmasList() {
  const [turmas, setTurmas] = useState<TurmaWithDetails[]>([])
  const [filteredTurmas, setFilteredTurmas] = useState<TurmaWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<TurmaWithDetails | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [vinculosDialogOpen, setVinculosDialogOpen] = useState(false)
  const [selectedTurmaVinculos, setSelectedTurmaVinculos] = useState<ProfessorVinculo[]>([])
  const [loadingVinculos, setLoadingVinculos] = useState(false)
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

  const fetchTurmas = async () => {
    if (!schoolId) return

    setLoading(true)
    setError(null)
    try {
      const data = await listTurmas(schoolId)

      // Buscar contagem de alunos e professores para cada turma
      const turmasWithCounts = await Promise.all(
        data.map(async (turma) => {
          try {
            // Contar alunos
            const studentCount = await countAlunosTurma(turma.id)

            // Buscar professores vinculados
            const professores = await fetchProfessoresByTurma(turma.id)
            const professorCount = professores.length

            return {
              ...turma,
              student_count: studentCount,
              professor_count: professorCount,
              professores: professores,
            }
          } catch (error) {
            console.error(`Erro ao buscar dados da turma ${turma.id}:`, error)
            return {
              ...turma,
              student_count: 0,
              professor_count: 0,
              professores: [],
            }
          }
        }),
      )

      setTurmas(turmasWithCounts)
      setFilteredTurmas(turmasWithCounts)
    } catch (error: any) {
      console.error("Erro ao buscar turmas:", error)
      setError(error.message || "Erro ao carregar turmas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (schoolId) {
      fetchTurmas()
    }
  }, [schoolId])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTurmas(turmas)
    } else {
      const filtered = turmas.filter(
        (turma) =>
          turma.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          turma.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          turma.year.toString().includes(searchTerm) ||
          (turma.teacher_name && turma.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredTurmas(filtered)
    }
  }, [searchTerm, turmas])

  const handleDeleteClick = (turma: TurmaWithDetails) => {
    setSelectedTurma(turma)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedTurma) return

    setLoading(true)
    try {
      await deleteTurma(selectedTurma.id)
      await fetchTurmas() // Recarregar a lista após excluir
    } catch (error: any) {
      console.error("Erro ao excluir turma:", error)
      setError(error.message || "Erro ao excluir turma")
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleViewVinculos = async (turma: TurmaWithDetails) => {
    setSelectedTurma(turma)
    setLoadingVinculos(true)
    setVinculosDialogOpen(true)

    try {
      const vinculos = await fetchProfessoresByTurma(turma.id)
      setSelectedTurmaVinculos(vinculos)
    } catch (error) {
      console.error("Erro ao buscar vínculos:", error)
      setSelectedTurmaVinculos([])
    } finally {
      setLoadingVinculos(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar turmas..."
            className="pl-10 h-12 rounded-full border-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => router.push("/escola/turmas/nova")}
          variant="gradient"
          className="rounded-full h-12 px-6 font-medium"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Turma
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 rounded-t-lg border-b">
          <CardTitle className="text-xl text-gray-900">Turmas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && turmas.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-medium">{error}</div>
          ) : filteredTurmas.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              {searchTerm ? "Nenhuma turma encontrada para esta busca" : "Nenhuma turma cadastrada"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-medium text-gray-900">Curso</TableHead>
                    <TableHead className="font-medium text-gray-900">Turma</TableHead>
                    <TableHead className="font-medium text-gray-900">Ano Letivo</TableHead>
                    <TableHead className="font-medium text-gray-900">Professores Vinculados</TableHead>
                    <TableHead className="font-medium text-gray-900">Contagens</TableHead>
                    <TableHead className="w-[100px] font-medium text-gray-900">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTurmas.map((turma) => (
                    <TableRow key={turma.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-gray-900">{turma.course_name || "-"}</TableCell>
                      <TableCell className="text-gray-900">{turma.name}</TableCell>
                      <TableCell className="text-gray-900">{turma.year}</TableCell>
                      <TableCell className="text-gray-900">
                        {turma.professores && turma.professores.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {turma.professores.length <= 2 ? (
                              // Se houver até 2 professores, mostrar todos
                              turma.professores.map((vinculo, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3 text-primary" />
                                  <span>{vinculo.teachers?.profiles?.full_name || "Professor não encontrado"}</span>
                                  <span className="text-xs text-gray-500">
                                    ({vinculo.subjects?.name || "Disciplina não encontrada"})
                                  </span>
                                </div>
                              ))
                            ) : (
                              // Se houver mais de 2 professores, mostrar os 2 primeiros e indicar quantos mais
                              <>
                                {turma.professores.slice(0, 2).map((vinculo, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 text-primary" />
                                    <span>{vinculo.teachers?.profiles?.full_name || "Professor não encontrado"}</span>
                                    <span className="text-xs text-gray-500">
                                      ({vinculo.subjects?.name || "Disciplina não encontrada"})
                                    </span>
                                  </div>
                                ))}
                                <Button
                                  variant="link"
                                  className="text-xs text-primary p-0 h-auto justify-start"
                                  onClick={() => handleViewVinculos(turma)}
                                >
                                  + {turma.professores.length - 2} mais professores
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Nenhum professor vinculado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline" className="flex items-center gap-1 bg-primary/5 text-primary">
                            <Users className="h-3 w-3" />
                            <span>{turma.student_count || 0} alunos</span>
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-600">
                            <UserCheck className="h-3 w-3" />
                            <span>{turma.professor_count || 0} professores</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <NativeActionMenu
                          actions={[
                            {
                              label: "Editar",
                              icon: <Pencil className="h-4 w-4 text-primary" />,
                              href: `/escola/turmas/${turma.id}`,
                            },
                            {
                              label: "Dashboard",
                              icon: <Activity className="h-4 w-4 text-blue-600" />,
                              href: `/escola/turmas/${turma.id}/dashboard`,
                            },
                            {
                              label: "Ver Professores Vinculados",
                              icon: <UserCheck className="h-4 w-4 text-amber-600" />,
                              onClick: () => handleViewVinculos(turma),
                            },
                            {
                              label: "Excluir",
                              icon: <Trash2 className="h-4 w-4" />,
                              onClick: () => handleDeleteClick(turma),
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

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="shadow-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Tem certeza que deseja excluir a turma &quot;{selectedTurma?.name} ({selectedTurma?.year})&quot;? Esta
              ação não pode ser desfeita.
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

      {/* Modal de visualização de vínculos */}
      <Dialog open={vinculosDialogOpen} onOpenChange={setVinculosDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">
              Professores Vinculados à Turma {selectedTurma?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Total de {selectedTurmaVinculos.length} professor(es) vinculado(s) a esta turma.
            </DialogDescription>
          </DialogHeader>

          {loadingVinculos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedTurmaVinculos.length === 0 ? (
            <div className="py-6 text-center text-gray-600">
              Nenhum professor vinculado a esta turma.
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push("/escola/vinculos/novo")} className="text-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Vínculo
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-medium text-gray-900">Professor</TableHead>
                    <TableHead className="font-medium text-gray-900">Disciplina</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTurmaVinculos.map((vinculo, index) => (
                    <TableRow key={index} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-gray-900">
                        {vinculo.teachers?.profiles?.full_name || "Professor não encontrado"}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <Badge variant="outline" className="bg-primary/5 text-primary">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {vinculo.subjects?.name || "Disciplina não encontrada"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setVinculosDialogOpen(false)} className="font-medium">
              Fechar
            </Button>
            <Button variant="gradient" onClick={() => router.push("/escola/vinculos/novo")} className="font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Novo Vínculo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

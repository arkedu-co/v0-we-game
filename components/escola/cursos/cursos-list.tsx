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
import { Loader2, Search, Pencil, Trash2, Plus } from "lucide-react"
import { listCursos, deleteCurso } from "@/lib/services/curso-service"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Course } from "@/lib/types"
import { SimpleActionMenu } from "@/components/ui/simple-action-menu"

export function CursosList() {
  const [cursos, setCursos] = useState<Course[]>([])
  const [filteredCursos, setFilteredCursos] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<Course | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
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

  const fetchCursos = async () => {
    if (!schoolId) return

    setLoading(true)
    setError(null)
    try {
      const data = await listCursos(schoolId)
      setCursos(data)
      setFilteredCursos(data)
    } catch (error: any) {
      console.error("Erro ao buscar cursos:", error)
      setError(error.message || "Erro ao carregar cursos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (schoolId) {
      fetchCursos()
    }
  }, [schoolId])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCursos(cursos)
    } else {
      const filtered = cursos.filter(
        (curso) =>
          curso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          curso.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCursos(filtered)
    }
  }, [searchTerm, cursos])

  const handleDeleteClick = (curso: Course) => {
    setSelectedCurso(curso)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCurso) return

    setLoading(true)
    try {
      await deleteCurso(selectedCurso.id)
      await fetchCursos() // Recarregar a lista após excluir
    } catch (error: any) {
      console.error("Erro ao excluir curso:", error)
      setError(error.message || "Erro ao excluir curso")
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cursos..."
            className="pl-10 h-12 rounded-full border-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => router.push("/escola/cursos/novo")}
          variant="gradient"
          className="rounded-full h-12 px-6 font-medium"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Curso
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 rounded-t-lg border-b">
          <CardTitle className="text-xl text-gray-900">Cursos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && cursos.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-medium">{error}</div>
          ) : filteredCursos.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              {searchTerm ? "Nenhum curso encontrado para esta busca" : "Nenhum curso cadastrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-medium text-gray-900">Nome</TableHead>
                    <TableHead className="font-medium text-gray-900">Descrição</TableHead>
                    <TableHead className="w-[100px] font-medium text-gray-900">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCursos.map((curso) => (
                    <TableRow key={curso.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-gray-900">{curso.name}</TableCell>
                      <TableCell className="text-gray-900">{curso.description || "-"}</TableCell>
                      <TableCell>
                        <SimpleActionMenu
                          actions={[
                            {
                              label: "Editar",
                              href: `/escola/cursos/${curso.id}`,
                              icon: <Pencil className="h-4 w-4 mr-2 text-primary" />,
                            },
                            {
                              label: "Excluir",
                              onClick: () => handleDeleteClick(curso),
                              icon: <Trash2 className="h-4 w-4 mr-2" />,
                              className: "text-red-600",
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="shadow-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Tem certeza que deseja excluir o curso &quot;{selectedCurso?.name}&quot;? Esta ação não pode ser desfeita.
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
    </div>
  )
}

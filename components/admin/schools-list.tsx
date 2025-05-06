"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, MoreHorizontal, Pencil, Trash2, Key, Store, Plus } from "lucide-react"
import { listSchoolsWithStores, deleteSchool, resetSchoolPassword } from "@/lib/services/school-service"
import type { School, SchoolStore } from "@/lib/types"

export function SchoolsList() {
  const [schools, setSchools] = useState<(School & { store: SchoolStore | null })[]>([])
  const [filteredSchools, setFilteredSchools] = useState<(School & { store: SchoolStore | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const router = useRouter()

  const fetchSchools = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listSchoolsWithStores()
      setSchools(data)
      setFilteredSchools(data)
    } catch (error: any) {
      console.error("Erro ao buscar escolas:", error)
      setError(error.message || "Erro ao carregar escolas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSchools(schools)
    } else {
      const filtered = schools.filter(
        (school) =>
          school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredSchools(filtered)
    }
  }, [searchTerm, schools])

  const handleDeleteClick = (school: School) => {
    setSelectedSchool(school)
    setDeleteDialogOpen(true)
  }

  const handleResetPasswordClick = (school: School) => {
    setSelectedSchool(school)
    setResetPasswordDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedSchool) return

    setLoading(true)
    try {
      await deleteSchool(selectedSchool.id)
      await fetchSchools() // Recarregar a lista após excluir
    } catch (error: any) {
      console.error("Erro ao excluir escola:", error)
      setError(error.message || "Erro ao excluir escola")
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedSchool) return

    setLoading(true)
    try {
      await resetSchoolPassword(selectedSchool.id)
      // Mostrar mensagem de sucesso
      alert("Email de redefinição de senha enviado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error)
      setError(error.message || "Erro ao redefinir senha")
    } finally {
      setLoading(false)
      setResetPasswordDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar escolas..."
            className="pl-10 h-12 rounded-full border-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => router.push("/admin/escolas/nova")}
          variant="gradient"
          className="rounded-full h-12 px-6 font-medium"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Escola
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 rounded-t-lg border-b">
          <CardTitle className="text-xl text-gray-900">Escolas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-medium">{error}</div>
          ) : filteredSchools.length === 0 ? (
            <div className="py-12 text-center text-gray-600">Nenhuma escola encontrada</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-medium text-gray-900">Nome</TableHead>
                    <TableHead className="font-medium text-gray-900">Email</TableHead>
                    <TableHead className="font-medium text-gray-900">Telefone</TableHead>
                    <TableHead className="font-medium text-gray-900">Loja</TableHead>
                    <TableHead className="w-[100px] font-medium text-gray-900">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-gray-900">{school.name}</TableCell>
                      <TableCell className="text-gray-900">{school.email}</TableCell>
                      <TableCell className="text-gray-900">{school.phone || "-"}</TableCell>
                      <TableCell>
                        {school.store ? (
                          <div className="flex items-center">
                            <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium flex items-center">
                              <Store className="h-3 w-3 mr-1" />
                              <span>Ativa</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-medium">
                            Sem loja
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/admin/escolas/${school.id}`)}>
                              <Pencil className="h-4 w-4 mr-2 text-primary" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPasswordClick(school)}>
                              <Key className="h-4 w-4 mr-2 text-amber-600" />
                              Redefinir Senha
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(school)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              Tem certeza que deseja excluir a escola &quot;{selectedSchool?.name}&quot;? Esta ação não pode ser
              desfeita.
              <br />
              <br />
              <strong className="text-red-600 font-medium">
                Atenção: Esta ação também excluirá a loja da escola e todas as informações relacionadas.
              </strong>
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

      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent className="shadow-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900">Redefinir senha</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Deseja enviar um email de redefinição de senha para a escola &quot;{selectedSchool?.name}&quot;?
              <br />
              <br />
              Um link será enviado para o email {selectedSchool?.email} com instruções para criar uma nova senha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="font-medium">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={loading}
              variant="gradient"
              className="font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Sim, enviar email"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

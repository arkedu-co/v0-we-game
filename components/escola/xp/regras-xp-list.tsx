"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { listarRegrasXP, excluirRegraXP } from "@/lib/services/xp-service"
import { getSchoolIdFromSession } from "@/lib/utils/auth-helpers.client" // Importando da versão client

export default function RegrasXPList() {
  const [regras, setRegras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [regraToDelete, setRegraToDelete] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSchoolId = async () => {
      try {
        const id = await getSchoolIdFromSession()
        console.log("ID da escola obtido:", id)
        setSchoolId(id)
      } catch (error: any) {
        console.error("Erro ao obter ID da escola:", error)
        setError(`Não foi possível identificar a escola: ${error.message || "Erro desconhecido"}`)
        setLoading(false)
      }
    }

    fetchSchoolId()
  }, [])

  useEffect(() => {
    const fetchRegras = async () => {
      if (!schoolId) {
        // Não fazer nada se o schoolId ainda não estiver disponível
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log("Buscando regras para a escola:", schoolId)
        const data = await listarRegrasXP(schoolId)
        setRegras(data)
      } catch (error: any) {
        console.error("Erro ao carregar regras de XP:", error)
        setError(`Não foi possível carregar as regras de XP: ${error.message || "Erro desconhecido"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRegras()
  }, [schoolId])

  const handleDelete = async () => {
    if (!regraToDelete) return

    try {
      await excluirRegraXP(regraToDelete)
      setRegras(regras.filter((regra) => regra.id !== regraToDelete))
      setDeleteDialogOpen(false)
      setRegraToDelete(null)
    } catch (error: any) {
      console.error("Erro ao excluir regra de XP:", error)
      alert(`Erro ao excluir regra: ${error.message || "Erro desconhecido"}`)
    }
  }

  const confirmDelete = (id: string) => {
    setRegraToDelete(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Regras de XP</h2>
        <Button asChild>
          <Link href="/escola/xp/regras/nova">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Regra
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Carregando regras de XP...</div>
      ) : regras.length === 0 ? (
        <div className="text-center py-4">Nenhuma regra de XP cadastrada. Clique em "Nova Regra" para começar.</div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor de XP</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regras.map((regra) => (
                <TableRow key={regra.id}>
                  <TableCell className="font-medium">{regra.nome || regra.name}</TableCell>
                  <TableCell>{regra.descricao || regra.description}</TableCell>
                  <TableCell>{regra.valor_xp || regra.xp_value}</TableCell>
                  <TableCell>{regra.frequencia || regra.frequency || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/escola/xp/regras/${regra.id}/editar`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => confirmDelete(regra.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta regra de XP? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

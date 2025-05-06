"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Subject } from "@/lib/types"
import { fetchDisciplinas, deleteDisciplina } from "@/lib/services/disciplina-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Trash, Edit, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface DisciplinasListProps {
  escolaId: string
}

export function DisciplinasList({ escolaId }: DisciplinasListProps) {
  const [disciplinas, setDisciplinas] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadDisciplinas = async () => {
      try {
        const data = await fetchDisciplinas(escolaId)
        setDisciplinas(data)
      } catch (err) {
        setError("Erro ao carregar disciplinas")
        console.error("Erro ao buscar disciplinas:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDisciplinas()
  }, [escolaId])

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta disciplina?")) {
      try {
        const result = await deleteDisciplina(id)
        if (result.success) {
          setDisciplinas(disciplinas.filter((disciplina) => disciplina.id !== id))
          toast.success("Disciplina excluída com sucesso")
        } else {
          toast.error("Erro ao excluir disciplina")
        }
      } catch (err) {
        toast.error("Erro ao excluir disciplina")
        console.error("Erro ao excluir disciplina:", err)
      }
    }
  }

  if (loading) {
    return <div className="text-center p-4">Carregando disciplinas...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Disciplinas</CardTitle>
        <Button onClick={() => router.push("/escola/disciplinas/nova")}>
          <Plus className="h-4 w-4 mr-2" /> Nova Disciplina
        </Button>
      </CardHeader>
      <CardContent>
        {disciplinas.length === 0 ? (
          <div className="text-center p-4">Nenhuma disciplina cadastrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-right p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {disciplinas.map((disciplina) => (
                  <tr key={disciplina.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{disciplina.name}</td>
                    <td className="p-2">{disciplina.description || "-"}</td>
                    <td className="p-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/escola/disciplinas/${disciplina.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/escola/disciplinas/${disciplina.id}/editar`)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(disciplina.id)} className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

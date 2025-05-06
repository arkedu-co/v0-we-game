"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchVinculos, deleteVinculo } from "@/lib/services/vinculo-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface VinculosListProps {
  escolaId: string
}

export function VinculosList({ escolaId }: VinculosListProps) {
  const [vinculos, setVinculos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadVinculos = async () => {
      try {
        const data = await fetchVinculos(escolaId)
        setVinculos(data)
      } catch (err) {
        setError("Erro ao carregar vínculos")
        console.error("Erro ao buscar vínculos:", err)
      } finally {
        setLoading(false)
      }
    }

    loadVinculos()
  }, [escolaId])

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este vínculo?")) {
      try {
        const result = await deleteVinculo(id)
        if (result.success) {
          setVinculos(vinculos.filter((vinculo) => vinculo.id !== id))
          toast.success("Vínculo excluído com sucesso")
        } else {
          toast.error("Erro ao excluir vínculo")
        }
      } catch (err) {
        toast.error("Erro ao excluir vínculo")
        console.error("Erro ao excluir vínculo:", err)
      }
    }
  }

  if (loading) {
    return <div className="text-center p-4">Carregando vínculos...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vínculos de Professores, Turmas e Disciplinas</CardTitle>
        <Button onClick={() => router.push("/escola/vinculos/novo")}>
          <Plus className="h-4 w-4 mr-2" /> Novo Vínculo
        </Button>
      </CardHeader>
      <CardContent>
        {vinculos.length === 0 ? (
          <div className="text-center p-4">Nenhum vínculo cadastrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Professor</th>
                  <th className="text-left p-2">Turma</th>
                  <th className="text-left p-2">Disciplina</th>
                  <th className="text-right p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vinculos.map((vinculo) => (
                  <tr key={vinculo.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{vinculo.teachers?.profiles?.full_name}</td>
                    <td className="p-2">{vinculo.classes?.name}</td>
                    <td className="p-2">{vinculo.subjects?.name}</td>
                    <td className="p-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(vinculo.id)} className="text-red-600">
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

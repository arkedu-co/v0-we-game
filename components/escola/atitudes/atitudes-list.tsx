"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Edit, Plus, Trash } from "lucide-react"
import { listarAtitudes, excluirAtitude } from "@/lib/services/atitude-service"
import type { Attitude } from "@/lib/types"

export default function AtitudesList() {
  const router = useRouter()
  const [atitudes, setAtitudes] = useState<Attitude[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAtitudes = async () => {
      try {
        setLoading(true)
        const data = await listarAtitudes()
        setAtitudes(data)
      } catch (error) {
        console.error("Erro ao carregar atitudes:", error)
        setError("Não foi possível carregar a lista de atitudes.")
      } finally {
        setLoading(false)
      }
    }

    fetchAtitudes()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta atitude?")) {
      try {
        await excluirAtitude(id)
        setAtitudes((prev) => prev.filter((atitude) => atitude.id !== id))
      } catch (error) {
        console.error("Erro ao excluir atitude:", error)
        alert("Não foi possível excluir a atitude.")
      }
    }
  }

  const getTipoLabel = (tipo: string) => {
    return tipo === "positive" ? "Positiva" : "Negativa"
  }

  const getRecompensaLabel = (tipo: string) => {
    switch (tipo) {
      case "xp":
        return "XP"
      case "atoms":
        return "Átomos"
      case "both":
        return "XP e Átomos"
      default:
        return "Nenhuma"
    }
  }

  const renderRecompensaValor = (atitude: Attitude) => {
    const rewardType = atitude.reward_type || atitude.recompensa_tipo

    if (rewardType === "xp") {
      return `${atitude.reward_value_xp || atitude.valor_xp || atitude.reward_value || 0} XP`
    } else if (rewardType === "atoms") {
      return `${atitude.reward_value_atoms || atitude.valor_atoms || atitude.reward_value || 0} Átomos`
    } else if (rewardType === "both") {
      return (
        <>
          <div>{atitude.reward_value_xp || atitude.valor_xp || 0} XP</div>
          <div>{atitude.reward_value_atoms || atitude.valor_atoms || 0} Átomos</div>
        </>
      )
    }

    return "N/A"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atitudes</CardTitle>
        <Button onClick={() => router.push("/escola/atitudes/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atitude
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : atitudes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma atitude cadastrada.</p>
            <Button variant="link" onClick={() => router.push("/escola/atitudes/nova")}>
              Cadastrar primeira atitude
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atitudes.map((atitude) => (
                  <TableRow key={atitude.id}>
                    <TableCell className="font-medium">{atitude.name || atitude.nome}</TableCell>
                    <TableCell>
                      <Badge
                        variant={atitude.type === "positive" || atitude.tipo === "positive" ? "success" : "destructive"}
                      >
                        {getTipoLabel(atitude.type || atitude.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRecompensaLabel(atitude.reward_type || atitude.recompensa_tipo)}</TableCell>
                    <TableCell>{renderRecompensaValor(atitude)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/escola/atitudes/${atitude.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(atitude.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

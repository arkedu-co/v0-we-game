"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getMovimentosEstoque } from "@/lib/services/loja-service"
import { EstoqueForm } from "./estoque-form"
import type { StoreInventoryMovement } from "@/lib/types"
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, RefreshCcw, Search, Loader2 } from "lucide-react"

interface EstoqueListProps {
  escolaId: string
}

export function EstoqueList({ escolaId }: EstoqueListProps) {
  const [movimentos, setMovimentos] = useState<StoreInventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [tipoMovimento, setTipoMovimento] = useState<string>("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    carregarMovimentos()
  }, [escolaId])

  async function carregarMovimentos() {
    try {
      setLoading(true)
      setError(null)
      const data = await getMovimentosEstoque(escolaId)
      setMovimentos(data)
    } catch (error) {
      console.error("Erro ao carregar movimentos de estoque:", error)
      setError("Não foi possível carregar os movimentos de estoque. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleNovoMovimento = () => {
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    carregarMovimentos()
  }

  // Filtrar movimentos
  const movimentosFiltrados = movimentos.filter((movimento) => {
    const matchesFiltro =
      movimento.product?.name.toLowerCase().includes(filtro.toLowerCase()) ||
      movimento.reason?.toLowerCase().includes(filtro.toLowerCase())

    const matchesTipo = tipoMovimento === "todos" || movimento.movement_type === tipoMovimento

    return matchesFiltro && matchesTipo
  })

  // Paginação
  const totalPages = Math.ceil(movimentosFiltrados.length / itemsPerPage)
  const paginatedMovimentos = movimentosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Renderizar ícone de acordo com o tipo de movimento
  const renderMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />
      case "out":
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />
      case "adjustment":
        return <RefreshCcw className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando movimentos de estoque...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={carregarMovimentos}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showForm ? (
        <EstoqueForm escolaId={escolaId} onClose={handleFormClose} />
      ) : (
        <div className="flex justify-end">
          <Button onClick={handleNovoMovimento}>Registrar Movimento</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Movimentos de Estoque</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar produto ou motivo..."
                className="pl-8"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            <Select value={tipoMovimento} onValueChange={setTipoMovimento} className="w-full sm:w-48">
              <option value="todos">Todos os tipos</option>
              <option value="in">Entradas</option>
              <option value="out">Saídas</option>
              <option value="adjustment">Ajustes</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Produto</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Quantidade</th>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovimentos.length > 0 ? (
                  paginatedMovimentos.map((movimento) => (
                    <tr key={movimento.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{movimento.product?.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {renderMovementIcon(movimento.movement_type)}
                          <span className="ml-2">
                            {movimento.movement_type === "in"
                              ? "Entrada"
                              : movimento.movement_type === "out"
                                ? "Saída"
                                : "Ajuste"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={movimento.movement_type === "out" ? "text-red-500" : "text-green-500"}>
                          {movimento.movement_type === "out" ? "-" : "+"}
                          {movimento.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(movimento.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4">{movimento.reason || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum movimento de estoque encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(currentPage * itemsPerPage, movimentosFiltrados.length)} de {movimentosFiltrados.length}{" "}
                registros
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProduto, getMovimentosEstoque } from "@/lib/services/loja-service"
import type { StoreProduct, StoreInventoryMovement } from "@/lib/types"
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, RefreshCcw, Package, Loader2 } from "lucide-react"
import { EstoqueForm } from "./estoque-form"

interface EstoqueProdutoDetalhesProps {
  escolaId: string
  produtoId: string
}

export function EstoqueProdutoDetalhes({ escolaId, produtoId }: EstoqueProdutoDetalhesProps) {
  const [produto, setProduto] = useState<StoreProduct | null>(null)
  const [movimentos, setMovimentos] = useState<StoreInventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true)
        setError(null)

        const [produtoData, movimentosData] = await Promise.all([
          getProduto(produtoId),
          getMovimentosEstoque(escolaId, produtoId),
        ])

        setProduto(produtoData)
        setMovimentos(movimentosData)
      } catch (error) {
        console.error("Erro ao carregar dados do produto:", error)
        setError("Não foi possível carregar os dados do produto. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [escolaId, produtoId])

  const handleNovoMovimento = () => {
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    // Recarregar dados após registrar um novo movimento
    carregarDados()
  }

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)

      const [produtoData, movimentosData] = await Promise.all([
        getProduto(produtoId),
        getMovimentosEstoque(escolaId, produtoId),
      ])

      setProduto(produtoData)
      setMovimentos(movimentosData)
    } catch (error) {
      console.error("Erro ao carregar dados do produto:", error)
      setError("Não foi possível carregar os dados do produto. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

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
        <span className="ml-2 text-lg">Carregando dados do produto...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={carregarDados}>Tentar novamente</Button>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-amber-500 mb-2">Produto não encontrado</h3>
        <p className="text-gray-600 mb-4">O produto solicitado não foi encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <EstoqueForm escolaId={escolaId} onClose={handleFormClose} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {produto.image_url ? (
                <img
                  src={produto.image_url || "/placeholder.svg"}
                  alt={produto.name}
                  className="w-10 h-10 object-cover rounded mr-3"
                />
              ) : (
                <Package className="w-10 h-10 text-gray-400 mr-3" />
              )}
              {produto.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Estoque Atual</div>
                <div className="text-2xl font-bold mt-1">{produto.stock_quantity} unidades</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Preço</div>
                <div className="text-2xl font-bold mt-1">
                  {produto.price_type === "atoms" ? `${produto.price} átomos` : `R$ ${produto.price.toFixed(2)}`}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-2xl font-bold mt-1">
                  {produto.active ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-red-600">Inativo</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button onClick={handleNovoMovimento}>Registrar Movimento</Button>
            </div>

            <h3 className="text-lg font-medium mb-4">Histórico de Movimentos</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-left py-3 px-4">Quantidade</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.length > 0 ? (
                    movimentos.map((movimento) => (
                      <tr key={movimento.id} className="border-b hover:bg-gray-50">
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
                            {Math.abs(movimento.quantity)}
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
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        Nenhum movimento de estoque registrado para este produto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

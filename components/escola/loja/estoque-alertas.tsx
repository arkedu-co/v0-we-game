"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProdutos } from "@/lib/services/loja-service"
import type { StoreProduct } from "@/lib/types"
import { AlertCircle, AlertTriangle, Package, Loader2 } from "lucide-react"
import Link from "next/link"

interface EstoqueAlertasProps {
  escolaId: string
  limiteEstoqueBaixo?: number
}

export function EstoqueAlertas({ escolaId, limiteEstoqueBaixo = 10 }: EstoqueAlertasProps) {
  const [produtos, setProdutos] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setLoading(true)
        setError(null)
        const data = await getProdutos(escolaId)
        setProdutos(data)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
        setError("Não foi possível carregar os produtos. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [escolaId])

  // Filtrar produtos com estoque baixo
  const produtosEstoqueBaixo = produtos.filter(
    (produto) => produto.active && produto.stock_quantity < limiteEstoqueBaixo,
  )

  // Classificar por urgência (estoque mais baixo primeiro)
  const produtosOrdenados = [...produtosEstoqueBaixo].sort((a, b) => a.stock_quantity - b.stock_quantity)

  // Determinar nível de alerta com base no estoque
  const getNivelAlerta = (quantidade: number) => {
    if (quantidade === 0) return "critico"
    if (quantidade < limiteEstoqueBaixo / 3) return "alto"
    if (quantidade < limiteEstoqueBaixo / 1.5) return "medio"
    return "baixo"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verificando alertas de estoque...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
        <span>{error}</span>
      </div>
    )
  }

  if (produtosEstoqueBaixo.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
        <Package className="h-5 w-5 mr-2" />
        <span>Todos os produtos estão com estoque adequado.</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="flex items-center text-amber-800">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Alertas de Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Produto</th>
                <th className="text-left py-3 px-4">Estoque Atual</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {produtosOrdenados.map((produto) => {
                const nivelAlerta = getNivelAlerta(produto.stock_quantity)

                return (
                  <tr key={produto.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {produto.image_url ? (
                          <img
                            src={produto.image_url || "/placeholder.svg"}
                            alt={produto.name}
                            className="w-8 h-8 object-cover rounded mr-2"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400 mr-2" />
                        )}
                        <span>{produto.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{produto.stock_quantity}</span> unidades
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          nivelAlerta === "critico"
                            ? "bg-red-100 text-red-800"
                            : nivelAlerta === "alto"
                              ? "bg-orange-100 text-orange-800"
                              : nivelAlerta === "medio"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {nivelAlerta === "critico"
                          ? "Crítico"
                          : nivelAlerta === "alto"
                            ? "Muito baixo"
                            : nivelAlerta === "medio"
                              ? "Baixo"
                              : "Atenção"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/escola/loja/produtos/${produto.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Produto
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

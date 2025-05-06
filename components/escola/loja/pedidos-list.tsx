"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPedidos } from "@/lib/services/loja-service"
import type { StoreOrder } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PedidosListProps {
  escolaId?: string
  pedidos?: StoreOrder[]
}

export function PedidosList({ escolaId, pedidos: initialPedidos }: PedidosListProps) {
  const [pedidos, setPedidos] = useState<StoreOrder[]>(initialPedidos || [])
  const [loading, setLoading] = useState(!initialPedidos)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If pedidos were provided as props, use them directly
    if (initialPedidos && initialPedidos.length > 0) {
      setPedidos(initialPedidos)
      setLoading(false)
      return
    }

    // Otherwise, fetch pedidos if escolaId is provided
    async function carregarPedidos() {
      try {
        setLoading(true)
        // Add validation to ensure escolaId is defined
        if (!escolaId) {
          throw new Error("ID da escola não fornecido")
        }

        console.log("Carregando pedidos para escola:", escolaId)
        const data = await getPedidos(escolaId)
        setPedidos(data)
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err)
        setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (escolaId) {
      carregarPedidos()
    }
  }, [escolaId, initialPedidos])

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pago
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelado
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Entregue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Carregando pedidos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pedidos</CardTitle>
        <Link href="/escola/loja/pedidos/novo">
          <Button size="sm">Novo Pedido</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {pedidos.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Pedido #{pedido.id.substring(0, 8)}</h3>
                    {getStatusBadge(pedido.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(pedido.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm">
                    Aluno: {pedido.student?.full_name || pedido.student?.registration_number || "Não informado"}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
                  <p className="font-medium">{formatCurrency(pedido.total_amount)}</p>
                  <Link href={`/escola/loja/pedidos/${pedido.id}`} className="w-full md:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

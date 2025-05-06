"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { StoreOrder, OrderStatus, PaymentStatus } from "@/lib/types"
import { updateOrderStatus, updatePaymentStatus } from "@/lib/services/loja-service"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PedidoDetalhesProps {
  pedido: StoreOrder
}

export function PedidoDetalhes({ pedido }: PedidoDetalhesProps) {
  const router = useRouter()
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(pedido.order_status)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(pedido.payment_status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdateOrderStatus = async () => {
    if (orderStatus === pedido.order_status) return

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateOrderStatus(pedido.id, orderStatus)
      if (updated) {
        setSuccess("Status do pedido atualizado com sucesso!")
      } else {
        setError("Erro ao atualizar status do pedido. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro ao atualizar status do pedido:", err)
      setError("Ocorreu um erro ao atualizar o status do pedido.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePaymentStatus = async () => {
    if (paymentStatus === pedido.payment_status) return

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await updatePaymentStatus(pedido.id, paymentStatus)
      if (updated) {
        setSuccess("Status do pagamento atualizado com sucesso!")
      } else {
        setError("Erro ao atualizar status do pagamento. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro ao atualizar status do pagamento:", err)
      setError("Ocorreu um erro ao atualizar o status do pagamento.")
    } finally {
      setIsUpdating(false)
    }
  }

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Em processamento
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Concluído
          </Badge>
        )
      case "delivered":
        return <Badge className="bg-green-500">Entregue</Badge>
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        )
      case "paid":
        return <Badge className="bg-green-500">Pago</Badge>
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelado
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Reembolsado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "atoms":
        return "Átomos"
      case "cash":
        return "Dinheiro"
      case "credit_card":
        return "Cartão de Crédito"
      case "debit_card":
        return "Cartão de Débito"
      case "pix":
        return "PIX"
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/escola/loja/pedidos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Pedidos
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Pedido #{pedido.id.substring(0, 8)}</span>
              <div className="flex gap-2">
                {getOrderStatusBadge(pedido.order_status)}
                {getPaymentStatusBadge(pedido.payment_status)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Informações do Pedido</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Data do Pedido</p>
                  <p>{formatDate(pedido.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Pagamento</p>
                  <p>{getPaymentMethodText(pedido.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status do Pedido</p>
                  <p>{getOrderStatusBadge(pedido.order_status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status do Pagamento</p>
                  <p>{getPaymentStatusBadge(pedido.payment_status)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Itens do Pedido</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Produto
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantidade
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Preço Unitário
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pedido.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.price_type === "atoms" ? `${item.unit_price} átomos` : formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.price_type === "atoms"
                            ? `${item.unit_price * item.quantity} átomos`
                            : formatCurrency(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        {pedido.payment_method === "atoms"
                          ? `${pedido.total_amount} átomos`
                          : formatCurrency(pedido.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {pedido.notes && (
              <div>
                <h3 className="text-lg font-medium mb-2">Observações</h3>
                <p className="text-gray-700">{pedido.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{pedido.student?.profile?.full_name}</p>
                <p className="text-sm text-gray-500">{pedido.student?.profile?.email}</p>
                <p className="text-sm text-gray-500">Matrícula: {pedido.student?.registration_number}</p>
                <p className="text-sm text-gray-500">Turma: {pedido.student?.class}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atualizar Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Status do Pedido</p>
                <Select value={orderStatus} onValueChange={(value) => setOrderStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="processing">Em processamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full mt-2"
                  onClick={handleUpdateOrderStatus}
                  disabled={isUpdating || orderStatus === pedido.order_status}
                >
                  Atualizar Status do Pedido
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Status do Pagamento</p>
                <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full mt-2"
                  onClick={handleUpdatePaymentStatus}
                  disabled={isUpdating || paymentStatus === pedido.payment_status}
                >
                  Atualizar Status do Pagamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

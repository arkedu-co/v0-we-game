"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { atualizarStatusEntrega } from "@/lib/services/loja-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Package, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

interface EntregaDetalhesProps {
  entrega: any
}

export function EntregaDetalhes({ entrega }: EntregaDetalhesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [observacoes, setObservacoes] = useState(entrega.observacoes || "")

  async function handleUpdateStatus(novoStatus: string) {
    if (!confirm(`Deseja realmente alterar o status da entrega para ${getStatusName(novoStatus)}?`)) {
      return
    }

    try {
      setLoading(true)
      await atualizarStatusEntrega(entrega.id, novoStatus, observacoes)
      alert("Status da entrega atualizado com sucesso!")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar status da entrega:", error)
      alert("Erro ao atualizar status da entrega. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  function getStatusName(status: string) {
    switch (status) {
      case "pendente":
        return "Pendente"
      case "em_separacao":
        return "Em Separação"
      case "em_transito":
        return "Em Trânsito"
      case "entregue":
        return "Entregue"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pendente":
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>
      case "em_separacao":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Em Separação</Badge>
      case "em_transito":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Em Trânsito</Badge>
      case "entregue":
        return <Badge className="bg-green-50 text-green-700 border-green-200">Entregue</Badge>
      case "cancelada":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/escola/loja/entregas" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para lista de entregas
        </Link>
        {getStatusBadge(entrega.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">ID da Entrega:</dt>
                <dd>{entrega.id.substring(0, 8)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">ID do Pedido:</dt>
                <dd>{entrega.order_id.substring(0, 8)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Data de Criação:</dt>
                <dd>{formatDate(entrega.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Status:</dt>
                <dd>{getStatusName(entrega.status)}</dd>
              </div>
              {entrega.updated_at && (
                <div className="flex justify-between">
                  <dt className="font-medium">Última Atualização:</dt>
                  <dd>{formatDate(entrega.updated_at)}</dd>
                </div>
              )}
              {entrega.delivered_at && (
                <div className="flex justify-between">
                  <dt className="font-medium">Data de Entrega:</dt>
                  <dd>{formatDate(entrega.delivered_at)}</dd>
                </div>
              )}
              {entrega.delivered_by && (
                <div className="flex justify-between">
                  <dt className="font-medium">Entregue por:</dt>
                  <dd>{entrega.delivered_by}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Aluno</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Nome:</dt>
                <dd>{entrega.student_name || "Não disponível"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Matrícula:</dt>
                <dd>{entrega.student_registration || "Não disponível"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Turma:</dt>
                <dd>{entrega.student_class || "Não disponível"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Série:</dt>
                <dd>{entrega.student_grade || "Não disponível"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Produto</th>
                  <th className="py-2 px-4 text-right">Quantidade</th>
                  <th className="py-2 px-4 text-right">Preço Unitário</th>
                  <th className="py-2 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {entrega.items?.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{item.product_name}</td>
                    <td className="py-2 px-4 text-right">{item.quantity}</td>
                    <td className="py-2 px-4 text-right">
                      {item.price_type === "atoms" ? `${item.price} átomos` : formatCurrency(item.price)}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {item.price_type === "atoms"
                        ? `${item.price * item.quantity} átomos`
                        : formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td colSpan={3} className="py-2 px-4 text-right">
                    Total:
                  </td>
                  <td className="py-2 px-4 text-right">
                    {entrega.total_price_type === "atoms"
                      ? `${entrega.total_price} átomos`
                      : formatCurrency(entrega.total_price)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre a entrega..."
                className="w-full"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {entrega.status === "pendente" && (
                <Button
                  onClick={() => handleUpdateStatus("em_separacao")}
                  disabled={loading}
                  className="flex items-center"
                >
                  <Package className="h-4 w-4 mr-2" /> Iniciar Separação
                </Button>
              )}

              {entrega.status === "em_separacao" && (
                <Button onClick={() => handleUpdateStatus("entregue")} disabled={loading} className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Entregue
                </Button>
              )}

              {entrega.status === "em_transito" && (
                <Button onClick={() => handleUpdateStatus("entregue")} disabled={loading} className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> Confirmar Entrega
                </Button>
              )}

              {["pendente", "em_separacao", "em_transito"].includes(entrega.status) && (
                <Button
                  onClick={() => handleUpdateStatus("cancelada")}
                  disabled={loading}
                  variant="destructive"
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-2" /> Cancelar Entrega
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <input
                type="checkbox"
                id="check-produtos"
                className="mt-1 mr-2"
                disabled={entrega.status === "entregue" || entrega.status === "cancelada"}
              />
              <label htmlFor="check-produtos" className="text-sm">
                Todos os produtos foram separados e conferidos
              </label>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                id="check-embalagem"
                className="mt-1 mr-2"
                disabled={entrega.status === "entregue" || entrega.status === "cancelada"}
              />
              <label htmlFor="check-embalagem" className="text-sm">
                Produtos foram embalados adequadamente
              </label>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                id="check-aluno"
                className="mt-1 mr-2"
                disabled={entrega.status === "entregue" || entrega.status === "cancelada"}
              />
              <label htmlFor="check-aluno" className="text-sm">
                Aluno foi identificado corretamente
              </label>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                id="check-recebimento"
                className="mt-1 mr-2"
                disabled={entrega.status === "entregue" || entrega.status === "cancelada"}
              />
              <label htmlFor="check-recebimento" className="text-sm">
                Aluno confirmou o recebimento dos produtos
              </label>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

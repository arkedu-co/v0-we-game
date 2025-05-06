"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getEntregas, atualizarStatusEntrega } from "@/lib/services/loja-service"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight, CheckCircle, Package } from "lucide-react"

interface EntregasListProps {
  escolaId?: string
  entregas?: any[]
}

export function EntregasList({ escolaId, entregas: initialEntregas }: EntregasListProps) {
  const [entregas, setEntregas] = useState<any[]>(initialEntregas || [])
  const [loading, setLoading] = useState(!initialEntregas)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Se as entregas foram fornecidas como props, use-as diretamente
    if (initialEntregas && initialEntregas.length > 0) {
      setEntregas(initialEntregas)
      setLoading(false)
      return
    }

    // Caso contrário, busque as entregas se escolaId for fornecido
    if (escolaId) {
      carregarEntregas()
    }
  }, [escolaId, initialEntregas])

  async function carregarEntregas() {
    if (!escolaId) {
      setError("ID da escola não fornecido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getEntregas(escolaId)
      setEntregas(data)
      setError(null)
    } catch (error) {
      console.error("Erro ao carregar entregas:", error)
      setError("Falha ao carregar entregas. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(entregaId: string, novoStatus: string) {
    try {
      await atualizarStatusEntrega(entregaId, novoStatus)
      // Atualizar a lista de entregas
      setEntregas((prevEntregas) =>
        prevEntregas.map((entrega) => (entrega.id === entregaId ? { ...entrega, status: novoStatus } : entrega)),
      )
    } catch (error) {
      console.error("Erro ao atualizar status da entrega:", error)
      alert("Erro ao atualizar status da entrega. Tente novamente.")
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        )
      case "em_separacao":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Em Separação
          </Badge>
        )
      case "em_transito":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Em Trânsito
          </Badge>
        )
      case "entregue":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Entregue
          </Badge>
        )
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function getNextStatusButton(entrega: any) {
    switch (entrega.status) {
      case "pendente":
        return (
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={() => handleUpdateStatus(entrega.id, "em_separacao")}
          >
            <Package className="h-4 w-4 mr-1" /> Iniciar Separação
          </Button>
        )
      case "em_separacao":
        return (
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={() => handleUpdateStatus(entrega.id, "entregue")}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Marcar como Entregue
          </Button>
        )
      case "em_transito":
        return (
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={() => handleUpdateStatus(entrega.id, "entregue")}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Confirmar Entrega
          </Button>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Carregando entregas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <p>{error}</p>
        <Button onClick={carregarEntregas} className="mt-2" variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (entregas.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Nenhuma entrega encontrada</h3>
        <p className="mt-2 text-gray-500">Não há entregas pendentes ou realizadas no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entregas.map((entrega) => (
        <Card key={entrega.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">Entrega #{entrega.id.substring(0, 8)}</h3>
                  <span className="mx-2">•</span>
                  {getStatusBadge(entrega.status)}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <p>Pedido: #{entrega.order_id.substring(0, 8)}</p>
                  <p>Data: {formatDate(entrega.created_at)}</p>
                  <p>Aluno: {entrega.student_name || "Nome não disponível"}</p>
                </div>
              </div>
              <div className="flex items-center">
                {getNextStatusButton(entrega)}
                <Link href={`/escola/loja/entregas/${entrega.id}`} passHref>
                  <Button size="sm" variant="ghost" className="ml-2">
                    Detalhes <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

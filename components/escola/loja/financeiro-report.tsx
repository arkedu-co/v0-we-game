"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFinanceiroData } from "@/lib/services/loja-service"
import { Loader2, AlertCircle, TrendingUp, ShoppingBag, CreditCard } from "lucide-react"

interface FinanceiroReportProps {
  storeId: string
}

export function FinanceiroReport({ storeId }: FinanceiroReportProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const financialData = await getFinanceiroData(storeId)
        setData(financialData)
      } catch (err) {
        console.error("Erro ao carregar dados financeiros:", err)
        setError("Não foi possível carregar os dados financeiros. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [storeId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando dados financeiros...</span>
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

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Renderizar os dados financeiros
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-3xl font-bold">
                {data?.totalRevenue !== undefined ? formatCurrency(data.totalRevenue) : "R$ 0,00"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-3xl font-bold">{data?.totalOrders || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-purple-500 mr-2" />
              <p className="text-3xl font-bold">
                {data?.averageTicket !== undefined ? formatCurrency(data.averageTicket) : "R$ 0,00"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data?.topProducts && data.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{index + 1}.</span>
                    <span className="ml-2">{product.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{product.quantity} unidades</span>
                    <span className="text-green-600">{formatCurrency(product.total_revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!data?.topProducts || data.topProducts.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nenhum produto vendido ainda.</p>
          </CardContent>
        </Card>
      )}

      {data?.paymentMethods && data.paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.paymentMethods.map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="capitalize">{payment.method}</span>
                  <span className="font-medium">{payment.count} pedidos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

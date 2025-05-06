"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProdutos, getPedidos, getMovimentosEstoque } from "@/lib/services/loja-service"
import type { StoreProduct, StoreOrder, StoreInventoryMovement } from "@/lib/types"
import { Package, ShoppingCart, TrendingUp, Truck, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface LojaDashboardProps {
  escolaId: string
}

export function LojaDashboard({ escolaId }: LojaDashboardProps) {
  const [produtos, setProdutos] = useState<StoreProduct[]>([])
  const [pedidos, setPedidos] = useState<StoreOrder[]>([])
  const [movimentos, setMovimentos] = useState<StoreInventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true)
        setError(null)

        // Verificar se o escolaId está definido
        if (!escolaId) {
          console.error("Erro ao carregar dados da loja: escolaId is undefined or null")
          setError("ID da escola não fornecido")
          setLoading(false)
          return
        }

        try {
          const [produtosData, pedidosData, movimentosData] = await Promise.all([
            getProdutos(escolaId),
            getPedidos(escolaId),
            getMovimentosEstoque(escolaId),
          ])

          setProdutos(produtosData)
          setPedidos(pedidosData)
          setMovimentos(movimentosData)
        } catch (error) {
          console.error("Erro ao carregar dados da loja:", error)
          setError("Não foi possível carregar os dados da loja. Tente novamente mais tarde.")
        } finally {
          setLoading(false)
        }
      } catch (error) {
        console.error("Erro ao carregar dados da loja:", error)
        setError("Não foi possível carregar os dados da loja. Tente novamente mais tarde.")
        setLoading(false)
      }
    }

    if (escolaId) {
      carregarDados()
    } else {
      setLoading(false)
      setError("ID da escola não fornecido")
    }
  }, [escolaId])

  const produtosAtivos = produtos.filter((p) => p.active).length
  const produtosComEstoqueBaixo = produtos.filter((p) => p.stock_quantity < 10).length
  const pedidosPendentes = pedidos.filter((p) => p.status === "pending").length
  const pedidosHoje = pedidos.filter((p) => {
    const hoje = new Date().toISOString().split("T")[0]
    return p.created_at.startsWith(hoje)
  }).length

  const calcularVendasTotais = () => {
    return pedidos.filter((p) => p.status !== "cancelled").reduce((total, pedido) => total + pedido.total_amount, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando dados da loja...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{produtosAtivos}</div>
            <p className="text-sm text-muted-foreground">
              {produtosComEstoqueBaixo > 0 && (
                <span className="text-amber-500">{produtosComEstoqueBaixo} com estoque baixo</span>
              )}
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/escola/loja/produtos">
              <Button variant="outline" size="sm">
                Ver produtos
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pedidosPendentes}</div>
            <p className="text-sm text-muted-foreground">{pedidosHoje} pedidos hoje</p>
          </CardContent>
          <CardFooter>
            <Link href="/escola/loja/pedidos">
              <Button variant="outline" size="sm">
                Ver pedidos
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {calcularVendasTotais().toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Total acumulado</p>
          </CardContent>
          <CardFooter>
            <Link href="/escola/loja/financeiro">
              <Button variant="outline" size="sm">
                Ver relatórios
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Truck className="mr-2 h-5 w-5 text-primary" />
              Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pedidos.filter((p) => p.status === "paid").length}</div>
            <p className="text-sm text-muted-foreground">Aguardando entrega</p>
          </CardContent>
          <CardFooter>
            <Link href="/escola/loja/entregas">
              <Button variant="outline" size="sm">
                Ver entregas
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs com dados recentes */}
      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">Produtos Recentes</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos Recentes</TabsTrigger>
          <TabsTrigger value="movimentos">Movimentos de Estoque</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Recentes</CardTitle>
              <CardDescription>Os últimos produtos adicionados à loja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {produtos.slice(0, 5).map((produto) => (
                  <div key={produto.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-medium">{produto.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {produto.stock_quantity} |
                        {produto.price_type === "atoms"
                          ? ` ${produto.price} átomos`
                          : ` R$ ${produto.price.toFixed(2)}`}
                      </p>
                    </div>
                    <Link href={`/escola/loja/produtos/${produto.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/escola/loja/produtos">
                <Button>Ver todos os produtos</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Os últimos pedidos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pedidos.slice(0, 5).map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-medium">Pedido #{pedido.id.substring(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pedido.student?.name} |
                        {pedido.payment_type === "atoms"
                          ? ` ${pedido.total_amount} átomos`
                          : pedido.payment_type === "real"
                            ? ` R$ ${pedido.total_amount.toFixed(2)}`
                            : ` Misto: R$ ${pedido.total_amount.toFixed(2)}`}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          pedido.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : pedido.status === "paid"
                              ? "bg-blue-100 text-blue-800"
                              : pedido.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pedido.status === "pending"
                          ? "Pendente"
                          : pedido.status === "paid"
                            ? "Pago"
                            : pedido.status === "delivered"
                              ? "Entregue"
                              : "Cancelado"}
                      </span>
                    </div>
                    <Link href={`/escola/loja/pedidos/${pedido.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/escola/loja/pedidos">
                <Button>Ver todos os pedidos</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="movimentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentos de Estoque</CardTitle>
              <CardDescription>Os últimos movimentos de estoque registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movimentos.slice(0, 5).map((movimento) => (
                  <div key={movimento.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-medium">{movimento.product?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {movimento.movement_type === "in"
                          ? "Entrada"
                          : movimento.movement_type === "out"
                            ? "Saída"
                            : "Ajuste"}
                        :{movimento.movement_type === "in" ? " +" : " "}
                        {movimento.quantity} unidades
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movimento.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        movimento.movement_type === "in"
                          ? "bg-green-100 text-green-800"
                          : movimento.movement_type === "out"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {movimento.movement_type === "in"
                        ? "Entrada"
                        : movimento.movement_type === "out"
                          ? "Saída"
                          : "Ajuste"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/escola/loja/estoque">
                <Button>Ver todos os movimentos</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

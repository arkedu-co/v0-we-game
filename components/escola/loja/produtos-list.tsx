"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getProdutos, excluirProduto } from "@/lib/services/loja-service"
import type { StoreProduct } from "@/lib/types"
import { Package, Plus, Search, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ProdutosListProps {
  escolaId: string
}

export function ProdutosList({ escolaId }: ProdutosListProps) {
  const [produtos, setProdutos] = useState<StoreProduct[]>([])
  const [filteredProdutos, setFilteredProdutos] = useState<StoreProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProdutos()
  }, [escolaId])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProdutos(produtos)
    } else {
      const filtered = produtos.filter(
        (produto) =>
          produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (produto.description && produto.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredProdutos(filtered)
    }
  }, [searchTerm, produtos])

  async function loadProdutos() {
    try {
      setLoading(true)
      setError(null)
      const data = await getProdutos(escolaId)
      setProdutos(data)
      setFilteredProdutos(data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      setError("Não foi possível carregar os produtos. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        setDeletingId(id)
        await excluirProduto(id)
        setProdutos(produtos.filter((produto) => produto.id !== id))
        setFilteredProdutos(filteredProdutos.filter((produto) => produto.id !== id))
      } catch (error) {
        console.error("Erro ao excluir produto:", error)
        alert("Não foi possível excluir o produto. Tente novamente mais tarde.")
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando produtos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">Erro ao carregar produtos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadProdutos}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/escola/loja/produtos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {filteredProdutos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-400 mb-4 text-center">
              {searchTerm ? "Tente uma busca diferente ou" : "Comece a adicionar produtos à sua loja"}
            </p>
            <Link href="/escola/loja/produtos/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProdutos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {produto.image_url ? (
                  <img
                    src={produto.image_url || "/placeholder.svg"}
                    alt={produto.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {!produto.active && (
                  <div className="absolute top-0 right-0 m-2">
                    <Badge variant="destructive">Inativo</Badge>
                  </div>
                )}
                {produto.stock_quantity < 10 && (
                  <div className="absolute top-0 left-0 m-2">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Estoque baixo: {produto.stock_quantity}
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{produto.name}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{produto.description || "Sem descrição"}</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {produto.price_type === "atoms" ? `${produto.price} átomos` : `R$ ${produto.price.toFixed(2)}`}
                  </span>
                  <div className="flex space-x-2">
                    <Link href={`/escola/loja/produtos/${produto.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
                      disabled={deletingId === produto.id}
                    >
                      {deletingId === produto.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

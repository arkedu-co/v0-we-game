"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getProdutos, registrarMovimentoEstoque } from "@/lib/services/loja-service"
import type { StoreProduct } from "@/lib/types"
import { AlertCircle, Loader2 } from "lucide-react"

interface EstoqueFormProps {
  escolaId: string
  onClose: () => void
}

export function EstoqueForm({ escolaId, onClose }: EstoqueFormProps) {
  const [produtos, setProdutos] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [produtoId, setProdutoId] = useState("")
  const [tipoMovimento, setTipoMovimento] = useState<"in" | "out" | "adjustment">("in")
  const [quantidade, setQuantidade] = useState(1)
  const [motivo, setMotivo] = useState("")

  const [produtoSelecionado, setProdutoSelecionado] = useState<StoreProduct | null>(null)

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

  useEffect(() => {
    if (produtoId) {
      const produto = produtos.find((p) => p.id === produtoId)
      setProdutoSelecionado(produto || null)
    } else {
      setProdutoSelecionado(null)
    }
  }, [produtoId, produtos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!produtoId) {
      setError("Selecione um produto")
      return
    }

    if (quantidade <= 0) {
      setError("A quantidade deve ser maior que zero")
      return
    }

    // Validar se há estoque suficiente para saída
    if (tipoMovimento === "out" && produtoSelecionado && quantidade > produtoSelecionado.stock_quantity) {
      setError(`Estoque insuficiente. Disponível: ${produtoSelecionado.stock_quantity}`)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await registrarMovimentoEstoque({
        school_id: escolaId,
        product_id: produtoId,
        quantity: tipoMovimento === "out" ? -quantidade : quantidade,
        movement_type: tipoMovimento,
        reason: motivo,
        created_by: escolaId, // Usando o ID da escola como criador
      })

      setSuccess(true)

      // Resetar formulário
      setProdutoId("")
      setTipoMovimento("in")
      setQuantidade(1)
      setMotivo("")

      // Fechar formulário após 2 segundos
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Erro ao registrar movimento:", error)
      setError("Não foi possível registrar o movimento de estoque. Tente novamente mais tarde.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando produtos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Movimento de Estoque</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              Movimento registrado com sucesso!
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="produto" className="block text-sm font-medium">
              Produto
            </label>
            <Select id="produto" value={produtoId} onValueChange={setProdutoId} disabled={submitting} required>
              <option value="">Selecione um produto</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.name} - Estoque: {produto.stock_quantity}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tipoMovimento" className="block text-sm font-medium">
              Tipo de Movimento
            </label>
            <Select
              id="tipoMovimento"
              value={tipoMovimento}
              onValueChange={(value) => setTipoMovimento(value as "in" | "out" | "adjustment")}
              disabled={submitting}
              required
            >
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
              <option value="adjustment">Ajuste</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantidade" className="block text-sm font-medium">
              Quantidade
            </label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Number.parseInt(e.target.value) || 0)}
              disabled={submitting}
              required
            />
            {produtoSelecionado && tipoMovimento === "out" && (
              <p className="text-xs text-gray-500">Estoque disponível: {produtoSelecionado.stock_quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="motivo" className="block text-sm font-medium">
              Motivo / Observação
            </label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo deste movimento de estoque"
              disabled={submitting}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || success}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Movimento"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

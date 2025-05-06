"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { StoreProduct, PriceType } from "@/lib/types"
import { criarProduto, atualizarProduto, getProduto } from "@/lib/services/loja-service"
import { AlertCircle, ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

interface ProdutoFormProps {
  schoolId: string
  storeId: string
  produtoId?: string
}

export function ProdutoForm({ schoolId, storeId, produtoId }: ProdutoFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [produto, setProduto] = useState<Partial<StoreProduct>>({
    school_id: schoolId,
    name: "",
    description: "",
    price: 0,
    price_type: "atoms" as PriceType,
    stock_quantity: 0,
    image_url: "",
    active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!produtoId)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (produtoId) {
      const fetchProduto = async () => {
        try {
          const data = await getProduto(produtoId)
          if (data) {
            setProduto({
              ...data,
              school_id: schoolId, // Ensure correct school_id
            })
            if (data.image_url) {
              setImagePreview(data.image_url)
            }
          } else {
            setError("Produto não encontrado")
          }
        } catch (err) {
          console.error("Erro ao buscar produto:", err)
          setError("Erro ao carregar dados do produto")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProduto()
    }
  }, [produtoId, schoolId, storeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduto((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProduto((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handlePriceTypeChange = (value: PriceType) => {
    setProduto((prev) => ({ ...prev, price_type: value }))
  }

  const handleActiveChange = (checked: boolean) => {
    setProduto((prev) => ({ ...prev, active: checked }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      // Create a FormData object to send the file to our API route
      const formData = new FormData()
      formData.append("file", file)
      formData.append("storeId", storeId)

      // Send the file to our API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer upload da imagem")
      }

      // Update the product with the image URL
      const imageUrl = result.url
      setProduto((prev) => ({ ...prev, image_url: imageUrl }))
      setImagePreview(imageUrl)
    } catch (err: any) {
      console.error("Erro ao fazer upload da imagem:", err)
      setError(err.message || "Falha ao fazer upload da imagem. Tente novamente.")
    } finally {
      setUploadingImage(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setProduto((prev) => ({ ...prev, image_url: "" }))
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (produtoId) {
        // Atualizar produto existente
        const updatedProduto = await atualizarProduto(produtoId, produto)

        if (updatedProduto) {
          setSuccess("Produto atualizado com sucesso!")
          setTimeout(() => {
            router.push("/escola/loja/produtos")
          }, 1500)
        } else {
          setError("Erro ao atualizar produto. Tente novamente.")
        }
      } else {
        // Criar novo produto
        const newProduto = await criarProduto(produto)

        if (newProduto) {
          setSuccess("Produto criado com sucesso!")
          setTimeout(() => {
            router.push("/escola/loja/produtos")
          }, 1500)
        } else {
          setError("Erro ao criar produto. Tente novamente.")
        }
      }
    } catch (err) {
      console.error("Erro ao salvar produto:", err)
      setError("Ocorreu um erro ao salvar. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p>Carregando dados do produto...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{produtoId ? "Editar Produto" : "Novo Produto"}</CardTitle>
        <Link href="/escola/loja/produtos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              name="name"
              value={produto.name}
              onChange={handleChange}
              placeholder="Nome do produto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={produto.description || ""}
              onChange={handleChange}
              placeholder="Descreva o produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={produto.price}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Preço</Label>
              <RadioGroup
                value={produto.price_type}
                onValueChange={(value) => handlePriceTypeChange(value as PriceType)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="atoms" id="atoms" />
                  <Label htmlFor="atoms">Átomos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="real" id="real" />
                  <Label htmlFor="real">Real (R$)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                step="1"
                value={produto.stock_quantity}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="border rounded-md p-4">
              {imagePreview ? (
                <div className="relative">
                  <div className="aspect-square w-full max-w-[200px] relative rounded-md overflow-hidden">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview da imagem do produto"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">Clique para fazer upload da imagem do produto</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Imagem
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-gray-400 mt-2">Formatos suportados: JPG, PNG, GIF. Máximo 5MB.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="active" checked={produto.active} onCheckedChange={handleActiveChange} />
            <Label htmlFor="active">Produto Ativo</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/escola/loja/produtos">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || uploadingImage}>
            {isSubmitting ? "Salvando..." : produtoId ? "Atualizar Produto" : "Criar Produto"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

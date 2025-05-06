"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Upload } from "lucide-react"
import Image from "next/image"
import { createAvatar, updateAvatar } from "@/lib/services/avatar-service"
import type { Avatar } from "@/lib/types"

interface AvatarFormProps {
  escolaId: string
  avatarId?: number
  initialData?: Avatar
}

export default function AvatarForm({ escolaId, avatarId, initialData }: AvatarFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Avatar>>({
    name: "",
    description: "",
    category: "geral",
    image_url: "",
    school_id: escolaId,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const isEditing = !!avatarId

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        category: initialData.category,
        image_url: initialData.image_url,
        school_id: escolaId,
      })

      if (initialData.image_url) {
        setAvatarPreview(initialData.image_url)
      }
    }
  }, [initialData, escolaId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return formData.image_url || null

    const formDataUpload = new FormData()
    formDataUpload.append("file", avatarFile)
    formDataUpload.append("storeId", escolaId) // Adicionar o escolaId como storeId
    formDataUpload.append("entityType", "avatares") // Especificar o tipo de entidade

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao fazer upload do avatar")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error)
      throw new Error("Não foi possível fazer o upload do avatar.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl = formData.image_url

      if (avatarFile) {
        console.log("Iniciando upload do avatar...")
        imageUrl = await uploadAvatar()
        console.log("Upload concluído, URL:", imageUrl)
      }

      if (!imageUrl) {
        throw new Error("É necessário fazer upload de uma imagem para o avatar.")
      }

      const avatarData = {
        ...formData,
        image_url: imageUrl,
      }

      console.log("Salvando dados do avatar:", avatarData)

      if (isEditing && avatarId) {
        await updateAvatar(avatarId, avatarData)
      } else {
        await createAvatar(avatarData)
      }

      router.push("/escola/avatares")
    } catch (error: any) {
      console.error("Erro ao salvar avatar:", error)
      setError(error.message || "Não foi possível salvar o avatar. Verifique os dados e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const avatarCategories = [
    { value: "geral", label: "Geral" },
    { value: "iniciante", label: "Iniciante" },
    { value: "intermediario", label: "Intermediário" },
    { value: "avancado", label: "Avançado" },
    { value: "especial", label: "Especial" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Avatar</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          required
          placeholder="Ex: Astronauta, Ninja, Cientista"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {avatarCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          placeholder="Descreva este avatar"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Imagem do Avatar</Label>
        <div className="flex items-center space-x-4">
          {avatarPreview && (
            <div className="relative h-32 w-32 rounded-full overflow-hidden border">
              <Image src={avatarPreview || "/placeholder.svg"} alt="Avatar preview" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="relative">
              <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("avatar")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {avatarPreview ? "Alterar Imagem" : "Carregar Imagem"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Recomendado: imagem quadrada de pelo menos 200x200px</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/escola/avatares")} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? "Salvando..." : "Criando..."}
            </>
          ) : (
            <>{isEditing ? "Salvar Alterações" : "Criar Avatar"}</>
          )}
        </Button>
      </div>
    </form>
  )
}

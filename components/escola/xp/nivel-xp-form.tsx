"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, Upload, Plus } from "lucide-react"
import type { XPLevel, Avatar } from "@/lib/types"
import { createNivelXP, getNivelXP, updateNivelXP } from "@/lib/services/xp-service"
import { getAvatares } from "@/lib/services/avatar-service"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getSessionAndSchoolIdClient } from "@/lib/session-utils-client"

interface NivelXPFormProps {
  id?: number
}

export default function NivelXPForm({ id }: NivelXPFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<XPLevel>>({
    name: "",
    description: "",
    min_xp: 0,
    max_xp: 0,
    avatar_url: "",
    school_id: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatares, setAvatares] = useState<Avatar[]>([])
  const [loadingAvatares, setLoadingAvatares] = useState(false)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)

  const isEditing = !!id

  // Obter o school_id do usuário logado e carregar avatares
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Usar getSessionAndSchoolIdClient para obter o ID da escola de forma compatível com componentes cliente
        const { schoolId, error: sessionError } = await getSessionAndSchoolIdClient()

        if (sessionError) {
          throw sessionError
        }

        if (!schoolId) {
          throw new Error("ID da escola não disponível")
        }

        console.log("ID da escola obtido:", schoolId)

        // Atualizar o formulário com o ID da escola
        setFormData((prev) => ({ ...prev, school_id: schoolId }))

        // Carregar avatares da escola
        await fetchAvatares(schoolId)
      } catch (err: any) {
        console.error("Erro ao inicializar formulário:", err)
        setError(err.message || "Não foi possível carregar os dados iniciais.")
      }
    }

    initializeForm()
  }, [])

  const fetchAvatares = async (schoolId: string) => {
    setLoadingAvatares(true)
    try {
      console.log("Buscando avatares para a escola:", schoolId)
      const listaAvatares = await getAvatares(schoolId)
      console.log(`Encontrados ${listaAvatares.length} avatares:`, listaAvatares)
      setAvatares(listaAvatares)
    } catch (error: any) {
      console.error("Erro ao carregar avatares:", error)
      setError(error.message || "Não foi possível carregar os avatares cadastrados.")
    } finally {
      setLoadingAvatares(false)
    }
  }

  useEffect(() => {
    if (isEditing && id) {
      const fetchNivel = async () => {
        try {
          const nivel = await getNivelXP(id)
          setFormData({
            name: nivel.name,
            description: nivel.description,
            min_xp: nivel.min_xp,
            max_xp: nivel.max_xp,
            avatar_url: nivel.avatar_url,
            school_id: nivel.school_id,
          })
          if (nivel.avatar_url) {
            setAvatarPreview(nivel.avatar_url)

            // Tentar encontrar o avatar correspondente na lista
            const avatar = avatares.find((a) => a.image_url === nivel.avatar_url)
            if (avatar) {
              setSelectedAvatarId(avatar.id.toString())
            }
          }
        } catch (error) {
          console.error("Erro ao buscar nível de XP:", error)
          setError("Não foi possível carregar os dados do nível de XP.")
        }
      }

      fetchNivel()
    }
  }, [id, isEditing, avatares])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "min_xp" || name === "max_xp" ? Number.parseInt(value, 10) || 0 : value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Por favor, envie apenas arquivos de imagem")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB")
        return
      }

      setAvatarFile(file)
      setSelectedAvatarId(null) // Limpar seleção de avatar existente

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarSelect = (avatarId: string, avatarUrl: string) => {
    setSelectedAvatarId(avatarId)
    setAvatarPreview(avatarUrl)
    setAvatarFile(null) // Limpar arquivo de upload
    setFormData((prev) => ({
      ...prev,
      avatar_url: avatarUrl,
    }))
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return formData.avatar_url || null

    setLoading(true)

    try {
      // Create a FormData object to send the file to our API route
      const formDataUpload = new FormData()
      formDataUpload.append("file", avatarFile)
      formDataUpload.append("storeId", formData.school_id || "")
      formDataUpload.append("entityType", "avatares")

      console.log("Enviando upload com storeId:", formData.school_id)

      // Send the file to our API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer upload do avatar")
      }

      // Return the image URL
      return result.url
    } catch (err: any) {
      console.error("Erro ao fazer upload do avatar:", err)
      throw new Error(err.message || "Não foi possível fazer o upload do avatar.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let avatarUrl = formData.avatar_url

      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar()
        } catch (uploadError: any) {
          setError(uploadError.message || "Erro ao fazer upload do avatar")
          setLoading(false)
          return
        }
      } else if (selectedAvatarId) {
        // Se um avatar existente foi selecionado, use sua URL
        const selectedAvatar = avatares.find((a) => a.id.toString() === selectedAvatarId)
        if (selectedAvatar) {
          avatarUrl = selectedAvatar.image_url
        }
      }

      const nivelData = {
        ...formData,
        avatar_url: avatarUrl || "",
      }

      if (isEditing) {
        await updateNivelXP(id, nivelData)
      } else {
        await createNivelXP(nivelData)
      }

      router.push("/escola/xp/niveis")
    } catch (error: any) {
      console.error("Erro ao salvar nível de XP:", error)
      setError(error.message || "Não foi possível salvar o nível de XP. Verifique os dados e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/escola/xp/niveis")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>{isEditing ? "Editar Nível de XP" : "Novo Nível de XP"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Nível</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              placeholder="Ex: Iniciante, Intermediário, Avançado"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_xp">XP Mínimo</Label>
              <Input
                id="min_xp"
                name="min_xp"
                type="number"
                min="0"
                value={formData.min_xp || 0}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_xp">XP Máximo</Label>
              <Input
                id="max_xp"
                name="max_xp"
                type="number"
                min="0"
                value={formData.max_xp || 0}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva este nível de XP"
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <Tabs defaultValue="existentes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existentes">Avatares Existentes</TabsTrigger>
                <TabsTrigger value="novo">Novo Avatar</TabsTrigger>
              </TabsList>

              <TabsContent value="existentes" className="pt-4">
                {loadingAvatares ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                  </div>
                ) : avatares.length > 0 ? (
                  <div>
                    <RadioGroup
                      value={selectedAvatarId || ""}
                      onValueChange={(value) => {
                        const avatar = avatares.find((a) => a.id.toString() === value)
                        if (avatar) {
                          handleAvatarSelect(value, avatar.image_url)
                        }
                      }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2"
                    >
                      {avatares.map((avatar) => (
                        <div key={avatar.id} className="relative">
                          <RadioGroupItem value={avatar.id.toString()} id={`avatar-${avatar.id}`} className="sr-only" />
                          <Label
                            htmlFor={`avatar-${avatar.id}`}
                            className={`
                              block cursor-pointer rounded-lg overflow-hidden border-2 p-1
                              ${selectedAvatarId === avatar.id.toString() ? "border-purple-600" : "border-transparent hover:border-gray-300"}
                            `}
                          >
                            <div className="aspect-square relative">
                              <Image
                                src={avatar.image_url || "/placeholder.svg"}
                                alt={avatar.name || "Avatar"}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <p className="text-xs text-center mt-1 truncate">{avatar.name}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedAvatarId ? "Avatar selecionado" : "Selecione um avatar"}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/escola/avatares/novo")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Criar Avatar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground mb-4">Nenhum avatar cadastrado</p>
                    <Button type="button" variant="outline" onClick={() => router.push("/escola/avatares/novo")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Avatar
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="novo" className="pt-4">
                <div className="flex items-center space-x-4">
                  {avatarPreview && !selectedAvatarId && (
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border">
                      <Image
                        src={avatarPreview || "/placeholder.svg"}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("avatar")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {avatarPreview && !selectedAvatarId ? "Alterar Avatar" : "Carregar Avatar"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: imagem quadrada de pelo menos 200x200px
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview do avatar selecionado */}
            {avatarPreview && (
              <div className="mt-4 flex justify-center">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-purple-200">
                  <Image
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar selecionado"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/escola/xp/niveis")} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Salvando..." : "Criando..."}
                </>
              ) : (
                <>{isEditing ? "Salvar Alterações" : "Criar Nível"}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

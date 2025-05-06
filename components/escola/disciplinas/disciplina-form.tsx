"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, Save, Upload, X, ImageIcon } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Subject } from "@/lib/types"
import Image from "next/image"

interface DisciplinaFormProps {
  disciplina?: Subject
  escolaId?: string
  isEditing?: boolean
  onSuccess?: (data: any) => void
}

export function DisciplinaForm({ disciplina, escolaId, isEditing = false, onSuccess }: DisciplinaFormProps) {
  const [name, setName] = useState(disciplina?.name || "")
  const [code, setCode] = useState(disciplina?.code || "")
  const [workload, setWorkload] = useState(disciplina?.workload?.toString() || "")
  const [description, setDescription] = useState(disciplina?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(escolaId || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(disciplina?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Obter o ID da escola do usuário logado
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session?.user) {
          setSchoolId(sessionData.session.user.id)
        }
      } catch (error) {
        console.error("Erro ao obter usuário atual:", error)
      }
    }

    if (!escolaId) {
      fetchCurrentUser()
    }
  }, [supabase, escolaId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      // Create a FormData object to send the file to our API route
      const formData = new FormData()
      formData.append("file", file)
      formData.append("storeId", schoolId || "") // Usando o ID da escola como storeId
      formData.append("entityType", "disciplinas") // Especificando o tipo de entidade

      // Send the file to our API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer upload da imagem")
      }

      // Update the image URL
      const imageUrl = result.url
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
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!schoolId) {
        throw new Error("ID da escola não encontrado")
      }

      if (!name) {
        throw new Error("Por favor, preencha o nome da disciplina")
      }

      const disciplinaData = {
        name,
        code,
        workload: workload ? Number.parseInt(workload) : null,
        description,
        active: true,
        school_id: schoolId,
        image_url: imagePreview,
      }

      if (isEditing && disciplina) {
        // Atualizar disciplina existente
        const { error: updateError } = await supabase.from("subjects").update(disciplinaData).eq("id", disciplina.id)

        if (updateError) {
          throw updateError
        }

        setSuccessMessage("Disciplina atualizada com sucesso!")
        if (onSuccess) onSuccess(disciplinaData)
      } else {
        // Criar nova disciplina
        const { data: newDisciplina, error: insertError } = await supabase
          .from("subjects")
          .insert([disciplinaData])
          .select()

        if (insertError) {
          throw insertError
        }

        setSuccessMessage("Disciplina criada com sucesso!")

        // Redirecionar para a página de disciplinas após criar
        setTimeout(() => {
          router.push("/escola/disciplinas")
        }, 1500)

        if (onSuccess) onSuccess(newDisciplina)
      }
    } catch (error: any) {
      console.error("Erro ao salvar disciplina:", error)
      setError(error.message || "Erro ao salvar disciplina")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="bg-primary/5 rounded-t-lg border-b">
        <CardTitle className="text-xl text-gray-900">{isEditing ? "Editar Disciplina" : "Nova Disciplina"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium text-gray-900">
              Nome da Disciplina *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da disciplina"
              disabled={loading}
              required
              className="h-12 bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-base font-medium text-gray-900">
              Código
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite o código da disciplina"
              disabled={loading}
              className="h-12 bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workload" className="text-base font-medium text-gray-900">
              Carga Horária (horas)
            </Label>
            <Input
              id="workload"
              type="number"
              value={workload}
              onChange={(e) => setWorkload(e.target.value)}
              placeholder="Digite a carga horária"
              disabled={loading}
              className="h-12 bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium text-gray-900">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para a disciplina"
              disabled={loading}
              className="min-h-[100px] bg-white border-gray-300 text-gray-900"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">Imagem da Disciplina</Label>
            <div className="border rounded-md p-4">
              {imagePreview ? (
                <div className="relative">
                  <div className="aspect-square w-full max-w-[200px] relative rounded-md overflow-hidden">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview da imagem da disciplina"
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
                  <p className="text-sm text-gray-500 mb-4">Clique para fazer upload da imagem da disciplina</p>
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

          {error && (
            <Alert variant="destructive" className="shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200 shadow-md">
              <AlertDescription className="text-base">{successMessage}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between p-6 border-t bg-primary/5">
        <Button variant="outline" onClick={() => router.back()} disabled={loading} className="font-medium h-12 px-6">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || uploadingImage}
          variant="gradient"
          className="font-medium h-12 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isEditing ? "Atualizando..." : "Criando..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {isEditing ? "Atualizar Disciplina" : "Criar Disciplina"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

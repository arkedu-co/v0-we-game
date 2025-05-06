"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, Save } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { createCurso, updateCurso } from "@/lib/services/curso-service"
import type { Course } from "@/lib/types"

interface CursoFormProps {
  curso?: Course
  isEditing?: boolean
  onSuccess?: (data: any) => void
}

export function CursoForm({ curso, isEditing = false, onSuccess }: CursoFormProps) {
  const [name, setName] = useState(curso?.name || "")
  const [description, setDescription] = useState(curso?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
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

    fetchCurrentUser()
  }, [supabase])

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
        throw new Error("Por favor, preencha o nome do curso")
      }

      if (isEditing && curso) {
        // Atualizar curso existente
        const updatedCurso = await updateCurso(curso.id, {
          name,
          description,
        })

        setSuccessMessage("Curso atualizado com sucesso!")
        if (onSuccess) onSuccess(updatedCurso)
      } else {
        // Criar novo curso
        const newCurso = await createCurso({
          school_id: schoolId,
          name,
          description,
        })

        setSuccessMessage("Curso criado com sucesso!")

        // Redirecionar para a página de edição após criar
        setTimeout(() => {
          router.push(`/escola/cursos/${newCurso.id}`)
        }, 1500)

        if (onSuccess) onSuccess(newCurso)
      }
    } catch (error: any) {
      console.error("Erro ao salvar curso:", error)
      setError(error.message || "Erro ao salvar curso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="bg-primary/5 rounded-t-lg border-b">
        <CardTitle className="text-xl text-gray-900">{isEditing ? "Editar Curso" : "Novo Curso"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium text-gray-900">
              Nome do Curso *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do curso"
              disabled={loading}
              required
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
              placeholder="Digite uma descrição para o curso"
              disabled={loading}
              className="min-h-[100px] bg-white border-gray-300 text-gray-900"
            />
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
          disabled={loading}
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
              {isEditing ? "Atualizar Curso" : "Criar Curso"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

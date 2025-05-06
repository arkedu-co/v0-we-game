"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfessorFormProps {
  escolaId: string
  professor?: any
}

export function ProfessorForm({ escolaId, professor }: ProfessorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(e.currentTarget)

      // Add school ID to form data
      formData.append("schoolId", escolaId)

      // Add professor ID if editing
      if (professor?.id) {
        formData.append("id", professor.id)
      }

      console.log("Enviando formulário com escolaId:", escolaId)

      const response = await fetch("/api/professores", {
        method: professor?.id ? "PUT" : "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar professor")
      }

      setSuccess("Professor salvo com sucesso!")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/escola/professores")
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error("Erro ao salvar professor:", err)
      setError((err as Error).message || "Ocorreu um erro ao salvar o professor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{professor ? "Editar Professor" : "Novo Professor"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Nome Completo
            </label>
            <Input id="fullName" name="fullName" defaultValue={professor?.profile?.full_name || ""} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={professor?.profile?.email || ""}
              required
              disabled={!!professor}
            />
          </div>

          {!professor && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input id="password" name="password" type="password" required />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="education" className="text-sm font-medium">
              Formação Acadêmica
            </label>
            <Input id="education" name="education" defaultValue={professor?.education || ""} />
          </div>

          <div className="space-y-2">
            <label htmlFor="subjects" className="text-sm font-medium">
              Disciplinas (separadas por vírgula)
            </label>
            <Textarea id="subjects" name="subjects" defaultValue={professor?.subjects?.join(", ") || ""} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {professor ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

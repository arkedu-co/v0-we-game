"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DisciplinaFormClientProps {
  escolaId: string
}

export function DisciplinaFormClient({ escolaId }: DisciplinaFormClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const workload = formData.get("workload") ? Number.parseInt(formData.get("workload") as string) : null
    const description = formData.get("description") as string
    const active = formData.has("active")

    try {
      // Inserir a disciplina no banco de dados
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          name,
          code,
          workload,
          description,
          active,
          school_id: escolaId,
        })
        .select()

      if (error) throw error

      // Redirecionar para a lista de disciplinas
      router.push("/escola/disciplinas")
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao criar disciplina:", error)
      setError(error.message || "Ocorreu um erro ao criar a disciplina.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Disciplina</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="escolaId" value={escolaId} />

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Disciplina *</Label>
                <Input id="name" name="name" required placeholder="Ex: Matemática" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input id="code" name="code" placeholder="Ex: MAT101" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workload">Carga Horária (horas)</Label>
              <Input id="workload" name="workload" type="number" placeholder="Ex: 60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" placeholder="Descreva a disciplina..." rows={4} />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={true}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="active" className="text-sm font-medium text-gray-700">
                Disciplina Ativa
              </Label>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/escola/disciplinas")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Disciplina"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

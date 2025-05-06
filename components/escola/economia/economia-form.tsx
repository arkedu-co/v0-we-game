"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EconomiaConfig } from "@/lib/services/economia-service"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EconomiaFormProps {
  config: EconomiaConfig | null
}

export function EconomiaForm({ config }: EconomiaFormProps) {
  const router = useRouter()
  const [salarioDiario, setSalarioDiario] = useState<number>(config?.salario_diario_atomos || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/escola/economia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salario_diario_atomos: salarioDiario,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao salvar configurações")
      }

      setSuccess("Configurações salvas com sucesso!")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar configurações")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Economia</CardTitle>
          <CardDescription>
            Configure os parâmetros econômicos da sua escola, como o salário diário dos alunos em átomos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="salario-diario">Salário Diário (Átomos)</Label>
            <Input
              id="salario-diario"
              type="number"
              min="0"
              value={salarioDiario}
              onChange={(e) => setSalarioDiario(Number(e.target.value))}
              placeholder="Ex: 10"
            />
            <p className="text-sm text-gray-500">
              Quantidade de átomos que cada aluno receberá diariamente como salário.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

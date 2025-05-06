"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Loader2, BookOpen, Clock, Calendar, Tag, CheckCircle, XCircle } from "lucide-react"
import { getDisciplina } from "@/lib/services/disciplina-service"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface DisciplinaDetalhesProps {
  id: string
  schoolId?: string
}

export function DisciplinaDetalhes({ id, schoolId }: DisciplinaDetalhesProps) {
  const [disciplina, setDisciplina] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDisciplina = async () => {
      try {
        const data = await getDisciplina(id)
        setDisciplina(data)
      } catch (err) {
        setError("Erro ao carregar detalhes da disciplina")
        console.error("Erro ao buscar disciplina:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDisciplina()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !disciplina) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error || "Disciplina não encontrada"}</p>
        <Button variant="outline" onClick={() => router.push("/escola/disciplinas")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Disciplinas
        </Button>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      {disciplina.image_url && (
        <div className="w-full h-64 relative">
          <Image
            src={disciplina.image_url || "/placeholder.svg"}
            alt={disciplina.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{disciplina.name}</CardTitle>
            <div className="mt-2">
              <Badge variant={disciplina.active !== false ? "default" : "outline"}>
                {disciplina.active !== false ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Ativa
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Inativa
                  </>
                )}
              </Badge>
            </div>
          </div>
          <Button onClick={() => router.push(`/escola/disciplinas/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                Descrição
              </h3>
              <p className="mt-1">{disciplina.description || "Sem descrição"}</p>
            </div>

            {disciplina.code && (
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-muted-foreground" />
                  Código
                </h3>
                <p className="mt-1">{disciplina.code}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {disciplina.workload && (
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  Carga Horária
                </h3>
                <p className="mt-1">{disciplina.workload} horas</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                Datas
              </h3>
              <div className="mt-1 space-y-1">
                <p>
                  <span className="font-medium">Criação:</span> {new Date(disciplina.created_at).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Atualização:</span>{" "}
                  {new Date(disciplina.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button variant="outline" onClick={() => router.push("/escola/disciplinas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Disciplinas
        </Button>
      </CardFooter>
    </Card>
  )
}

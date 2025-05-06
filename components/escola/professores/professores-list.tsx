"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TableActionMenu } from "@/components/ui/table-action-menu"
import { Loader2, UserPlus, AlertCircle } from "lucide-react"

interface Professor {
  id: string
  full_name: string
  email: string
  created_at: string
  avatar_url?: string
}

interface ProfessoresListProps {
  escolaId: string
}

export function ProfessoresList({ escolaId }: ProfessoresListProps) {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function loadProfessores() {
      try {
        setLoading(true)
        setError(null)

        // Buscar professores vinculados à escola
        const { data: teachers, error: teachersError } = await supabase
          .from("teachers")
          .select("id, full_name, email, created_at, avatar_url")
          .eq("school_id", escolaId)
          .order("full_name")

        if (teachersError) {
          console.error("Erro ao buscar professores:", teachersError)
          setError("Não foi possível carregar a lista de professores.")
          return
        }

        setProfessores(teachers || [])
      } catch (err) {
        console.error("Erro ao carregar professores:", err)
        setError("Ocorreu um erro ao carregar os professores.")
      } finally {
        setLoading(false)
      }
    }

    if (escolaId) {
      loadProfessores()
    }
  }, [escolaId, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando professores...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (professores.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Link href="/escola/professores/novo">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Professor
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">Nenhum professor cadastrado.</p>
            <Link href="/escola/professores/novo">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Professor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{professores.length} professores encontrados</p>
        <Link href="/escola/professores/novo">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Professor
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {professores.map((professor) => (
          <Card key={professor.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{professor.full_name}</h3>
                  <TableActionMenu
                    actions={[
                      {
                        label: "Ver detalhes",
                        href: `/escola/professores/${professor.id}`,
                      },
                      {
                        label: "Editar",
                        href: `/escola/professores/${professor.id}/editar`,
                      },
                    ]}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-1">{professor.email}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

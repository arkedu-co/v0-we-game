"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { obterNiveisXP, excluirNivelXP } from "@/lib/services/xp-service"
import type { XPLevel } from "@/lib/types"
import Image from "next/image"
import { TableActionMenu } from "@/components/ui/table-action-menu"

export default function NiveisXPList() {
  const router = useRouter()
  const [niveis, setNiveis] = useState<XPLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchNiveis = async () => {
      try {
        // Obter a sessão do usuário para pegar o ID da escola
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError)
          setError("Erro de autenticação. Por favor, faça login novamente.")
          setLoading(false)
          return
        }

        if (!sessionData.session) {
          setError("Sessão expirada. Por favor, faça login novamente.")
          setLoading(false)
          return
        }

        const schoolId = sessionData.session.user.id

        // Buscar níveis de XP da escola
        const data = await obterNiveisXP(schoolId)
        setNiveis(data)
        setLoading(false)
      } catch (error: any) {
        console.error("Erro ao buscar níveis de XP:", error)
        setError(error.message || "Erro ao carregar níveis de XP")
        setLoading(false)
      }
    }

    fetchNiveis()
  }, [supabase])

  const handleEdit = (id: string) => {
    router.push(`/escola/xp/niveis/${id}/editar`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este nível de XP?")) return

    try {
      setLoading(true)
      await excluirNivelXP(id)

      // Atualizar a lista após exclusão
      setNiveis(niveis.filter((nivel) => nivel.id !== id))
      setLoading(false)
    } catch (error: any) {
      console.error("Erro ao excluir nível de XP:", error)
      setError(error.message || "Erro ao excluir nível de XP")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando níveis de XP...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/escola/xp/niveis/novo")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Nível de XP
        </Button>
      </div>

      {niveis.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum nível de XP cadastrado. Clique em "Novo Nível de XP" para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {niveis.map((nivel) => (
            <Card key={nivel.id} className="overflow-hidden">
              <div className="p-4 flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {nivel.avatar_url ? (
                    <Image
                      src={nivel.avatar_url || "/placeholder.svg"}
                      alt={nivel.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium truncate">{nivel.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    XP: {nivel.min_xp} - {nivel.max_xp}
                  </p>
                </div>
                <TableActionMenu onEdit={() => handleEdit(nivel.id)} onDelete={() => handleDelete(nivel.id)} />
              </div>
              {nivel.description && (
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground">{nivel.description}</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

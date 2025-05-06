"use client"

import { DisciplinaForm } from "@/components/escola/disciplinas/disciplina-form"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NovaDisciplinaPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserId() {
      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase.auth.getSession()

        if (data.session?.user?.id) {
          setUserId(data.session.user.id)
        }
      } catch (error) {
        console.error("Erro ao obter ID do usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    getUserId()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Disciplina</h1>
          <p className="text-muted-foreground">Cadastre uma nova disciplina para sua escola</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/escola/disciplinas">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Disciplina</CardTitle>
        </CardHeader>
        <CardContent>
          {userId ? (
            <DisciplinaForm escolaId={userId} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">
              <p>Não foi possível obter o ID do usuário. Por favor, tente fazer login novamente.</p>
              <div className="mt-4">
                <Link href="/escola/login?redirectTo=/escola/disciplinas/nova">
                  <Button variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

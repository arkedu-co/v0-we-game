"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import RegraXPForm from "@/components/escola/xp/regra-xp-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function NovaRegraXPPage() {
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getAuthenticatedUserId() {
      try {
        setLoading(true)
        const supabase = createClientComponentClient()

        // Obter a sessão do usuário
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error(`Erro ao obter sessão: ${sessionError.message}`)
        }

        if (!session) {
          throw new Error("Usuário não autenticado")
        }

        // Usar o ID do usuário como ID da escola
        setEscolaId(session.user.id)
        console.log("ID do usuário obtido:", session.user.id)
      } catch (err) {
        console.error("Erro ao obter ID do usuário:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    getAuthenticatedUserId()
  }, [])

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Nova Regra de XP</h1>
          <Button variant="outline" asChild>
            <Link href="/escola/xp/regras">Voltar para Regras</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Carregando informações da escola...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">{escolaId && <RegraXPForm schoolId={escolaId} />}</div>
        )}
      </div>
    </DashboardLayout>
  )
}

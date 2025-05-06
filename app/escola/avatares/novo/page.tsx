"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AvatarForm from "@/components/escola/avatares/avatar-form"

export default function NovoAvatarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [escolaId, setEscolaId] = useState<string | null>(null)

  useEffect(() => {
    const fetchEscolaId = async () => {
      try {
        const supabase = createClientComponentClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setError("Usuário não autenticado")
          setLoading(false)
          return
        }

        setEscolaId(session.user.id)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao obter ID da escola:", error)
        setError("Erro ao obter ID da escola")
        setLoading(false)
      }
    }

    fetchEscolaId()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/escola/avatares")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Novo Avatar</CardTitle>
        </CardHeader>
        <CardContent>{escolaId && <AvatarForm escolaId={escolaId} />}</CardContent>
      </Card>
    </DashboardLayout>
  )
}

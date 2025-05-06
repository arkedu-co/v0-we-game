"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AvatarForm from "@/components/escola/avatares/avatar-form"
import { getAvatar } from "@/lib/services/avatar-service"
import type { Avatar } from "@/lib/types"

export default function EditarAvatarPage() {
  const router = useRouter()
  const params = useParams()
  const avatarId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<Avatar | null>(null)

  useEffect(() => {
    const fetchData = async () => {
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

        // Buscar dados do avatar
        const avatarData = await getAvatar(avatarId)
        setAvatar(avatarData)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados do avatar")
        setLoading(false)
      }
    }

    fetchData()
  }, [avatarId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando dados do avatar...</span>
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
          <CardTitle>Editar Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          {escolaId && avatar && <AvatarForm escolaId={escolaId} avatarId={avatarId} initialData={avatar} />}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

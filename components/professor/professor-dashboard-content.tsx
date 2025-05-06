"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Loader2, Users, BookOpen, Calendar, Award } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function ProfessorDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [professorData, setProfessorData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const supabase = getSupabaseClient()

        // Verificar autenticação
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error("Erro de sessão:", sessionError)
          setError("Sessão expirada. Por favor, faça login novamente.")
          router.push("/professor/login")
          return
        }

        // Buscar dados do professor
        const { data: professor, error: professorError } = await supabase
          .from("teachers")
          .select(`
            id,
            profile:profiles!teachers_id_fkey (
              full_name,
              email,
              avatar_url
            ),
            school:schools!teachers_school_id_fkey (
              id,
              name
            )
          `)
          .eq("id", session.user.id)
          .single()

        if (professorError) {
          console.error("Erro ao buscar dados do professor:", professorError)
          setError("Erro ao carregar dados do professor.")
          return
        }

        setProfessorData(professor)
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err)
        setError("Ocorreu um erro ao carregar o dashboard.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfessorData()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push("/professor/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard do Professor</h1>
          <p className="text-muted-foreground">Bem-vindo, {professorData?.profile?.full_name || "Professor"}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="mt-4 md:mt-0">
          Sair
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Minhas Turmas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Turmas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Disciplinas lecionadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas Aulas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Aulas esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atitudes Aplicadas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Turmas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Carregue suas turmas para visualizar aqui.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nenhuma atividade pendente no momento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

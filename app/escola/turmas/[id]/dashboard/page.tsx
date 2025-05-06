"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Users } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { TurmaDashboard } from "@/components/escola/turmas/turma-dashboard"

export default function TurmaDashboardPage({ params }: { params: { id: string } }) {
  const [turma, setTurma] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Função para buscar detalhes da turma do lado do cliente
  const fetchTurmaDetails = async (turmaId: string) => {
    try {
      // Primeiro, buscamos os dados básicos da turma
      const { data: turmaData, error: turmaError } = await supabase
        .from("classes")
        .select(`
          *,
          courses!course_id (
            id,
            name
          )
        `)
        .eq("id", turmaId)
        .single()

      if (turmaError) throw turmaError

      // Se a turma tem um professor associado, buscamos os detalhes do professor
      let teacherName = null
      if (turmaData?.teacher_id) {
        const { data: teacherData, error: teacherError } = await supabase
          .from("teachers")
          .select(`
            id,
            profiles (
              full_name
            )
          `)
          .eq("id", turmaData.teacher_id)
          .single()

        if (!teacherError && teacherData) {
          teacherName = teacherData.profiles?.full_name
        }
      }

      if (turmaData) {
        return {
          ...turmaData,
          course_name: turmaData.courses?.name,
          teacher_name: teacherName,
        }
      }

      return null
    } catch (error) {
      console.error("Erro ao buscar turma:", error)
      throw error
    }
  }

  const fetchTurma = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTurmaDetails(params.id)
      setTurma(data)
    } catch (error: any) {
      console.error("Erro ao buscar turma:", error)
      setError(error.message || "Erro ao carregar dados da turma")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurma()
  }, [params.id])

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {loading
                ? "Carregando..."
                : turma
                  ? `Dashboard: ${turma.course_name || ""} - ${turma.name}`
                  : "Turma não encontrada"}
            </h1>
            <p className="text-gray-600">Visualize dados e métricas da turma.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/escola/turmas/${params.id}`)} className="h-10">
              <Users className="mr-2 h-4 w-4" />
              Detalhes da Turma
            </Button>
            <Button variant="outline" onClick={() => router.push("/escola/turmas")} className="h-10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Turmas
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        ) : turma ? (
          <TurmaDashboard turma={turma} />
        ) : (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">Turma não encontrada</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}

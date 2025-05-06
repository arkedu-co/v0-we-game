"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CursoForm } from "@/components/escola/cursos/curso-form"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { getCurso } from "@/lib/services/curso-service"

export default function EditarCursoPage({ params }: { params: { id: string } }) {
  const [curso, setCurso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Verificar se estamos na página de novo curso
  const isNewCurso = params.id === "novo"

  const fetchCurso = async () => {
    // Se for a página de novo curso, não precisamos buscar dados
    if (isNewCurso) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getCurso(params.id)
      setCurso(data)
    } catch (error: any) {
      console.error("Erro ao buscar curso:", error)
      setError(error.message || "Erro ao carregar dados do curso")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurso()
  }, [params.id, isNewCurso])

  // Renderização para a página de novo curso
  if (isNewCurso) {
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Curso</h1>
              <p className="text-gray-600">Preencha os dados abaixo para cadastrar um novo curso.</p>
            </div>
            <Button variant="outline" onClick={() => router.back()} className="h-10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
          <CursoForm />
        </div>
      </DashboardLayout>
    )
  }

  // Renderização para a página de edição de curso existente
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {loading ? "Carregando..." : curso ? `Curso: ${curso.name}` : "Curso não encontrado"}
            </h1>
            <p className="text-gray-600">Edite as informações do curso.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="h-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        ) : curso ? (
          <CursoForm curso={curso} isEditing={true} onSuccess={fetchCurso} />
        ) : (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">Curso não encontrado</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}

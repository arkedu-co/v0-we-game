"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { ProfessorDetalhes } from "@/components/escola/professores/professor-detalhes"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export default function ProfessorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function getSchoolId() {
      try {
        setLoading(true)

        // Obter a sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          // Se não houver sessão, não redirecionar, apenas mostrar um erro
          setError("Você precisa estar logado para ver esta página")
          setLoading(false)
          return
        }

        // Obter o ID da escola do diretor logado
        const { data: escola, error } = await supabase
          .from("schools")
          .select("id")
          .eq("director_id", session.user.id)
          .single()

        if (error) {
          console.error("Erro ao buscar escola:", error)
          setError("Não foi possível encontrar a escola associada a este usuário")
          setLoading(false)
          return
        }

        if (!escola) {
          setError("Escola não encontrada para este usuário")
          setLoading(false)
          return
        }

        setSchoolId(escola.id)
        setLoading(false)
      } catch (err) {
        console.error("Erro ao buscar ID da escola:", err)
        setError("Ocorreu um erro ao carregar os dados")
        setLoading(false)
      }
    }

    getSchoolId()
  }, [supabase])

  if (loading) {
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="container mx-auto py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
            <p className="text-sm mt-2">
              Detalhes técnicos: Verifique se o professor existe e se você tem permissão para acessá-lo.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push("/escola/professores")}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Voltar para lista de professores
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Detalhes do Professor</h1>
        {schoolId && <ProfessorDetalhes id={id} schoolId={schoolId} />}
      </div>
    </DashboardLayout>
  )
}

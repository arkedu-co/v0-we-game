import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfessorForm } from "@/components/escola/professores/professor-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { escolaSidebarIcons } from "@/components/escola/sidebar-icons"

export default async function NovoProfessorPage() {
  const supabase = getSupabaseServer()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/escola/login")
  }

  // Get school ID by querying the schools table
  const { data: escola, error: escolaError } = await supabase
    .from("schools")
    .select("id")
    .eq("director_id", session.user.id)
    .single()

  if (escolaError || !escola) {
    console.error("Erro ao buscar escola:", escolaError)
    throw new Error(
      "Escola não encontrada para este usuário. Verifique se você está logado como diretor de uma escola.",
    )
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={escolaSidebarIcons}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Novo Professor</h1>
        <ProfessorForm escolaId={escola.id} />
      </div>
    </DashboardLayout>
  )
}

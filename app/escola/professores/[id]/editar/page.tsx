import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfessorEditForm } from "@/components/escola/professores/professor-edit-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export default async function EditarProfessorPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/escola/login")
  }

  const { data: escola } = await supabase.from("schools").select("id").eq("director_id", session.user.id).single()

  if (!escola) {
    redirect("/escola/login")
  }

  const { data: professor } = await supabase.from("teachers").select("*").eq("id", params.id).single()

  if (!professor) {
    redirect("/escola/professores")
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Editar Professor</h1>
        <ProfessorEditForm professor={professor} escolaId={escola.id} />
      </div>
    </DashboardLayout>
  )
}

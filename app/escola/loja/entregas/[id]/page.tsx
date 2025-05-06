import { getSupabaseServer } from "@/lib/supabase/server"
import { getEntregaById } from "@/lib/services/loja-service"
import { EntregaDetalhes } from "@/components/escola/loja/entrega-detalhes"
import { getEscolaIdFromUser } from "@/lib/services/school-service"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export default async function EntregaPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/escola/login")
  }

  try {
    const escolaId = await getEscolaIdFromUser()
    const entrega = await getEntregaById(params.id)

    if (!entrega) {
      return (
        <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
          <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Detalhes da Entrega</h1>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
              Entrega não encontrada.
            </div>
          </div>
        </DashboardLayout>
      )
    }

    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Detalhes da Entrega</h1>
          <EntregaDetalhes entrega={entrega} escolaId={escolaId} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error("Erro ao carregar detalhes da entrega:", error)
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Detalhes da Entrega</h1>
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            Erro ao carregar detalhes da entrega. Por favor, tente novamente mais tarde.
          </div>
        </div>
      </DashboardLayout>
    )
  }
}

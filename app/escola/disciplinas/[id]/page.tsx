import { DisciplinaDetalhes } from "@/components/escola/disciplinas/disciplina-detalhes"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { getSessionAndSchoolId } from "@/lib/session-utils"

export default async function DisciplinaDetalhesPage({ params }: { params: { id: string } }) {
  // Não vamos redirecionar para login aqui, apenas buscar a sessão se disponível
  const { schoolId } = await getSessionAndSchoolId()

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Detalhes da Disciplina</h1>
        <DisciplinaDetalhes id={params.id} schoolId={schoolId} />
      </div>
    </DashboardLayout>
  )
}

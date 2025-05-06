import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { VinculoPageWrapper } from "@/components/escola/vinculos/vinculo-page-wrapper"

export default function NovoVinculoPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Novo Vínculo</h1>
          <p className="text-gray-600 mb-6">Crie um novo vínculo entre professor, turma e disciplina.</p>
          <VinculoPageWrapper />
        </div>
      </div>
    </DashboardLayout>
  )
}

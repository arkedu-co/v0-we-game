import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { VinculosPageContent } from "@/components/escola/vinculos/vinculos-page-content"

export default function VinculosPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Vínculos</h1>
          <p className="text-gray-600 mb-6">Gerencie os vínculos entre professores, turmas e disciplinas.</p>
          <VinculosPageContent />
        </div>
      </div>
    </DashboardLayout>
  )
}

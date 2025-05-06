import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { ProfessoresCardList } from "@/components/escola/professores/professores-card-list"

export default function ProfessoresPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Professores</h1>
        <ProfessoresCardList />
      </div>
    </DashboardLayout>
  )
}

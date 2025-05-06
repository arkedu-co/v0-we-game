import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AlunosList } from "@/components/escola/alunos/alunos-list"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"

export default function AlunosPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Alunos</h1>
        <AlunosList />
      </div>
    </DashboardLayout>
  )
}

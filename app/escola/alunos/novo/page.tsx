import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AlunoForm } from "@/components/escola/alunos/aluno-form"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"

export default function NovoAlunoPage() {
  return (
    <DashboardLayout
      userType="escola"
      sidebarContent={escolaSidebarContent}
      sidebarIcons={<EscolaSidebarIcons />}
      activeItem="alunos"
    >
      <div className="container mx-auto py-6">
        <AlunoForm />
      </div>
    </DashboardLayout>
  )
}

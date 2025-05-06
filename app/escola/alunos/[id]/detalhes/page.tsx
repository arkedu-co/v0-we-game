import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AlunoDetalhes } from "@/components/escola/alunos/aluno-detalhes"
import { notFound } from "next/navigation"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export default async function AlunoDetalhesPage({ params }: { params: { id: string } }) {
  const alunoId = params?.id

  if (!alunoId) {
    return notFound()
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Detalhes do Aluno</h1>
        <AlunoDetalhes alunoId={alunoId} />
      </div>
    </DashboardLayout>
  )
}

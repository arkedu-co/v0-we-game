import { getAluno } from "@/lib/actions/aluno-actions"
import { AlunoForm } from "@/components/escola/alunos/aluno-form"
import { notFound } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export default async function AlunoDetailPage({ params }: { params: { id: string } }) {
  try {
    // Se o ID for "novo", renderizar o formulário de criação
    if (params.id === "novo") {
      return (
        <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
          <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Novo Aluno</h1>
            <AlunoForm />
          </div>
        </DashboardLayout>
      )
    }

    // Caso contrário, buscar o aluno pelo ID
    const aluno = await getAluno(params.id)

    if (!aluno) {
      return notFound()
    }

    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Editar Aluno</h1>
          <AlunoForm aluno={aluno} isEditing={true} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error("Erro ao carregar aluno:", error)
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Erro</h1>
          <p className="text-red-500">Erro ao carregar dados do aluno.</p>
        </div>
      </DashboardLayout>
    )
  }
}

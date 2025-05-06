import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TurmasList } from "@/components/escola/turmas/turmas-list"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gerenciar Turmas | Sistema Escolar",
  description: "Gerencie as turmas da sua escola",
}

export default function TurmasPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Turmas</h1>
        <p className="text-gray-600">Cadastre e gerencie as turmas da sua escola.</p>
        <TurmasList />
      </div>
    </DashboardLayout>
  )
}

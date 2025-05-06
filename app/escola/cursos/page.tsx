import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CursosListAlt } from "@/components/escola/cursos/cursos-list-alt"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gerenciar Cursos | Sistema Escolar",
  description: "Gerencie os cursos da sua escola",
}

export default function CursosPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cursos</h1>
        <p className="text-gray-600">Cadastre e gerencie os cursos da sua escola.</p>
        <CursosListAlt />
      </div>
    </DashboardLayout>
  )
}

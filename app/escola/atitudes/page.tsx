import type { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import AtitudesList from "@/components/escola/atitudes/atitudes-list"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export const metadata: Metadata = {
  title: "Atitudes - Sistema Escolar",
  description: "Gerenciamento de atitudes para o sistema de gamificação",
}

export default function AtitudesPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Atitudes</h1>
        <p className="text-gray-500">Gerencie as atitudes positivas e negativas dos alunos.</p>
        <AtitudesList />
      </div>
    </DashboardLayout>
  )
}

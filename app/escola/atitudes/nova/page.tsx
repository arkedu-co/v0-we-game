import type { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import AtitudeForm from "@/components/escola/atitudes/atitude-form"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export const metadata: Metadata = {
  title: "Nova Atitude - Sistema Escolar",
  description: "Cadastro de nova atitude para o sistema de gamificação",
}

export default function NovaAtitudePage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={EscolaSidebarIcons}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Atitude</h1>
          <p className="text-muted-foreground">Cadastre uma nova atitude no sistema</p>
        </div>
        <AtitudeForm />
      </div>
    </DashboardLayout>
  )
}

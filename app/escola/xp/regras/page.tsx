import type { Metadata } from "next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import RegrasXPList from "@/components/escola/xp/regras-xp-list"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

export const metadata: Metadata = {
  title: "Regras de XP - Sistema Escolar",
  description: "Gerenciamento de regras de XP",
}

export default function RegrasXPPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regras de XP</h1>
          <p className="text-muted-foreground">Gerencie as regras de XP do sistema</p>
        </div>
        <RegrasXPList />
      </div>
    </DashboardLayout>
  )
}

import type { Metadata } from "next"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import DashboardLayout from "@/components/layout/dashboard-layout"
import NiveisXPList from "@/components/escola/xp/niveis-xp-list"

export const metadata: Metadata = {
  title: "Níveis de XP - Sistema Escolar",
  description: "Gerenciamento de níveis de XP",
}

export default function NiveisXPPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={[]} sidebarIcons={EscolaSidebarIcons}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Níveis de XP</h1>
          <p className="text-muted-foreground">Gerencie os níveis de XP e avatares do sistema</p>
        </div>
        <NiveisXPList />
      </div>
    </DashboardLayout>
  )
}

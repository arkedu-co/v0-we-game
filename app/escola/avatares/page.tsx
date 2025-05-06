import type { Metadata } from "next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import AvataresList from "@/components/escola/avatares/avatares-list"

export const metadata: Metadata = {
  title: "Avatares - Sistema Escolar",
  description: "Gerenciamento de avatares para gamificação",
}

export default function AvataresPagina() {
  return (
    <DashboardLayout userType="escola" sidebarIcons={<EscolaSidebarIcons />}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Avatares</h1>
            <p className="text-muted-foreground">Gerencie os avatares disponíveis para os níveis de XP e alunos</p>
          </div>
          <Link href="/escola/avatares/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Avatar
            </Button>
          </Link>
        </div>

        <AvataresList />
      </div>
    </DashboardLayout>
  )
}

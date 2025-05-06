import type { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import AtitudeForm from "@/components/escola/atitudes/atitude-form"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { escolaSidebarIcons } from "@/components/escola/sidebar-icons"

export const metadata: Metadata = {
  title: "Editar Atitude - Sistema Escolar",
  description: "Edição de atitude para o sistema de gamificação",
}

interface EditarAtitudePageProps {
  params: {
    id: string
  }
}

export default function EditarAtitudePage({ params }: EditarAtitudePageProps) {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={escolaSidebarIcons}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Atitude</h1>
          <p className="text-muted-foreground">Atualize as informações da atitude</p>
        </div>
        <AtitudeForm id={params.id} />
      </div>
    </DashboardLayout>
  )
}

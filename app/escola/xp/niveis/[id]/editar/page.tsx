import type { Metadata } from "next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import NivelXPForm from "@/components/escola/xp/nivel-xp-form"

export const metadata: Metadata = {
  title: "Editar Nível de XP - Sistema Escolar",
  description: "Edição de nível de XP",
}

export default function EditarNivelXPPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Nível de XP</h1>
          <p className="text-muted-foreground">Atualize as informações do nível de XP</p>
        </div>
        <NivelXPForm id={params.id} />
      </div>
    </DashboardLayout>
  )
}

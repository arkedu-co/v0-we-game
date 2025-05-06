import type { Metadata } from "next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import RegraXPForm from "@/components/escola/xp/regra-xp-form"

export const metadata: Metadata = {
  title: "Editar Regra de XP - Sistema Escolar",
  description: "Edição de regra de XP",
}

export default function EditarRegraXPPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Regra de XP</h1>
          <p className="text-muted-foreground">Atualize as informações da regra de XP</p>
        </div>
        <RegraXPForm id={params.id} />
      </div>
    </DashboardLayout>
  )
}

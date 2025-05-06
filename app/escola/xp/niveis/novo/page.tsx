import type { Metadata } from "next"
import DashboardLayout from "@/components/layout/dashboard-layout"
import NivelXPForm from "@/components/escola/xp/nivel-xp-form"

export const metadata: Metadata = {
  title: "Novo Nível de XP - Sistema Escolar",
  description: "Cadastro de novo nível de XP",
}

export default function NovoNivelXPPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Nível de XP</h1>
          <p className="text-muted-foreground">Cadastre um novo nível de XP com avatar</p>
        </div>
        <NivelXPForm />
      </div>
    </DashboardLayout>
  )
}

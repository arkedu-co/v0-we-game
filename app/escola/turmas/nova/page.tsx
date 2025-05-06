"use client"

import { TurmaForm } from "@/components/escola/turmas/turma-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { escolaSidebarIcons } from "@/components/escola/sidebar-icons"

export default function NovaTurmaPage() {
  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={escolaSidebarIcons}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Nova Turma</h1>
        <TurmaForm redirectToList={true} />
      </div>
    </DashboardLayout>
  )
}

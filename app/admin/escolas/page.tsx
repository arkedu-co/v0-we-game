import type { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SchoolsList } from "@/components/admin/schools-list"
import { adminSidebarContent } from "@/components/admin/sidebar-content"
import { AdminSidebarIcons } from "@/components/admin/sidebar-icons"

export const metadata: Metadata = {
  title: "Gerenciar Escolas | Sistema Escolar",
  description: "Gerencie as escolas cadastradas no sistema",
}

export default function SchoolsPage() {
  return (
    <DashboardLayout
      userType="admin"
      sidebarContent={adminSidebarContent({ activeItem: "escolas" })}
      sidebarIcons={<AdminSidebarIcons />}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary-dark">Gerenciar Escolas</h1>
        <p className="text-muted-foreground">Cadastre e gerencie as escolas do sistema.</p>
        <SchoolsList />
      </div>
    </DashboardLayout>
  )
}

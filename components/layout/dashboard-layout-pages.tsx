"use client"

// Versão do DashboardLayout para uso em pages/
import type React from "react"
import { useRouter } from "next/router"

// Resto do componente sem usar next/headers
export function DashboardLayoutPages({
  children,
  userType = "admin",
  sidebarContent,
  sidebarIcons,
}: {
  children: React.ReactNode
  userType?: "admin" | "escola" | "professor" | "aluno" | "responsavel"
  sidebarContent?: React.ReactNode
  sidebarIcons?: React.ReactNode
}) {
  const router = useRouter()

  // Lógica que não depende de next/headers

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          {/* Conteúdo da sidebar */}
          {sidebarContent}
          {sidebarIcons}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

// Re-exportar o DashboardLayout original como default para manter compatibilidade
export { default } from "./dashboard-layout"

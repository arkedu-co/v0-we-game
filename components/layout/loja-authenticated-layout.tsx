"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"

interface LojaAuthenticatedLayoutProps {
  children: React.ReactNode
}

export function LojaAuthenticatedLayout({ children }: LojaAuthenticatedLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("Sessão não encontrada, redirecionando para login")
          router.push("/escola/login?redirect=" + encodeURIComponent(window.location.pathname))
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        router.push("/escola/login?redirect=" + encodeURIComponent(window.location.pathname))
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAuthenticated) {
    return null // Não renderiza nada, pois o redirecionamento já foi iniciado
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      {children}
    </DashboardLayout>
  )
}

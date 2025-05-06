"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { AuthErrorFallback } from "@/components/auth/auth-error-fallback"

interface ClientAuthCheckProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ClientAuthCheck({ children, redirectTo = "/escola/login" }: ClientAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao verificar sessão:", error)
          setIsAuthenticated(false)
          return
        }

        if (data.session) {
          setIsAuthenticated(true)
        } else {
          console.log("Sessão não encontrada")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase.auth, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthErrorFallback
        message="Você precisa estar autenticado para acessar esta página."
        redirectTo={`${redirectTo}?redirectTo=${window.location.pathname}`}
      />
    )
  }

  return <>{children}</>
}

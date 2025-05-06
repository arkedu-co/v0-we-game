"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SessionCheck({
  redirectTo = "/login",
  userType = null,
}: { redirectTo?: string; userType?: string | null }) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao verificar sessão:", error)
          router.push(redirectTo)
          return
        }

        if (!data.session) {
          console.log("Sessão não encontrada, redirecionando")
          router.push(redirectTo)
          return
        }

        // Se userType for especificado, verificar o tipo de usuário
        if (userType) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", data.session.user.id)
            .single()

          if (profileError || profile?.user_type !== userType) {
            console.log(`Usuário não é ${userType}, redirecionando`)
            router.push(redirectTo)
            return
          }
        }

        setChecking(false)
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        router.push(redirectTo)
      }
    }

    checkSession()
  }, [redirectTo, router, supabase, userType])

  return null
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Criar cliente Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Construir URL com o erro
      const redirectUrl = new URL("/professor/login", request.url)
      redirectUrl.searchParams.set("error", error.message)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar se o usuário é um professor
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile || profile.user_type !== "professor") {
      // Fazer logout se não for professor
      await supabase.auth.signOut()
      const redirectUrl = new URL("/professor/login", request.url)
      redirectUrl.searchParams.set("error", "acesso_nao_autorizado")
      return NextResponse.redirect(redirectUrl)
    }

    // Redirecionar para o dashboard
    return NextResponse.redirect(new URL("/professor/dashboard", request.url))
  } catch (error) {
    console.error("Erro no login:", error)
    const redirectUrl = new URL("/professor/login", request.url)
    redirectUrl.searchParams.set("error", "erro_inesperado")
    return NextResponse.redirect(redirectUrl)
  }
}

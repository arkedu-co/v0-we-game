import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Verificar se o email existe e é de um professor
    const { data: userExists } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("email", email)
      .eq("user_type", "professor")
      .single()

    if (!userExists) {
      // Não informar ao usuário que o email não existe por segurança
      // Apenas redirecionar para a página de confirmação
      return NextResponse.redirect(new URL("/professor/recuperar-senha/confirmacao", request.url))
    }

    // Enviar email de recuperação de senha
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/professor/redefinir-senha`,
    })

    if (error) {
      console.error("[Recuperar Senha] Erro:", error)
      return NextResponse.json({ error: "Ocorreu um erro ao processar a solicitação" }, { status: 500 })
    }

    return NextResponse.redirect(new URL("/professor/recuperar-senha/confirmacao", request.url))
  } catch (error) {
    console.error("[Recuperar Senha API] Erro:", error)
    return NextResponse.json({ error: "Ocorreu um erro ao processar a solicitação" }, { status: 500 })
  }
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const workload = formData.get("workload") ? Number.parseInt(formData.get("workload") as string) : null
    const description = formData.get("description") as string
    const active = formData.get("active") === "on"
    const escolaId = formData.get("escolaId") as string

    // Validar dados
    if (!name || !escolaId) {
      return NextResponse.json({ error: "Nome da disciplina e ID da escola são obrigatórios" }, { status: 400 })
    }

    // Criar cliente Supabase
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Inserir disciplina
    const { data, error } = await supabase
      .from("subjects")
      .insert([
        {
          name,
          code,
          workload,
          description,
          active,
          school_id: escolaId,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar disciplina:", error)
      return NextResponse.json({ error: `Erro ao criar disciplina: ${error.message}` }, { status: 500 })
    }

    // Redirecionar para a lista de disciplinas
    return NextResponse.redirect(new URL("/escola/disciplinas", request.url))
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

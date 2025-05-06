import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getSchoolIdForCurrentUser } from "@/lib/actions/school-actions"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)
    const schoolId = await getSchoolIdForCurrentUser()

    const { data, error } = await supabase.from("economia_config").select("*").eq("school_id", schoolId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 é o código para "nenhum resultado encontrado"
      console.error("Erro ao buscar configuração de economia:", error)
      return NextResponse.json({ error: "Erro ao buscar configuração" }, { status: 500 })
    }

    return NextResponse.json(data || { school_id: schoolId, salario_diario_atomos: 0 })
  } catch (error) {
    console.error("Erro ao buscar configuração de economia:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)
    const schoolId = await getSchoolIdForCurrentUser()
    const body = await request.json()

    // Verificar se já existe uma configuração para esta escola
    const { data: existingConfig, error: queryError } = await supabase
      .from("economia_config")
      .select("id")
      .eq("school_id", schoolId)
      .maybeSingle()

    if (queryError) {
      console.error("Erro ao verificar configuração existente:", queryError)
      return NextResponse.json({ error: "Erro ao verificar configuração existente" }, { status: 500 })
    }

    let result

    if (existingConfig) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from("economia_config")
        .update({
          salario_diario_atomos: body.salario_diario_atomos,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select()
        .single()

      if (error) {
        console.error("Erro ao atualizar configuração:", error)
        return NextResponse.json({ error: "Erro ao atualizar configuração" }, { status: 500 })
      }

      result = data
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from("economia_config")
        .insert({
          school_id: schoolId,
          salario_diario_atomos: body.salario_diario_atomos,
        })
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar configuração:", error)
        return NextResponse.json({ error: "Erro ao criar configuração" }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

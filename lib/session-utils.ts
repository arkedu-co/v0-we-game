import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getSessionAndSchoolId() {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)

    // Verificar a sessão do usuário
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.log("Sessão não encontrada ou erro:", sessionError)
      return { session: null, escolaId: null, error: sessionError || new Error("Sessão não encontrada") }
    }

    console.log("Sessão encontrada para usuário:", session.user.id)

    // Verificar o tipo de usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.log("Erro ao buscar perfil:", profileError)
      return { session, escolaId: null, error: profileError }
    }

    console.log("Perfil encontrado, tipo:", profile?.user_type)

    // Buscar o ID da escola
    let escolaId = null

    // 1. Se o usuário for uma escola, usar o ID do usuário como ID da escola
    if (profile?.user_type === "escola") {
      // Verificar se o usuário é uma escola diretamente
      const { data: escolaDireta } = await supabase.from("schools").select("id").eq("id", session.user.id).single()

      if (escolaDireta) {
        console.log("Escola encontrada diretamente:", escolaDireta.id)
        escolaId = escolaDireta.id
      }
    }

    // 2. Buscar a escola pelo ID do diretor
    if (!escolaId) {
      const { data: escolaDiretor } = await supabase
        .from("schools")
        .select("id")
        .eq("director_id", session.user.id)
        .single()

      if (escolaDiretor) {
        console.log("Escola encontrada pelo diretor:", escolaDiretor.id)
        escolaId = escolaDiretor.id
      }
    }

    // 3. Buscar a escola pelo ID do proprietário
    if (!escolaId) {
      const { data: escolaProprietario } = await supabase
        .from("schools")
        .select("id")
        .eq("owner_id", session.user.id)
        .single()

      if (escolaProprietario) {
        console.log("Escola encontrada pelo proprietário:", escolaProprietario.id)
        escolaId = escolaProprietario.id
      }
    }

    // 4. Se for um professor, buscar a escola associada
    if (!escolaId && profile?.user_type === "professor") {
      const { data: professor } = await supabase.from("teachers").select("school_id").eq("id", session.user.id).single()

      if (professor?.school_id) {
        console.log("Escola encontrada pelo professor:", professor.school_id)
        escolaId = professor.school_id
      }
    }

    // 5. Se for um administrador, usar a primeira escola
    if (!escolaId && profile?.user_type === "admin") {
      const { data: escolas } = await supabase.from("schools").select("id").limit(1)

      if (escolas && escolas.length > 0) {
        console.log("Escola encontrada para admin:", escolas[0].id)
        escolaId = escolas[0].id
      }
    }

    if (!escolaId) {
      console.log("Não foi possível encontrar o ID da escola para o usuário:", session.user.id)
    }

    return { session, escolaId, error: null }
  } catch (error) {
    console.error("Erro ao verificar sessão e escola:", error)
    return { session: null, escolaId: null, error }
  }
}

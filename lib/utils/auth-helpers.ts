import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getSupabaseClient } from "@/lib/supabase/client"

export async function getAuthenticatedUser() {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)

    // Tentar obter a sessão até 3 vezes
    let session = null
    let sessionError = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await supabase.auth.getSession()
        if (result.error) {
          sessionError = result.error
          console.error(`Erro ao obter sessão (tentativa ${attempt}/3):`, result.error)
          // Esperar antes de tentar novamente
          if (attempt < 3) await new Promise((r) => setTimeout(r, 500))
        } else {
          session = result.data.session
          if (session) break
        }
      } catch (error) {
        console.error(`Exceção ao obter sessão (tentativa ${attempt}/3):`, error)
        if (attempt < 3) await new Promise((r) => setTimeout(r, 500))
      }
    }

    if (!session?.user) {
      return { authenticated: false, user: null, error: sessionError }
    }

    return { authenticated: true, user: session.user, error: null }
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return { authenticated: false, user: null, error }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Erro ao buscar perfil:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return null
  }
}

// Nova função para obter o ID da escola da sessão do usuário
export async function getSchoolIdFromSession() {
  try {
    const supabase = getSupabaseClient()

    // Obter a sessão atual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError)
      throw new Error("Erro de autenticação. Por favor, faça login novamente.")
    }

    if (!sessionData.session?.user) {
      console.error("Usuário não autenticado")
      throw new Error("Usuário não autenticado. Por favor, faça login.")
    }

    const userId = sessionData.session.user.id

    // Buscar o perfil do usuário para obter o tipo de usuário
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError)
      throw new Error("Erro ao buscar informações do perfil.")
    }

    const userType = profileData?.user_type

    // Determinar o ID da escola com base no tipo de usuário
    if (userType === "escola") {
      // Se for uma escola, buscar pelo ID do diretor
      const { data: escola, error: escolaError } = await supabase
        .from("schools")
        .select("id")
        .eq("director_id", userId)
        .single()

      if (escolaError) {
        console.error("Erro ao buscar escola pelo director_id:", escolaError)

        // Tentar buscar pelo owner_id como fallback
        const { data: escolaOwner, error: escolaOwnerError } = await supabase
          .from("schools")
          .select("id")
          .eq("owner_id", userId)
          .single()

        if (escolaOwnerError) {
          console.error("Erro ao buscar escola pelo owner_id:", escolaOwnerError)
          throw new Error("Não foi possível encontrar a escola associada ao usuário.")
        }

        return escolaOwner.id
      }

      return escola.id
    } else if (userType === "professor") {
      // Se for um professor, buscar a escola associada
      const { data: professor, error: professorError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", userId)
        .single()

      if (professorError) {
        console.error("Erro ao buscar professor:", professorError)
        throw new Error("Não foi possível encontrar o professor no sistema.")
      }

      return professor.school_id
    } else if (userType === "aluno") {
      // Se for um aluno, buscar a escola associada
      const { data: aluno, error: alunoError } = await supabase
        .from("students")
        .select("school_id")
        .eq("id", userId)
        .single()

      if (alunoError) {
        console.error("Erro ao buscar aluno:", alunoError)
        throw new Error("Não foi possível encontrar o aluno no sistema.")
      }

      return aluno.school_id
    }

    // Verificar pelo owner_id como última tentativa
    const { data: escolaOwner, error: escolaOwnerError } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", userId)
      .single()

    if (escolaOwnerError) {
      console.error("Erro ao buscar escola pelo owner_id:", escolaOwnerError)
      throw new Error("Não foi possível determinar a escola associada ao usuário.")
    }

    return escolaOwner.id
  } catch (error) {
    console.error("Erro ao obter ID da escola:", error)
    throw error
  }
}

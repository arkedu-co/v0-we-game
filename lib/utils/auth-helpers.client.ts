import { getSupabaseClient } from "@/lib/supabase/client"

// Versão específica para cliente - não usa cookies()
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

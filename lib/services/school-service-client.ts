import { getSupabaseClient } from "@/lib/supabase/client"

// Update the getEscolaIdFromUserClient function to not rely on profiles.school_id

export async function getEscolaIdFromUserClient() {
  const supabase = getSupabaseClient()

  try {
    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.error("Error getting session:", sessionError)
      throw new Error("Usuário não autenticado")
    }

    const userId = session.user.id

    // Verificar se o usuário é uma escola
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error getting user profile:", profileError)
      throw new Error("Erro ao buscar perfil do usuário")
    }

    // Se o usuário for do tipo "escola", o ID do usuário é o ID da escola
    if (profile.user_type === "escola") {
      // Verificar se existe um registro na tabela schools
      const { data: school, error: schoolError } = await supabase.from("schools").select("id").eq("id", userId).single()

      if (schoolError) {
        console.error("Error getting school:", schoolError)
        throw new Error("Escola não encontrada")
      }

      return school.id
    }

    // Se o usuário for um professor, verificar se ele está associado a uma escola
    if (profile.user_type === "professor") {
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", userId)
        .single()

      if (teacherError) {
        console.error("Error getting teacher:", teacherError)
        throw new Error("Professor não encontrado ou não associado a uma escola")
      }

      return teacher.school_id
    }

    // Verificar diretamente na tabela schools se o usuário é um proprietário de escola
    const { data: directSchool, error: directSchoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", userId)
      .single()

    if (!directSchoolError && directSchool) {
      return directSchool.id
    }

    // Se chegou aqui, o usuário não tem permissão para acessar recursos da escola
    throw new Error("Usuário não tem permissão para acessar esta escola")
  } catch (error) {
    console.error("Error in getEscolaIdFromUserClient:", error)
    throw error
  }
}

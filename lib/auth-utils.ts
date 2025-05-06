import { getSupabaseClient } from "@/lib/supabase/client"

export async function checkAuthentication() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Erro ao verificar sessão:", error)
      return { authenticated: false, error }
    }

    if (!data.session) {
      return { authenticated: false, error: new Error("Sessão não encontrada") }
    }

    return { authenticated: true, user: data.session.user }
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return { authenticated: false, error }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = getSupabaseClient()
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

export async function getSchoolId(userId: string) {
  try {
    const supabase = getSupabaseClient()

    // Primeiro, tente buscar pelo ID do diretor ou proprietário
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .or(`director_id.eq.${userId},owner_id.eq.${userId}`)
      .single()

    if (!schoolError && schoolData) {
      return schoolData.id
    }

    // Se não encontrar, tente buscar diretamente pelo ID da escola
    const { data: directSchool, error: directSchoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("id", userId)
      .single()

    if (!directSchoolError && directSchool) {
      return directSchool.id
    }

    // Se ainda não encontrou, use o ID do usuário como ID da escola
    return userId
  } catch (error) {
    console.error("Erro ao buscar ID da escola:", error)
    return userId
  }
}

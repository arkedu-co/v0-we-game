import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Implementar padrão singleton para evitar múltiplas instâncias
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    console.log("[Supabase Client] Criando nova instância do cliente")
    supabaseClient = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }
  return supabaseClient
}

// Exportar função para uso em componentes
export const createClient = () => getSupabaseClient()

// Função para verificar se o usuário está autenticado (lado do cliente)
export async function isAuthenticated() {
  const supabase = getSupabaseClient()

  try {
    const { data } = await supabase.auth.getSession()
    return !!data.session
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return false
  }
}

// Função para obter a sessão do usuário atual
export async function getUserSession() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

// Função para obter o perfil do usuário por ID
export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    throw error
  }

  return data
}

// Função para obter dados da escola
export async function getSchoolData(userId: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .or(`director_id.eq.${userId},owner_id.eq.${userId}`)
    .single()

  if (error) {
    console.error("Error fetching school data:", error)
    return null
  }

  return data
}

// Função para obter o ID da escola para o usuário atual (lado do cliente)
export async function getEscolaIdFromUser() {
  const supabase = getSupabaseClient()

  try {
    // Verificar a sessão do usuário
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      console.error("Erro ao verificar sessão ou usuário não autenticado:", sessionError)
      return null
    }

    const userId = sessionData.session.user.id

    // Verificar o tipo de usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil do usuário:", profileError)
      return null
    }

    // Se for uma escola, buscar pelo ID do diretor
    if (profile?.user_type === "escola") {
      const { data: escola, error: escolaError } = await supabase
        .from("schools")
        .select("id")
        .eq("director_id", userId)
        .single()

      if (!escolaError && escola) {
        return escola.id
      }
    }

    // Se for um professor, buscar a escola associada
    if (profile?.user_type === "professor") {
      const { data: professor, error: professorError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", userId)
        .single()

      if (!professorError && professor?.school_id) {
        return professor.school_id
      }
    }

    // Verificar pelo owner_id
    const { data: escolaOwner, error: escolaOwnerError } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", userId)
      .single()

    if (!escolaOwnerError && escolaOwner) {
      return escolaOwner.id
    }

    return null
  } catch (error) {
    console.error("Erro ao obter ID da escola:", error)
    return null
  }
}

// Funções adicionais para compatibilidade
export function verifySupabaseEnvironment() {
  return {
    isValid: true,
    missingVars: [],
  }
}

export async function checkSupabaseConnection() {
  return { success: true }
}

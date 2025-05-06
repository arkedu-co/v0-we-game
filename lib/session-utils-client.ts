import { createClient } from "@/lib/supabase/client"

export async function getSessionAndSchoolIdClient() {
  try {
    const supabase = createClient()

    // Verificar a sessão do usuário
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return { session: null, schoolId: null, error: sessionError || new Error("Sessão não encontrada") }
    }

    const userId = session.user.id

    // Verificar o tipo de usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .single()

    if (profileError) {
      return { session, schoolId: null, error: profileError }
    }

    // Buscar o ID da escola com base no tipo de usuário
    let schoolId = null

    // Se for uma escola, buscar pelo ID do diretor
    if (profile?.user_type === "escola") {
      const { data: escola, error: escolaError } = await supabase
        .from("schools")
        .select("id")
        .eq("director_id", userId)
        .single()

      if (!escolaError && escola) {
        schoolId = escola.id
      }
    }

    // Se for um professor, buscar a escola associada
    if (!schoolId && profile?.user_type === "professor") {
      const { data: professor, error: professorError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", userId)
        .single()

      if (!professorError && professor?.school_id) {
        schoolId = professor.school_id
      }
    }

    // Verificar pelo owner_id
    if (!schoolId) {
      const { data: escolaOwner, error: escolaOwnerError } = await supabase
        .from("schools")
        .select("id")
        .eq("owner_id", userId)
        .single()

      if (!escolaOwnerError && escolaOwner) {
        schoolId = escolaOwner.id
      }
    }

    // Se for um aluno, buscar a escola associada
    if (!schoolId && profile?.user_type === "aluno") {
      const { data: aluno, error: alunoError } = await supabase
        .from("students")
        .select("school_id")
        .eq("id", userId)
        .single()

      if (!alunoError && aluno?.school_id) {
        schoolId = aluno.school_id
      }
    }

    // Se for um responsável, buscar a escola associada (se aplicável)
    if (!schoolId && profile?.user_type === "responsavel") {
      // Lógica para buscar escola do responsável, se necessário
    }

    // Se for um administrador, usar a primeira escola (para fins de teste)
    if (!schoolId && profile?.user_type === "admin") {
      const { data: escolas } = await supabase.from("schools").select("id").limit(1)

      if (escolas && escolas.length > 0) {
        schoolId = escolas[0].id
      }
    }

    if (!schoolId) {
      console.warn("Não foi possível determinar o ID da escola para o usuário:", userId)
    }

    return { session, schoolId, error: null }
  } catch (error) {
    console.error("Erro ao verificar sessão e escola (cliente):", error)
    return { session: null, schoolId: null, error }
  }
}

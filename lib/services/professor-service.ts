import { getSupabaseClient } from "@/lib/supabase/client"

export async function fetchProfessores(schoolId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teachers")
    .select(`
      *,
      profile:profiles!teachers_id_fkey (*)
    `)
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar professores:", error)
    throw new Error("Erro ao buscar professores")
  }

  return data || []
}

export async function getProfessor(id: string) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw new Error("ID inválido")
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teachers")
    .select(`
      *,
      profile:profiles!teachers_id_fkey (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar professor:", error)
    throw new Error("Erro ao buscar professor")
  }

  return data
}

export async function createProfessor(professor: {
  school_id: string
  full_name: string
  email: string
  password: string
  education?: string
  subjects?: string[]
}) {
  const supabase = getSupabaseClient()

  // Criar conta de usuário
  const { data: userData, error: userError } = await supabase.auth.signUp({
    email: professor.email,
    password: professor.password,
  })

  if (userError || !userData.user) {
    console.error("Erro ao criar usuário:", userError)
    throw new Error("Erro ao criar usuário")
  }

  const userId = userData.user.id

  // Criar perfil
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: userId,
      full_name: professor.full_name,
      email: professor.email,
      user_type: "professor",
    },
  ])

  if (profileError) {
    console.error("Erro ao criar perfil:", profileError)
    throw new Error("Erro ao criar perfil")
  }

  // Criar registro de professor
  const { data: teacherData, error: teacherError } = await supabase
    .from("teachers")
    .insert([
      {
        id: userId,
        school_id: professor.school_id,
        education: professor.education,
        subjects: professor.subjects,
      },
    ])
    .select()
    .single()

  if (teacherError) {
    console.error("Erro ao criar professor:", teacherError)
    throw new Error("Erro ao criar professor")
  }

  return teacherData
}

export async function updateProfessor(
  id: string,
  professor: {
    full_name: string
    email: string
    education?: string
    subjects?: string[]
  },
) {
  const supabase = getSupabaseClient()

  // Atualizar perfil
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: professor.full_name,
      email: professor.email,
    })
    .eq("id", id)

  if (profileError) {
    console.error("Erro ao atualizar perfil:", profileError)
    throw new Error("Erro ao atualizar perfil")
  }

  // Atualizar registro de professor
  const { data: teacherData, error: teacherError } = await supabase
    .from("teachers")
    .update({
      education: professor.education,
      subjects: professor.subjects,
    })
    .eq("id", id)
    .select()
    .single()

  if (teacherError) {
    console.error("Erro ao atualizar professor:", teacherError)
    throw new Error("Erro ao atualizar professor")
  }

  return teacherData
}

export async function deleteProfessor(id: string) {
  const supabase = getSupabaseClient()

  // Excluir perfil (isso excluirá em cascata o registro de professor)
  const { error } = await supabase.from("profiles").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir professor:", error)
    throw new Error("Erro ao excluir professor")
  }

  return { success: true }
}

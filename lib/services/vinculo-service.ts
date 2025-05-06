import { getSupabaseClient } from "@/lib/supabase/client"

export async function fetchVinculos(schoolId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teacher_class_subjects")
    .select(`
      *,
      teachers:teacher_id (
        id,
        profiles!teachers_id_fkey (
          full_name
        )
      ),
      classes:class_id (
        id,
        name,
        year
      ),
      subjects:subject_id (
        id,
        name
      )
    `)
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar vínculos:", error)
    throw new Error("Erro ao buscar vínculos")
  }

  return data || []
}

export async function createVinculo(vinculo: {
  school_id: string
  teacher_id: string
  class_id: string
  subject_id: string
}) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teacher_class_subjects").insert([vinculo]).select().single()

  if (error) {
    console.error("Erro ao criar vínculo:", error)
    throw new Error("Erro ao criar vínculo")
  }

  return data
}

export async function deleteVinculo(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("teacher_class_subjects").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir vínculo:", error)
    throw new Error("Erro ao excluir vínculo")
  }

  return { success: true }
}

export async function fetchProfessoresByTurma(turmaId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teacher_class_subjects")
    .select(`
      teachers:teacher_id (
        id,
        profiles!teachers_id_fkey (
          full_name
        )
      ),
      subjects:subject_id (
        id,
        name
      )
    `)
    .eq("class_id", turmaId)

  if (error) {
    console.error("Erro ao buscar professores da turma:", error)
    throw new Error("Erro ao buscar professores da turma")
  }

  return data || []
}

export async function fetchTurmasByProfessor(professorId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teacher_class_subjects")
    .select(`
      classes:class_id (
        id,
        name,
        year,
        course:course_id (
          id,
          name
        )
      ),
      subjects:subject_id (
        id,
        name
      )
    `)
    .eq("teacher_id", professorId)

  if (error) {
    console.error("Erro ao buscar turmas do professor:", error)
    throw new Error("Erro ao buscar turmas do professor")
  }

  return data || []
}

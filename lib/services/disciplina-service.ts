import { getSupabaseClient } from "@/lib/supabase/client"

export async function fetchDisciplinas(schoolId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", schoolId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Erro ao buscar disciplinas:", error)
    throw new Error("Erro ao buscar disciplinas")
  }

  return data || []
}

export async function getDisciplina(id: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("subjects").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar disciplina:", error)
    throw new Error("Erro ao buscar disciplina")
  }

  return data
}

export async function getDisciplinaById(id: string) {
  return getDisciplina(id)
}

export async function createDisciplina(disciplina: {
  school_id: string
  name: string
  description?: string
  image_url?: string
  code?: string
  workload?: number
  active?: boolean
}) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("subjects").insert([disciplina]).select().single()

  if (error) {
    console.error("Erro ao criar disciplina:", error)
    throw new Error("Erro ao criar disciplina")
  }

  return data
}

export async function updateDisciplina(
  id: string,
  disciplina: {
    name: string
    description?: string
    image_url?: string
    code?: string
    workload?: number
    active?: boolean
  },
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("subjects").update(disciplina).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar disciplina:", error)
    throw new Error("Erro ao atualizar disciplina")
  }

  return data
}

export async function deleteDisciplina(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("subjects").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir disciplina:", error)
    throw new Error("Erro ao excluir disciplina")
  }

  return { success: true }
}

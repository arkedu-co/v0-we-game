import { getSupabaseClient } from "@/lib/supabase/client"

// Tipo para o curso
export interface Course {
  id: string
  school_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Função para listar todos os cursos de uma escola
export async function listCursos(schoolId: string) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("courses").select("*").eq("school_id", schoolId).order("name")

    if (error) throw error

    return data
  } catch (error) {
    console.error("Erro ao listar cursos:", error)
    throw error
  }
}

// Função para obter um curso específico
export async function getCurso(id: string) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("courses").select("*").eq("id", id).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Erro ao obter curso ${id}:`, error)
    throw error
  }
}

// Função para criar um novo curso
export async function createCurso(cursoData: {
  school_id: string
  name: string
  description?: string
}) {
  const supabase = getSupabaseClient()

  try {
    // Gerar um UUID para o curso
    const id = crypto.randomUUID()

    const { data, error } = await supabase
      .from("courses")
      .insert({
        id,
        ...cursoData,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Erro ao criar curso:", error)
    throw error
  }
}

// Função para atualizar um curso existente
export async function updateCurso(
  id: string,
  cursoData: {
    name?: string
    description?: string
  },
) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("courses").update(cursoData).eq("id", id).select().single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Erro ao atualizar curso ${id}:`, error)
    throw error
  }
}

// Função para excluir um curso
export async function deleteCurso(id: string) {
  const supabase = getSupabaseClient()

  try {
    // Verificar se existem turmas associadas a este curso
    const { count: classCount, error: countError } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id)

    if (countError) throw countError

    if (classCount && classCount > 0) {
      throw new Error(`Não é possível excluir este curso pois existem ${classCount} turmas associadas a ele.`)
    }

    // Se não houver dependências, excluir o curso
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error(`Erro ao excluir curso ${id}:`, error)
    throw error
  }
}

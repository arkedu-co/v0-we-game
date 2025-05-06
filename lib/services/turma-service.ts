import { getSupabaseClient } from "@/lib/supabase/client"

// Função para listar todas as turmas de uma escola
export async function listTurmas(schoolId: string) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("classes")
      .select(`
        *,
        course:course_id(id, name),
        teacher:teacher_id(id)
      `)
      .eq("school_id", schoolId)
      .order("name")

    if (error) throw error

    // Buscar informações adicionais dos professores em uma consulta separada
    const turmasWithDetails = await Promise.all(
      data.map(async (turma) => {
        let teacherName = null

        // Se a turma tiver um professor, buscar o nome dele
        if (turma.teacher_id) {
          try {
            const { data: teacherData, error: teacherError } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", turma.teacher_id)
              .single()

            if (!teacherError && teacherData) {
              teacherName = teacherData.full_name
            }
          } catch (err) {
            console.error(`Erro ao buscar professor ${turma.teacher_id}:`, err)
          }
        }

        return {
          ...turma,
          teacher_name: teacherName,
          course_name: turma.course?.name || null,
        }
      }),
    )

    return turmasWithDetails
  } catch (error) {
    console.error("Erro ao listar turmas:", error)
    throw error
  }
}

// Função para obter uma turma específica
export async function getTurma(id: string) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("classes")
      .select(`
        *,
        course:course_id(id, name),
        teacher:teacher_id(id)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    // Buscar informações adicionais do professor em uma consulta separada
    let teacherName = null

    // Se a turma tiver um professor, buscar o nome dele
    if (data.teacher_id) {
      try {
        const { data: teacherData, error: teacherError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.teacher_id)
          .single()

        if (!teacherError && teacherData) {
          teacherName = teacherData.full_name
        }
      } catch (err) {
        console.error(`Erro ao buscar professor ${data.teacher_id}:`, err)
      }
    }

    // Formatar os dados para facilitar o acesso ao nome do professor e curso
    const formattedData = {
      ...data,
      teacher_name: teacherName,
      course_name: data.course?.name || null,
    }

    return formattedData
  } catch (error) {
    console.error(`Erro ao obter turma ${id}:`, error)
    throw error
  }
}

// Função para listar professores disponíveis para uma turma
export async function listProfessores(schoolId: string) {
  const supabase = getSupabaseClient()

  try {
    // Buscar todos os professores da escola
    const { data: teachers, error } = await supabase.from("teachers").select("id").eq("school_id", schoolId)

    if (error) throw error

    // Buscar os perfis dos professores
    const professorIds = teachers.map((teacher) => teacher.id)

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", professorIds)
      .order("full_name")

    if (profilesError) throw profilesError

    // Formatar os dados para facilitar o acesso
    const formattedData = profiles.map((profile) => ({
      id: profile.id,
      name: profile.full_name || "Professor sem nome",
    }))

    return formattedData
  } catch (error) {
    console.error("Erro ao listar professores:", error)
    throw error
  }
}

// Função para criar uma nova turma
export async function createTurma(turmaData: {
  school_id: string
  course_id: string
  name: string
  year: number
  teacher_id?: string
}) {
  const supabase = getSupabaseClient()

  try {
    // Gerar um UUID para a turma
    const id = crypto.randomUUID()

    // Adicionar um valor padrão para o campo grade
    const turmaWithGrade = {
      ...turmaData,
      grade: "default", // Valor padrão para satisfazer a restrição not-null
      id,
    }

    const { data, error } = await supabase.from("classes").insert(turmaWithGrade).select().single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Erro ao criar turma:", error)
    throw error
  }
}

// Função para atualizar uma turma existente
export async function updateTurma(
  id: string,
  turmaData: {
    course_id?: string
    name?: string
    year?: number
    teacher_id?: string | null
  },
) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("classes").update(turmaData).eq("id", id).select().single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Erro ao atualizar turma ${id}:`, error)
    throw error
  }
}

// Função para excluir uma turma
export async function deleteTurma(id: string) {
  const supabase = getSupabaseClient()

  try {
    // Verificar se existem alunos associados a esta turma
    const { count: studentCount, error: countError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("class", id)

    if (countError) throw countError

    if (studentCount && studentCount > 0) {
      throw new Error(`Não é possível excluir esta turma pois existem ${studentCount} alunos associados a ela.`)
    }

    // Verificar se existem notas associadas a esta turma
    const { count: gradesCount, error: gradesError } = await supabase
      .from("grades")
      .select("*", { count: "exact", head: true })
      .eq("class_id", id)

    if (gradesError) throw gradesError

    if (gradesCount && gradesCount > 0) {
      throw new Error(`Não é possível excluir esta turma pois existem ${gradesCount} notas associadas a ela.`)
    }

    // Verificar se existem registros de presença associados a esta turma
    const { count: attendanceCount, error: attendanceError } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("class_id", id)

    if (attendanceError) throw attendanceError

    if (attendanceCount && attendanceCount > 0) {
      throw new Error(
        `Não é possível excluir esta turma pois existem ${attendanceCount} registros de presença associados a ela.`,
      )
    }

    // Se não houver dependências, excluir a turma
    const { error } = await supabase.from("classes").delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error(`Erro ao excluir turma ${id}:`, error)
    throw error
  }
}

// Modificar a função countAlunosTurma para verificar na tabela de matrículas
export async function countAlunosTurma(turmaId: string) {
  const supabase = getSupabaseClient()

  try {
    const { count, error } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("class_id", turmaId)

    if (error) throw error

    return count || 0
  } catch (error) {
    console.error(`Erro ao contar alunos da turma ${turmaId}:`, error)
    throw error
  }
}

// Função para obter anos letivos disponíveis
export function getAnosLetivos() {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
}

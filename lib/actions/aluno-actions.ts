"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"
import { generateStudentCode } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

// Função para criar cliente Supabase com cookies
function getSupabaseServer() {
  const cookieStore = cookies()

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Listar todos os alunos de uma escola
export async function listAlunos(schoolId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        profile:profiles!students_id_fkey (*)
      `)
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao listar alunos:", error)
      throw new Error(`Erro ao listar alunos: ${error.message}`)
    }

    return data || []
  } catch (error: any) {
    console.error("Erro na server action listAlunos:", error)
    throw new Error(error.message || "Erro ao listar alunos")
  }
}

// Obter um aluno específico
export async function getAluno(id: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        profile:profiles!students_id_fkey (*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao obter aluno:", error)
      throw new Error(`Erro ao obter aluno: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error("Erro na server action getAluno:", error)
    throw new Error(error.message || "Erro ao obter aluno")
  }
}

// Verificar se aluno está matriculado em alguma turma
export async function isAlunoMatriculado(alunoId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase.from("enrollments").select("id").eq("student_id", alunoId).limit(1)

    if (error) {
      console.error("Erro ao verificar matrícula:", error)
      throw new Error(`Erro ao verificar matrícula: ${error.message}`)
    }

    return data && data.length > 0
  } catch (error: any) {
    console.error("Erro na server action isAlunoMatriculado:", error)
    throw new Error(error.message || "Erro ao verificar matrícula")
  }
}

// Criar um novo aluno
export async function createAluno(data: {
  schoolId: string
  fullName: string
  birthDate: string
  email?: string
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  guardianPassword: string
}) {
  try {
    const supabase = getSupabaseServer()

    // 1. Gerar código único para o aluno
    const studentCode = generateStudentCode()
    const studentEmail = data.email || `aluno_${studentCode}@escola.com`
    const studentPassword = `Aluno${studentCode}` // Generate a default password for the student

    // 2. Criar conta do responsável
    const { data: guardianAuthData, error: guardianAuthError } = await supabase.auth.admin.createUser({
      email: data.guardianEmail,
      password: data.guardianPassword,
      email_confirm: true,
    })

    if (guardianAuthError || !guardianAuthData.user) {
      throw new Error(`Erro ao criar conta do responsável: ${guardianAuthError?.message || "Usuário não criado"}`)
    }

    const guardianId = guardianAuthData.user.id

    // 3. Criar perfil do responsável
    const { error: guardianProfileError } = await supabase.from("profiles").insert({
      id: guardianId,
      email: data.guardianEmail,
      full_name: data.guardianName,
      user_type: "responsavel",
    })

    if (guardianProfileError) {
      throw new Error(`Erro ao criar perfil do responsável: ${guardianProfileError.message}`)
    }

    // 4. Criar registro do responsável
    const { error: guardianError } = await supabase.from("guardians").insert({
      id: guardianId,
      phone: data.guardianPhone,
    })

    if (guardianError) {
      throw new Error(`Erro ao criar registro do responsável: ${guardianError.message}`)
    }

    // 5. Criar conta do aluno
    const { data: studentAuthData, error: studentAuthError } = await supabase.auth.admin.createUser({
      email: studentEmail,
      password: studentPassword,
      email_confirm: true,
    })

    if (studentAuthError || !studentAuthData.user) {
      throw new Error(`Erro ao criar conta do aluno: ${studentAuthError?.message || "Usuário não criado"}`)
    }

    const studentId = studentAuthData.user.id

    // 6. Criar perfil do aluno
    const { error: studentProfileError } = await supabase.from("profiles").insert({
      id: studentId,
      email: studentEmail,
      full_name: data.fullName,
      user_type: "aluno",
    })

    if (studentProfileError) {
      throw new Error(`Erro ao criar perfil do aluno: ${studentProfileError.message}`)
    }

    // 7. Criar registro do aluno
    const { error: studentError } = await supabase.from("students").insert({
      id: studentId,
      school_id: data.schoolId,
      birth_date: data.birthDate,
      code: studentCode,
      registration_number: `A${studentCode}`,
      grade: "A definir", // Valor padrão para grade
      class: "A definir", // Valor padrão para class
    })

    if (studentError) {
      throw new Error(`Erro ao criar registro do aluno: ${studentError.message}`)
    }

    // 8. Associar aluno ao responsável
    const { error: relationError } = await supabase.from("student_guardian").insert({
      student_id: studentId,
      guardian_id: guardianId,
      relationship: "Responsável legal", // Valor padrão para o relacionamento
    })

    if (relationError) {
      throw new Error(`Erro ao associar aluno ao responsável: ${relationError.message}`)
    }

    return {
      studentId,
      guardianId,
      studentCode,
      studentEmail,
      studentPassword,
    }
  } catch (error: any) {
    console.error("Erro ao criar aluno:", error)
    throw new Error(`Erro ao criar aluno: ${error.message}`)
  }
}

// Atualizar um aluno existente
export async function updateAluno(
  id: string,
  data: {
    fullName: string
    birthDate: string
    email?: string
  },
) {
  try {
    const supabase = getSupabaseServer()

    // Atualizar perfil do aluno
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        email: data.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (profileError) {
      console.error("Erro ao atualizar perfil do aluno:", profileError)
      throw new Error(`Erro ao atualizar perfil do aluno: ${profileError.message}`)
    }

    // Atualizar registro do aluno
    const { error: studentError } = await supabase
      .from("students")
      .update({
        birth_date: data.birthDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (studentError) {
      console.error("Erro ao atualizar registro do aluno:", studentError)
      throw new Error(`Erro ao atualizar registro do aluno: ${studentError.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Erro na server action updateAluno:", error)
    throw new Error(error.message || "Erro ao atualizar aluno")
  }
}

// Excluir um aluno
export async function deleteAluno(id: string) {
  try {
    const supabase = getSupabaseServer()

    // Excluir o aluno (as relações serão excluídas em cascata)
    const { error } = await supabase.from("profiles").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir aluno:", error)
      throw new Error(`Erro ao excluir aluno: ${error.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Erro na server action deleteAluno:", error)
    throw new Error(error.message || "Erro ao excluir aluno")
  }
}

// Matricular aluno em uma turma
export async function matricularAluno(data: {
  studentId: string
  classId: string
  enrollmentDate?: string
}) {
  try {
    const supabase = getSupabaseServer()
    const enrollmentDate = data.enrollmentDate || new Date().toISOString().split("T")[0]

    // Verificar se o aluno já está matriculado nesta turma
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", data.studentId)
      .eq("class_id", data.classId)
      .limit(1)

    if (checkError) {
      console.error("Erro ao verificar matrícula existente:", checkError)
      throw new Error(`Erro ao verificar matrícula existente: ${checkError.message}`)
    }

    if (existingEnrollment && existingEnrollment.length > 0) {
      throw new Error("O aluno já está matriculado nesta turma")
    }

    // Gerar um UUID para o ID da matrícula
    const enrollmentId = uuidv4()

    // Criar nova matrícula
    const { error } = await supabase.from("enrollments").insert({
      id: enrollmentId,
      student_id: data.studentId,
      class_id: data.classId,
      enrollment_date: enrollmentDate,
    })

    if (error) {
      console.error("Erro ao matricular aluno:", error)
      throw new Error(`Erro ao matricular aluno: ${error.message}`)
    }

    revalidatePath(`/escola/turmas/${data.classId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Erro na server action matricularAluno:", error)
    throw new Error(error.message || "Erro ao matricular aluno")
  }
}

// Exportar outras funções necessárias
export async function listTurmasAluno(alunoId: string) {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        enrollment_date,
        class:class_id (
          id,
          name,
          year,
          course:course_id (
            id,
            name
          )
        )
      `)
      .eq("student_id", alunoId)

    if (error) {
      console.error("Erro ao listar turmas do aluno:", error)
      throw new Error(`Erro ao listar turmas do aluno: ${error.message}`)
    }

    return data || []
  } catch (error: any) {
    console.error("Erro na server action listTurmasAluno:", error)
    throw new Error(error.message || "Erro ao listar turmas do aluno")
  }
}

export async function cancelarMatricula(enrollmentId: string) {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId)

    if (error) {
      console.error("Erro ao cancelar matrícula:", error)
      throw new Error(`Erro ao cancelar matrícula: ${error.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Erro na server action cancelarMatricula:", error)
    throw new Error(error.message || "Erro ao cancelar matrícula")
  }
}

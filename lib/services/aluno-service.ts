import { v4 as uuidv4 } from "uuid"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import { generateStudentCode } from "@/lib/utils"

// Listar todos os alunos de uma escola
export async function listAlunos(schoolId: string) {
  const supabase = getSupabaseServer()

  // Modificando a query para ser mais explícita sobre as relações
  const { data: students, error } = await supabase
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

  return students || []
}

// Obter um aluno específico
export async function getAluno(id: string) {
  const supabase = getSupabaseServer()

  const { data: student, error } = await supabase
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

  return student
}

// Verificar se aluno está matriculado em alguma turma
export async function isAlunoMatriculado(alunoId: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase.from("enrollments").select("id").eq("student_id", alunoId).limit(1)

  if (error) {
    console.error("Erro ao verificar matrícula:", error)
    throw new Error(`Erro ao verificar matrícula: ${error.message}`)
  }

  return data && data.length > 0
}

// Listar turmas em que o aluno está matriculado
export async function listTurmasAluno(alunoId: string) {
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
}

// Listar responsáveis de um aluno
export async function listResponsaveisAluno(alunoId: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("student_guardian")
    .select(`
      relationship,
      guardian:guardian_id (
        id,
        phone,
        address,
        profile:profiles (
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq("student_id", alunoId)

  if (error) {
    console.error("Erro ao listar responsáveis do aluno:", error)
    throw new Error(`Erro ao listar responsáveis do aluno: ${error.message}`)
  }

  return data || []
}

// Verificar se já existe um responsável com o email fornecido
async function checkExistingGuardian(email: string) {
  const supabase = getSupabaseServer()

  // Verificar se já existe um perfil com este email
  const { data, error } = await supabase.from("profiles").select("id, user_type").eq("email", email).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 é o código para "não encontrado"
    console.error("Erro ao verificar perfil existente:", error)
    throw new Error(`Erro ao verificar perfil existente: ${error.message}`)
  }

  // Se encontrou um perfil e não é do tipo "responsavel", lançar erro
  if (data && data.user_type !== "responsavel") {
    throw new Error(`O email ${email} já está em uso por outro tipo de usuário`)
  }

  return data
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
  const supabase = getSupabaseServer()
  const client = getSupabaseClient()
  const adminClient = getSupabaseServer() // Using service role for admin operations

  // Iniciar transação
  try {
    // 1. Gerar código único para o aluno
    const studentCode = generateStudentCode()
    const studentEmail = data.email || `aluno_${studentCode}@escola.com`
    const studentPassword = `Aluno${studentCode}` // Generate a default password for the student

    // 2. Verificar se já existe um responsável com este email
    const existingGuardian = await checkExistingGuardian(data.guardianEmail)

    let guardianId: string

    if (existingGuardian) {
      // Usar o responsável existente
      guardianId = existingGuardian.id
      console.log(`Usando responsável existente com ID: ${guardianId}`)
    } else {
      // Criar novo responsável
      // 2.1 Criar conta do responsável
      const { data: authData, error: authError } = await client.auth.signUp({
        email: data.guardianEmail,
        password: data.guardianPassword,
        options: {
          data: {
            full_name: data.guardianName,
            user_type: "responsavel",
          },
        },
      })

      if (authError || !authData.user) {
        throw new Error(`Erro ao criar conta do responsável: ${authError?.message || "Usuário não criado"}`)
      }

      guardianId = authData.user.id

      // 2.2 Criar perfil do responsável
      const { error: profileError } = await supabase.from("profiles").insert({
        id: guardianId,
        email: data.guardianEmail,
        full_name: data.guardianName,
        user_type: "responsavel",
      })

      if (profileError) {
        throw new Error(`Erro ao criar perfil do responsável: ${profileError.message}`)
      }

      // 2.3 Criar registro do responsável
      const { error: guardianError } = await supabase.from("guardians").insert({
        id: guardianId,
        phone: data.guardianPhone,
      })

      if (guardianError) {
        throw new Error(`Erro ao criar registro do responsável: ${guardianError.message}`)
      }
    }

    // 3. Criar conta do aluno usando o admin client
    const { data: studentAuthData, error: studentAuthError } = await adminClient.auth.admin.createUser({
      email: studentEmail,
      password: studentPassword,
      user_metadata: {
        full_name: data.fullName,
        user_type: "aluno",
      },
      email_confirm: true, // Auto-confirm the email
    })

    if (studentAuthError || !studentAuthData.user) {
      throw new Error(`Erro ao criar conta do aluno: ${studentAuthError?.message || "Usuário não criado"}`)
    }

    const studentId = studentAuthData.user.id

    // 4. Criar perfil do aluno
    const { error: studentProfileError } = await supabase.from("profiles").insert({
      id: studentId,
      email: studentEmail,
      full_name: data.fullName,
      user_type: "aluno",
    })

    if (studentProfileError) {
      throw new Error(`Erro ao criar perfil do aluno: ${studentProfileError.message}`)
    }

    // 5. Criar registro do aluno
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

    // 6. Associar aluno ao responsável
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
}

// Excluir um aluno
export async function deleteAluno(id: string) {
  const supabase = getSupabaseServer()

  // Excluir o aluno (as relações serão excluídas em cascata)
  const { error } = await supabase.from("profiles").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir aluno:", error)
    throw new Error(`Erro ao excluir aluno: ${error.message}`)
  }

  return { success: true }
}

// Matricular aluno em uma turma
export async function matricularAluno(data: {
  studentId: string
  classId: string
  enrollmentDate?: string
}) {
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

  // Criar nova matrícula
  const { error } = await supabase.from("enrollments").insert({
    id: uuidv4(),
    student_id: data.studentId,
    class_id: data.classId,
    enrollment_date: enrollmentDate,
  })

  if (error) {
    console.error("Erro ao matricular aluno:", error)
    throw new Error(`Erro ao matricular aluno: ${error.message}`)
  }

  return { success: true }
}

// Cancelar matrícula de um aluno
export async function cancelarMatricula(enrollmentId: string) {
  const supabase = getSupabaseServer()

  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId)

  if (error) {
    console.error("Erro ao cancelar matrícula:", error)
    throw new Error(`Erro ao cancelar matrícula: ${error.message}`)
  }

  return { success: true }
}

// Listar alunos de uma turma
export async function listAlunosTurma(classId: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      enrollment_date,
      student:student_id (
        id,
        code,
        birth_date,
        registration_number,
        profile:profiles!students_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq("class_id", classId)
    .order("enrollment_date", { ascending: false })

  if (error) {
    console.error("Erro ao listar alunos da turma:", error)
    throw new Error(`Erro ao listar alunos da turma: ${error.message}`)
  }

  return data || []
}

// Listar alunos não matriculados em uma turma específica
export async function listAlunosNaoMatriculadosTurma(schoolId: string, classId: string) {
  const supabase = getSupabaseServer()

  // Primeiro, obter todos os alunos da escola
  const { data: allStudents, error: studentsError } = await supabase
    .from("students")
    .select(`
      id,
      code,
      birth_date,
      registration_number,
      profile:profiles!students_id_fkey (
        full_name,
        email
      )
    `)
    .eq("school_id", schoolId)

  if (studentsError) {
    console.error("Erro ao listar alunos:", studentsError)
    throw new Error(`Erro ao listar alunos: ${studentsError.message}`)
  }

  // Depois, obter os IDs dos alunos já matriculados na turma
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("class_id", classId)

  if (enrollmentsError) {
    console.error("Erro ao listar matrículas:", enrollmentsError)
    throw new Error(`Erro ao listar matrículas: ${enrollmentsError.message}`)
  }

  // Criar um conjunto de IDs de alunos matriculados
  const enrolledStudentIds = new Set(enrollments?.map((e) => e.student_id) || [])

  // Filtrar alunos que não estão matriculados
  const notEnrolledStudents = allStudents?.filter((student) => !enrolledStudentIds.has(student.id)) || []

  return notEnrolledStudents
}

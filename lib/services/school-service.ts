import { getSupabaseClient } from "@/lib/supabase/client"
import type { School, SchoolStore } from "@/lib/types"
import { getSupabaseServer } from "@/lib/supabase/server"

// Função para gerar uma senha aleatória segura
export function generateSecurePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

// Função para criar uma escola com sua loja e credenciais
export async function createSchoolWithStore(schoolData: {
  name: string
  address: string
  phone?: string
  email: string
  password?: string
}) {
  const supabase = getSupabaseClient()

  try {
    // Usar a senha fornecida ou gerar uma senha segura
    const password = schoolData.password || generateSecurePassword()

    // 1. Criar o usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: schoolData.email,
      password: password,
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error("Falha ao criar usuário para a escola")
    }

    // 2. Criar o perfil da escola
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: schoolData.email,
        full_name: schoolData.name,
        user_type: "escola",
      })
      .select()
      .single()

    if (profileError) {
      // Rollback: deletar o usuário criado
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // 3. Criar a escola
    const { data: schoolRecord, error: schoolError } = await supabase
      .from("schools")
      .insert({
        id: authData.user.id, // Usar o mesmo ID do usuário/perfil
        name: schoolData.name,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        director_id: authData.user.id, // A escola é seu próprio diretor inicialmente
      })
      .select()
      .single()

    if (schoolError) {
      // Rollback: deletar o usuário e perfil criados
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw schoolError
    }

    // 4. Criar a loja da escola
    const { data: storeData, error: storeError } = await supabase
      .from("school_stores")
      .insert({
        school_id: authData.user.id,
        name: `Loja ${schoolData.name}`,
        description: `Loja oficial da escola ${schoolData.name}`,
        atoms_balance: 0,
        real_balance: 0,
        is_active: true,
      })
      .select()
      .single()

    if (storeError) {
      // Rollback: deletar o usuário, perfil e escola criados
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw storeError
    }

    return {
      school: schoolRecord,
      store: storeData,
      credentials: {
        email: schoolData.email,
        password: password,
      },
    }
  } catch (error) {
    console.error("Erro ao criar escola:", error)
    throw error
  }
}

// Função para listar todas as escolas com suas lojas
export async function listSchoolsWithStores() {
  const supabase = getSupabaseClient()

  try {
    // Primeiro, buscar todas as escolas
    const { data: schools, error: schoolsError } = await supabase.from("schools").select("*").order("name")

    if (schoolsError) throw schoolsError

    // Depois, buscar as lojas para cada escola
    const schoolsWithStores = await Promise.all(
      schools.map(async (school) => {
        const { data: storeData, error: storeError } = await supabase
          .from("school_stores")
          .select("*")
          .eq("school_id", school.id)
          .single()

        if (storeError && storeError.code !== "PGRST116") {
          // PGRST116 é o código para "nenhum resultado encontrado"
          console.warn(`Erro ao buscar loja para escola ${school.id}:`, storeError)
        }

        return {
          ...school,
          store: storeData || null,
        }
      }),
    )

    return schoolsWithStores as (School & { store: SchoolStore | null })[]
  } catch (error) {
    console.error("Erro ao listar escolas:", error)
    throw error
  }
}

// Função para obter uma escola específica com sua loja
export async function getSchoolWithStore(id: string) {
  const supabase = getSupabaseClient()

  try {
    // Buscar a escola
    const { data: school, error: schoolError } = await supabase.from("schools").select("*").eq("id", id).single()

    if (schoolError) throw schoolError

    // Buscar a loja da escola
    const { data: storeData, error: storeError } = await supabase
      .from("school_stores")
      .select("*")
      .eq("school_id", id)
      .single()

    if (storeError && storeError.code !== "PGRST116") {
      // PGRST116 é o código para "nenhum resultado encontrado"
      console.warn(`Erro ao buscar loja para escola ${id}:`, storeError)
    }

    return {
      ...school,
      store: storeData || null,
    } as School & { store: SchoolStore | null }
  } catch (error) {
    console.error(`Erro ao obter escola ${id}:`, error)
    throw error
  }
}

// Função para atualizar uma escola
export async function updateSchool(
  id: string,
  schoolData: {
    name?: string
    address?: string
    phone?: string
    email?: string
  },
) {
  const supabase = getSupabaseClient()

  try {
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .update(schoolData)
      .eq("id", id)
      .select()
      .single()

    if (schoolError) throw schoolError

    // Se o email foi atualizado, também atualizar no perfil
    if (schoolData.email) {
      const { error: profileError } = await supabase.from("profiles").update({ email: schoolData.email }).eq("id", id)

      if (profileError) throw profileError
    }

    // Se o nome foi atualizado, também atualizar no perfil
    if (schoolData.name) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: schoolData.name })
        .eq("id", id)

      if (profileError) throw profileError
    }

    return school
  } catch (error) {
    console.error(`Erro ao atualizar escola ${id}:`, error)
    throw error
  }
}

// Função para excluir uma escola
export async function deleteSchool(id: string) {
  const supabase = getSupabaseClient()

  try {
    // Excluir o usuário no Auth (isso vai cascatear para excluir o perfil, escola e loja)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) throw authError

    return true
  } catch (error) {
    console.error(`Erro ao excluir escola ${id}:`, error)
    throw error
  }
}

// Função para redefinir a senha de uma escola
export async function resetSchoolPassword(id: string) {
  const supabase = getSupabaseClient()

  try {
    // Obter o email da escola
    const { data: school, error: schoolError } = await supabase.from("schools").select("email").eq("id", id).single()

    if (schoolError) throw schoolError

    if (!school.email) {
      throw new Error("Email da escola não encontrado")
    }

    // Enviar email de redefinição de senha
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(school.email, {
      redirectTo: `${window.location.origin}/escola/redefinir-senha`,
    })

    if (resetError) throw resetError

    return true
  } catch (error) {
    console.error(`Erro ao redefinir senha da escola ${id}:`, error)
    throw error
  }
}

export async function getEscolaIdFromUser() {
  const supabase = getSupabaseServer()

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      throw new Error("Usuário não autenticado")
    }

    // Verificar se o usuário é uma escola
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error getting user profile:", profileError)
      throw new Error("Erro ao buscar perfil do usuário")
    }

    // Se o usuário for do tipo "escola", o ID do usuário é o ID da escola
    if (profile.user_type === "escola") {
      // Verificar se existe um registro na tabela schools
      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .select("id")
        .eq("id", user.id)
        .single()

      if (schoolError) {
        console.error("Error getting school:", schoolError)
        throw new Error("Escola não encontrada")
      }

      return school.id
    }

    // Se o usuário for um professor, verificar se ele está associado a uma escola
    if (profile.user_type === "professor") {
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", user.id)
        .single()

      if (teacherError) {
        console.error("Error getting teacher:", teacherError)
        throw new Error("Professor não encontrado ou não associado a uma escola")
      }

      return teacher.school_id
    }

    // Se chegou aqui, o usuário não tem permissão para acessar recursos da escola
    throw new Error("Usuário não tem permissão para acessar esta escola")
  } catch (error) {
    console.error("Error in getEscolaIdFromUser:", error)
    throw error
  }
}

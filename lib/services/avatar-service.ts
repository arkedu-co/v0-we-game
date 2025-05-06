import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Avatar } from "@/lib/types"

// Obter todos os avatares de uma escola
export async function getAvatares(schoolId: string): Promise<Avatar[]> {
  try {
    console.log("Iniciando busca de avatares para escola:", schoolId)
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("avatars").select("*").eq("school_id", schoolId).order("name")

    if (error) {
      console.error("Erro na consulta Supabase:", error)
      throw error
    }

    console.log(`Avatares encontrados: ${data?.length || 0}`, data)
    return data || []
  } catch (error) {
    console.error("Erro ao buscar avatares:", error)
    throw new Error("Não foi possível carregar os avatares.")
  }
}

// Obter um avatar específico
export async function getAvatar(id: number): Promise<Avatar> {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("avatars").select("*").eq("id", id).single()

    if (error) throw error
    if (!data) throw new Error("Avatar não encontrado")

    return data
  } catch (error) {
    console.error(`Erro ao buscar avatar ${id}:`, error)
    throw new Error("Não foi possível carregar os dados do avatar.")
  }
}

// Criar um novo avatar
export async function createAvatar(avatarData: Partial<Avatar>): Promise<Avatar> {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("avatars").insert([avatarData]).select().single()

    if (error) throw error
    if (!data) throw new Error("Erro ao criar avatar")

    return data
  } catch (error) {
    console.error("Erro ao criar avatar:", error)
    throw new Error("Não foi possível criar o avatar. Verifique os dados e tente novamente.")
  }
}

// Atualizar um avatar existente
export async function updateAvatar(id: number, avatarData: Partial<Avatar>): Promise<Avatar> {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("avatars").update(avatarData).eq("id", id).select().single()

    if (error) throw error
    if (!data) throw new Error("Avatar não encontrado")

    return data
  } catch (error) {
    console.error(`Erro ao atualizar avatar ${id}:`, error)
    throw new Error("Não foi possível atualizar o avatar.")
  }
}

// Excluir um avatar
export async function deleteAvatar(id: number): Promise<void> {
  try {
    const supabase = createClientComponentClient()

    const { error } = await supabase.from("avatars").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error(`Erro ao excluir avatar ${id}:`, error)
    throw new Error("Não foi possível excluir o avatar.")
  }
}

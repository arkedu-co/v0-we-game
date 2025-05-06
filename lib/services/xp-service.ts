import { getSupabaseClient } from "@/lib/supabase/client"
import type { NivelXP, RegraXP } from "@/lib/types"

// Funções para Regras de XP
export async function listRegrasXP(schoolId: string): Promise<RegraXP[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_rules").select("*").eq("school_id", schoolId).order("name")

    if (error) {
      console.error("Erro ao listar regras de XP:", error)
      throw new Error("Não foi possível carregar as regras de XP")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao listar regras de XP:", error)
    throw new Error("Não foi possível carregar as regras de XP")
  }
}

export async function getRegraXP(id: string): Promise<RegraXP> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_rules").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar regra de XP:", error)
      throw new Error("Não foi possível carregar a regra de XP")
    }

    if (!data) {
      throw new Error("Regra de XP não encontrada")
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar regra de XP:", error)
    throw new Error("Não foi possível carregar a regra de XP")
  }
}

export async function createRegraXP(regra: Partial<RegraXP>): Promise<RegraXP> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_rules").insert(regra).select().single()

    if (error) {
      console.error("Erro ao criar regra de XP:", error)
      throw new Error("Não foi possível criar a regra de XP")
    }

    if (!data) {
      throw new Error("Erro ao criar regra de XP")
    }

    return data
  } catch (error) {
    console.error("Erro ao criar regra de XP:", error)
    throw new Error("Não foi possível criar a regra de XP")
  }
}

export async function updateRegraXP(id: string, regra: Partial<RegraXP>): Promise<RegraXP> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_rules").update(regra).eq("id", id).select().single()

    if (error) {
      console.error("Erro ao atualizar regra de XP:", error)
      throw new Error("Não foi possível atualizar a regra de XP")
    }

    if (!data) {
      throw new Error("Regra de XP não encontrada")
    }

    return data
  } catch (error) {
    console.error("Erro ao atualizar regra de XP:", error)
    throw new Error("Não foi possível atualizar a regra de XP")
  }
}

export async function deleteRegraXP(id: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("xp_rules").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir regra de XP:", error)
      throw new Error("Não foi possível excluir a regra de XP")
    }
  } catch (error) {
    console.error("Erro ao excluir regra de XP:", error)
    throw new Error("Não foi possível excluir a regra de XP")
  }
}

// Funções para Níveis de XP
export async function listNiveisXP(schoolId: string): Promise<NivelXP[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_levels").select("*").eq("school_id", schoolId).order("min_xp")

    if (error) {
      console.error("Erro ao listar níveis de XP:", error)
      throw new Error("Não foi possível carregar os níveis de XP")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao listar níveis de XP:", error)
    throw new Error("Não foi possível carregar os níveis de XP")
  }
}

export async function getNivelXP(id: string): Promise<NivelXP> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_levels").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao buscar nível de XP:", error)
      throw new Error("Não foi possível carregar o nível de XP")
    }

    if (!data) {
      throw new Error("Nível de XP não encontrado")
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar nível de XP:", error)
    throw new Error("Não foi possível carregar o nível de XP")
  }
}

export async function createNivelXP(nivel: Partial<NivelXP>): Promise<NivelXP> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_levels").insert(nivel).select().single()

    if (error) {
      console.error("Erro ao criar nível de XP:", error)
      throw new Error("Não foi possível criar o nível de XP")
    }

    if (!data) {
      throw new Error("Erro ao criar nível de XP")
    }

    return data
  } catch (error) {
    console.error("Erro ao criar nível de XP:", error)
    throw new Error("Não foi possível criar o nível de XP")
  }
}

export async function updateNivelXP(id: string, nivel: Partial<NivelXP>): Promise<NivelXP> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("xp_levels").update(nivel).eq("id", id).select().single()

    if (error) {
      console.error("Erro ao atualizar nível de XP:", error)
      throw new Error("Não foi possível atualizar o nível de XP")
    }

    if (!data) {
      throw new Error("Nível de XP não encontrado")
    }

    return data
  } catch (error) {
    console.error("Erro ao atualizar nível de XP:", error)
    throw new Error("Não foi possível atualizar o nível de XP")
  }
}

export async function deleteNivelXP(id: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("xp_levels").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir nível de XP:", error)
      throw new Error("Não foi possível excluir o nível de XP")
    }
  } catch (error) {
    console.error("Erro ao excluir nível de XP:", error)
    throw new Error("Não foi possível excluir o nível de XP")
  }
}

// Aliases para compatibilidade com código existente
export const excluirRegraXP = deleteRegraXP
export const obterRegrasXP = listRegrasXP
export const obterRegraXP = getRegraXP
export const criarRegraXP = createRegraXP
export const atualizarRegraXP = updateRegraXP
export const obterNiveisXP = listNiveisXP
export const obterNivelXP = getNivelXP
export const criarNivelXP = createNivelXP
export const atualizarNivelXP = updateNivelXP
export const excluirNivelXP = deleteNivelXP
export const listarRegrasXP = listRegrasXP

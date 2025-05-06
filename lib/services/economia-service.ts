import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getSchoolIdForCurrentUser } from "../actions/school-actions"

export interface EconomiaConfig {
  id: string
  school_id: string
  salario_diario_atomos: number
  created_at?: string
  updated_at?: string
}

export async function getEconomiaConfig(): Promise<EconomiaConfig | null> {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)
    const schoolId = await getSchoolIdForCurrentUser()

    const { data, error } = await supabase.from("economia_config").select("*").eq("school_id", schoolId).single()

    if (error) {
      console.error("Erro ao buscar configuração de economia:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar configuração de economia:", error)
    return null
  }
}

export async function createEconomiaConfig(config: Partial<EconomiaConfig>): Promise<EconomiaConfig | null> {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)
    const schoolId = await getSchoolIdForCurrentUser()

    const { data, error } = await supabase
      .from("economia_config")
      .insert({
        school_id: schoolId,
        salario_diario_atomos: config.salario_diario_atomos || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar configuração de economia:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao criar configuração de economia:", error)
    return null
  }
}

export async function updateEconomiaConfig(config: Partial<EconomiaConfig>): Promise<EconomiaConfig | null> {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)
    const schoolId = await getSchoolIdForCurrentUser()

    // Verificar se já existe uma configuração
    const { data: existingConfig } = await supabase
      .from("economia_config")
      .select("id")
      .eq("school_id", schoolId)
      .single()

    if (!existingConfig) {
      // Se não existir, criar uma nova
      return createEconomiaConfig(config)
    }

    // Se existir, atualizar
    const { data, error } = await supabase
      .from("economia_config")
      .update({
        salario_diario_atomos: config.salario_diario_atomos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingConfig.id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar configuração de economia:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao atualizar configuração de economia:", error)
    return null
  }
}

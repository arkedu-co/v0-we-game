import { getSupabaseServer } from "@/lib/supabase/server"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Attitude } from "@/lib/types"

// Funções do lado do servidor
export async function listarAtitudesServer(): Promise<Attitude[]> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase.from("attitudes").select("*").order("name")

  if (error) {
    console.error("Erro ao buscar atitudes:", error)
    throw new Error("Não foi possível carregar as atitudes")
  }

  return data || []
}

export async function obterAtitudeServer(id: string): Promise<Attitude> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase.from("attitudes").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar atitude:", error)
    throw new Error("Não foi possível carregar a atitude")
  }

  return data
}

// Funções do lado do cliente
export async function listarAtitudes(): Promise<Attitude[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("attitudes").select("*").order("name")

  if (error) {
    console.error("Erro ao buscar atitudes:", error)
    throw new Error("Não foi possível carregar as atitudes")
  }

  return data || []
}

export async function obterAtitude(id: string): Promise<Attitude> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("attitudes").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar atitude:", error)
    throw new Error("Não foi possível carregar a atitude")
  }

  return data
}

export async function criarAtitude(atitude: Partial<Attitude>): Promise<Attitude> {
  const supabase = getSupabaseClient()

  // Validar se o school_id está presente
  if (!atitude.school_id) {
    console.error("School ID is missing")
    throw new Error("ID da escola não encontrado")
  }

  // Calcular o valor da recompensa com base no tipo
  let reward_value = 0
  if (atitude.recompensa_tipo === "xp" || atitude.recompensa_tipo === "both") {
    reward_value = atitude.valor_xp || 0
  } else if (atitude.recompensa_tipo === "atoms" || atitude.recompensa_tipo === "both") {
    reward_value = atitude.valor_atoms || 0
  }

  // Ajustando os nomes dos campos para corresponder ao banco de dados
  const atitudeData = {
    name: atitude.nome,
    description: atitude.descricao,
    type: atitude.tipo,
    reward_type: atitude.recompensa_tipo,
    reward_value: reward_value, // Adicionando o campo reward_value
    reward_value_xp: atitude.valor_xp || 0,
    reward_value_atoms: atitude.valor_atoms || 0,
    school_id: atitude.school_id,
  }

  console.log("Creating attitude with data:", atitudeData)

  const { data, error } = await supabase.from("attitudes").insert([atitudeData]).select().single()

  if (error) {
    console.error("Erro ao criar atitude:", error)
    throw new Error("Não foi possível criar a atitude")
  }

  return data
}

export async function atualizarAtitude(id: string, atitude: Partial<Attitude>): Promise<Attitude> {
  const supabase = getSupabaseClient()

  // Calcular o valor da recompensa com base no tipo
  let reward_value = 0
  if (atitude.recompensa_tipo === "xp" || atitude.recompensa_tipo === "both") {
    reward_value = atitude.valor_xp || 0
  } else if (atitude.recompensa_tipo === "atoms" || atitude.recompensa_tipo === "both") {
    reward_value = atitude.valor_atoms || 0
  }

  // Ajustando os nomes dos campos para corresponder ao banco de dados
  const atitudeData = {
    name: atitude.nome,
    description: atitude.descricao,
    type: atitude.tipo,
    reward_type: atitude.recompensa_tipo,
    reward_value: reward_value, // Adicionando o campo reward_value
    reward_value_xp: atitude.valor_xp || 0,
    reward_value_atoms: atitude.valor_atoms || 0,
  }

  const { data, error } = await supabase.from("attitudes").update(atitudeData).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar atitude:", error)
    throw new Error("Não foi possível atualizar a atitude")
  }

  return data
}

export async function excluirAtitude(id: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("attitudes").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir atitude:", error)
    throw new Error("Não foi possível excluir a atitude")
  }
}

export async function aplicarAtitude(
  studentId: string,
  attitudeId: string,
  appliedBy: string,
  notes?: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  // Primeiro, buscar a atitude para saber o tipo e valor
  const { data: atitude, error: atitudeError } = await supabase
    .from("attitudes")
    .select("*")
    .eq("id", attitudeId)
    .single()

  if (atitudeError) {
    console.error("Erro ao buscar atitude:", atitudeError)
    throw new Error("Não foi possível aplicar a atitude")
  }

  // Obter o school_id da atitude
  const schoolId = atitude.school_id

  // Registrar a aplicação da atitude
  const { error: applyError } = await supabase.from("applied_attitudes").insert([
    {
      student_id: studentId,
      attitude_id: attitudeId,
      applied_by: appliedBy,
      notes: notes || null,
      school_id: schoolId,
      created_at: new Date().toISOString(),
    },
  ])

  if (applyError) {
    console.error("Erro ao registrar aplicação da atitude:", applyError)
    throw new Error("Não foi possível aplicar a atitude")
  }

  // Se a atitude concede XP, atualizar o XP do aluno
  if ((atitude.reward_type === "xp" || atitude.reward_type === "both") && atitude.reward_value_xp > 0) {
    // Verificar se o aluno já tem um registro de XP
    const { data: studentXP, error: xpError } = await supabase
      .from("student_xp")
      .select("*")
      .eq("student_id", studentId)
      .single()

    if (xpError && xpError.code !== "PGRST116") {
      // PGRST116 = registro não encontrado
      console.error("Erro ao verificar XP do aluno:", xpError)
      throw new Error("Não foi possível atualizar o XP do aluno")
    }

    if (studentXP) {
      // Atualizar o XP existente
      const newXP = studentXP.xp_amount + atitude.reward_value_xp

      // Buscar o nível correspondente ao novo XP
      const { data: levels, error: levelError } = await supabase
        .from("xp_levels")
        .select("*")
        .lte("min_xp", newXP)
        .gte("max_xp", newXP)
        .eq("school_id", schoolId)

      if (levelError) {
        console.error("Erro ao buscar nível de XP:", levelError)
      }

      const levelId = levels && levels.length > 0 ? levels[0].id : null

      const { error: updateError } = await supabase
        .from("student_xp")
        .update({
          xp_amount: newXP,
          level_id: levelId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", studentXP.id)

      if (updateError) {
        console.error("Erro ao atualizar XP do aluno:", updateError)
        throw new Error("Não foi possível atualizar o XP do aluno")
      }
    } else {
      // Criar um novo registro de XP
      const { error: createError } = await supabase.from("student_xp").insert([
        {
          student_id: studentId,
          xp_amount: atitude.reward_value_xp,
          school_id: schoolId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (createError) {
        console.error("Erro ao criar registro de XP do aluno:", createError)
        throw new Error("Não foi possível criar o registro de XP do aluno")
      }
    }
  }

  // Se a atitude concede átomos, atualizar os átomos do aluno
  if ((atitude.reward_type === "atoms" || atitude.reward_type === "both") && atitude.reward_value_atoms > 0) {
    const { error: atomError } = await supabase.from("atom_transactions").insert([
      {
        student_id: studentId,
        amount: atitude.reward_value_atoms,
        transaction_type: atitude.type === "positive" ? "credit" : "debit",
        reference_type: "attitude",
        reference_id: attitudeId,
        description: `${atitude.type === "positive" ? "Ganhou" : "Perdeu"} ${atitude.reward_value_atoms} átomos pela atitude: ${atitude.name}`,
        created_at: new Date().toISOString(),
      },
    ])

    if (atomError) {
      console.error("Erro ao atualizar átomos do aluno:", atomError)
      throw new Error("Não foi possível atualizar os átomos do aluno")
    }
  }
}

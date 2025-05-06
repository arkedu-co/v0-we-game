import { getSupabaseClient } from "@/lib/supabase/client"
import type {
  StoreProduct,
  StoreOrder,
  StoreOrderItem,
  StoreInventoryMovement,
  StoreDelivery,
  StudentAtomBalance,
  AtomTransaction,
} from "@/lib/types"

// Serviços para produtos
export async function getProdutos(escolaId: string) {
  const supabase = getSupabaseClient()

  // Validação do escolaId
  if (!escolaId) {
    console.error("Erro ao buscar produtos: escolaId is undefined or null")
    return []
  }

  const { data, error } = await supabase.from("store_products").select("*").eq("school_id", escolaId).order("name")

  if (error) {
    console.error("Erro ao buscar produtos:", error)
    throw new Error("Não foi possível carregar os produtos")
  }

  return data as StoreProduct[]
}

export async function getProduto(id: string) {
  const supabase = getSupabaseClient()

  // Validação do id
  if (!id) {
    console.error("Erro ao buscar produto: id is undefined or null")
    throw new Error("ID do produto não fornecido")
  }

  const { data, error } = await supabase.from("store_products").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar produto:", error)
    throw new Error("Não foi possível carregar o produto")
  }

  return data as StoreProduct
}

export async function criarProduto(produto: Partial<StoreProduct>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("store_products").insert(produto).select().single()

  if (error) {
    console.error("Erro ao criar produto:", error)
    throw new Error("Não foi possível criar o produto")
  }

  return data as StoreProduct
}

export async function atualizarProduto(id: string, produto: Partial<StoreProduct>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("store_products").update(produto).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar produto:", error)
    throw new Error("Não foi possível atualizar o produto")
  }

  return data as StoreProduct
}

export async function excluirProduto(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("store_products").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir produto:", error)
    throw new Error("Não foi possível excluir o produto")
  }

  return true
}

// Serviços para pedidos
export async function getPedidos(escolaId: string) {
  const supabase = getSupabaseClient()

  // Validação do escolaId
  if (!escolaId) {
    console.error("Erro ao buscar pedidos: escolaId is undefined or null")
    return []
  }

  // Primeiro, buscamos os pedidos com informações básicas do aluno
  const { data: pedidos, error } = await supabase
    .from("store_orders")
    .select(`
      *,
      student:student_id (
        id,
        registration_number
      )
    `)
    .eq("school_id", escolaId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pedidos:", error)
    throw new Error("Não foi possível carregar os pedidos")
  }

  // Para cada pedido, buscamos o nome completo do aluno na tabela profiles
  if (pedidos && pedidos.length > 0) {
    for (const pedido of pedidos) {
      if (pedido.student) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", pedido.student.id)
          .single()

        if (!profileError && profileData) {
          pedido.student.full_name = profileData.full_name
        }
      }
    }
  }

  return pedidos as StoreOrder[]
}

export async function getPedido(id: string) {
  const supabase = getSupabaseClient()

  // Validação do id
  if (!id) {
    console.error("Erro ao buscar pedido: id is undefined or null")
    throw new Error("ID do pedido não fornecido")
  }

  // Primeiro, buscamos o pedido com informações básicas do aluno e itens
  const { data: pedido, error } = await supabase
    .from("store_orders")
    .select(`
      *,
      student:student_id (
        id,
        registration_number
      ),
      items:store_order_items (
        *,
        product:product_id (*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar pedido:", error)
    throw new Error("Não foi possível carregar o pedido")
  }

  // Buscamos o nome completo do aluno na tabela profiles
  if (pedido && pedido.student) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", pedido.student.id)
      .single()

    if (!profileError && profileData) {
      pedido.student.full_name = profileData.full_name
    }
  }

  return pedido as StoreOrder
}

export async function criarPedido(pedido: Partial<StoreOrder>, itens: Partial<StoreOrderItem>[]) {
  const supabase = getSupabaseClient()

  // Iniciar transação
  const { data: orderData, error: orderError } = await supabase.from("store_orders").insert(pedido).select().single()

  if (orderError) {
    console.error("Erro ao criar pedido:", orderError)
    throw new Error("Não foi possível criar o pedido")
  }

  // Adicionar itens do pedido
  const itensComOrderId = itens.map((item) => ({
    ...item,
    order_id: orderData.id,
  }))

  const { error: itemsError } = await supabase.from("store_order_items").insert(itensComOrderId)

  if (itemsError) {
    console.error("Erro ao adicionar itens ao pedido:", itemsError)
    throw new Error("Não foi possível adicionar itens ao pedido")
  }

  // Atualizar estoque
  for (const item of itens) {
    await registrarMovimentoEstoque({
      school_id: pedido.school_id!,
      product_id: item.product_id!,
      quantity: -item.quantity!,
      movement_type: "out",
      reason: `Pedido #${orderData.id}`,
      reference_id: orderData.id,
      created_by: pedido.student_id!,
    })
  }

  return orderData as StoreOrder
}

export async function atualizarStatusPedido(id: string, status: StoreOrder["status"]) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("store_orders").update({ status }).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    throw new Error("Não foi possível atualizar o status do pedido")
  }

  return data as StoreOrder
}

// Adding the missing functions
export async function updateOrderStatus(orderId: string, status: string) {
  return atualizarStatusPedido(orderId, status as StoreOrder["status"])
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("store_orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar status de pagamento:", error)
    throw new Error("Não foi possível atualizar o status de pagamento")
  }

  return data
}

// Serviços para estoque
export async function getMovimentosEstoque(escolaId: string, produtoId?: string) {
  const supabase = getSupabaseClient()

  // Validação do escolaId
  if (!escolaId) {
    console.error("Erro ao buscar movimentos de estoque: escolaId is undefined or null")
    return []
  }

  let query = supabase
    .from("store_inventory_movements")
    .select(`
      *,
      product:product_id (*)
    `)
    .eq("school_id", escolaId)
    .order("created_at", { ascending: false })

  if (produtoId) {
    query = query.eq("product_id", produtoId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao buscar movimentos de estoque:", error)
    throw new Error("Não foi possível carregar os movimentos de estoque")
  }

  return data as StoreInventoryMovement[]
}

export async function registrarMovimentoEstoque(movimento: Partial<StoreInventoryMovement>) {
  const supabase = getSupabaseClient()

  // Registrar movimento
  const { data, error } = await supabase.from("store_inventory_movements").insert(movimento).select().single()

  if (error) {
    console.error("Erro ao registrar movimento de estoque:", error)
    throw new Error("Não foi possível registrar o movimento de estoque")
  }

  // Atualizar quantidade em estoque do produto
  const { error: updateError } = await supabase.rpc("update_product_stock", {
    p_product_id: movimento.product_id,
    p_quantity: movimento.quantity,
  })

  if (updateError) {
    console.error("Erro ao atualizar estoque do produto:", updateError)
    throw new Error("Não foi possível atualizar o estoque do produto")
  }

  return data as StoreInventoryMovement
}

// Serviços para entregas
export async function getEntregas(escolaId: string) {
  const supabase = getSupabaseClient()

  // Validação do escolaId
  if (!escolaId) {
    console.error("Erro ao buscar entregas: escolaId is undefined or null")
    return []
  }

  // Verificar a estrutura da tabela store_deliveries
  const { data: tableInfo, error: tableError } = await supabase.from("store_deliveries").select("*").limit(1)

  if (tableError) {
    console.error("Erro ao verificar estrutura da tabela store_deliveries:", tableError)
    throw new Error("Não foi possível verificar a estrutura da tabela de entregas")
  }

  // Verificar se a coluna school_id existe
  const hasSchoolId = tableInfo && tableInfo.length > 0 && "school_id" in tableInfo[0]

  // Primeiro, buscamos as entregas com informações básicas do pedido e aluno
  let query = supabase.from("store_deliveries").select(`
      *,
      order:order_id (
        *,
        student:student_id (
          id,
          registration_number
        )
      )
    `)

  // Se a coluna school_id existir, filtramos por ela
  if (hasSchoolId) {
    query = query.eq("school_id", escolaId)
  } else {
    // Caso contrário, filtramos pelo school_id do pedido
    query = query.eq("order.school_id", escolaId)
  }

  query = query.order("created_at", { ascending: false })

  const { data: entregas, error } = await query

  if (error) {
    console.error("Erro ao buscar entregas:", error)
    throw new Error("Não foi possível carregar as entregas")
  }

  // Para cada entrega, buscamos o nome completo do aluno na tabela profiles
  if (entregas && entregas.length > 0) {
    for (const entrega of entregas) {
      if (entrega.order && entrega.order.student) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", entrega.order.student.id)
          .single()

        if (!profileError && profileData) {
          entrega.order.student.full_name = profileData.full_name
        }
      }
    }
  }

  return entregas as StoreDelivery[]
}

export async function getEntrega(id: string) {
  const supabase = getSupabaseClient()

  // Validação do id
  if (!id) {
    console.error("Erro ao buscar entrega: id is undefined or null")
    throw new Error("ID da entrega não fornecido")
  }

  // Primeiro, buscamos a entrega com informações básicas do pedido, aluno e itens
  const { data: entrega, error } = await supabase
    .from("store_deliveries")
    .select(`
      *,
      order:order_id (
        *,
        student:student_id (
          id,
          registration_number
        ),
        items:store_order_items (
          *,
          product:product_id (*)
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao buscar entrega:", error)
    throw new Error("Não foi possível carregar a entrega")
  }

  // Buscamos o nome completo do aluno na tabela profiles
  if (entrega && entrega.order && entrega.order.student) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", entrega.order.student.id)
      .single()

    if (!profileError && profileData) {
      entrega.order.student.full_name = profileData.full_name
    }
  }

  return entrega as StoreDelivery
}

export async function criarEntrega(entrega: Partial<StoreDelivery>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("store_deliveries").insert(entrega).select().single()

  if (error) {
    console.error("Erro ao criar entrega:", error)
    throw new Error("Não foi possível criar a entrega")
  }

  return data as StoreDelivery
}

export async function atualizarStatusEntrega(id: string, status: StoreDelivery["status"], userId?: string) {
  const supabase = getSupabaseClient()

  const updateData: Partial<StoreDelivery> = { status }

  if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString()
    updateData.delivered_by = userId
  }

  const { data, error } = await supabase.from("store_deliveries").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar status da entrega:", error)
    throw new Error("Não foi possível atualizar o status da entrega")
  }

  // Se a entrega foi concluída, atualizar o status do pedido
  if (status === "delivered") {
    await atualizarStatusPedido(data.order_id, "delivered")
  }

  return data as StoreDelivery
}

// Alias para compatibilidade
export const getEntregaById = getEntrega

// Serviços para átomos
export async function getSaldoAtomosAluno(alunoId: string) {
  const supabase = getSupabaseClient()

  // Validação do alunoId
  if (!alunoId) {
    console.error("Erro ao buscar saldo de átomos: alunoId is undefined or null")
    throw new Error("ID do aluno não fornecido")
  }

  const { data, error } = await supabase.from("student_atom_balance").select("*").eq("student_id", alunoId).single()

  if (error && error.code !== "PGRST116") {
    // Não encontrado
    console.error("Erro ao buscar saldo de átomos:", error)
    throw new Error("Não foi possível carregar o saldo de átomos")
  }

  // Se não existir, criar um registro com saldo zero
  if (!data) {
    const { data: newBalance, error: insertError } = await supabase
      .from("student_atom_balance")
      .insert({ student_id: alunoId, balance: 0 })
      .select()
      .single()

    if (insertError) {
      console.error("Erro ao criar saldo de átomos:", insertError)
      throw new Error("Não foi possível criar o saldo de átomos")
    }

    return newBalance as StudentAtomBalance
  }

  return data as StudentAtomBalance
}

export async function registrarTransacaoAtomos(transacao: Partial<AtomTransaction>) {
  const supabase = getSupabaseClient()

  // Registrar transação
  const { data, error } = await supabase.from("atom_transactions").insert(transacao).select().single()

  if (error) {
    console.error("Erro ao registrar transação de átomos:", error)
    throw new Error("Não foi possível registrar a transação de átomos")
  }

  // Atualizar saldo do aluno
  const valorAjuste = transacao.transaction_type === "credit" ? transacao.amount : -transacao.amount!

  // Buscar saldo atual
  const { data: saldoAtual, error: saldoError } = await supabase
    .from("student_atom_balance")
    .select("balance")
    .eq("student_id", transacao.student_id)
    .single()

  if (saldoError && saldoError.code !== "PGRST116") {
    console.error("Erro ao buscar saldo atual:", saldoError)
    throw new Error("Não foi possível atualizar o saldo de átomos")
  }

  // Se não existir saldo, criar um novo registro
  if (!saldoAtual) {
    const { error: insertError } = await supabase
      .from("student_atom_balance")
      .insert({ student_id: transacao.student_id, balance: valorAjuste })

    if (insertError) {
      console.error("Erro ao criar registro de saldo:", insertError)
      throw new Error("Não foi possível criar o registro de saldo")
    }
  } else {
    // Atualizar saldo existente
    const novoSaldo = (saldoAtual.balance || 0) + valorAjuste
    const { error: updateError } = await supabase
      .from("student_atom_balance")
      .update({ balance: novoSaldo })
      .eq("student_id", transacao.student_id)

    if (updateError) {
      console.error("Erro ao atualizar saldo:", updateError)
      throw new Error("Não foi possível atualizar o saldo de átomos")
    }
  }

  return data as AtomTransaction
}

export async function getTransacoesAtomos(alunoId: string) {
  const supabase = getSupabaseClient()

  // Validação do alunoId
  if (!alunoId) {
    console.error("Erro ao buscar transações de átomos: alunoId is undefined or null")
    return []
  }

  const { data, error } = await supabase
    .from("atom_transactions")
    .select("*")
    .eq("student_id", alunoId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar transações de átomos:", error)
    throw new Error("Não foi possível carregar as transações de átomos")
  }

  return data as AtomTransaction[]
}

// Serviços para relatórios financeiros
export async function getRelatorioVendas(escolaId: string, dataInicio: string, dataFim: string) {
  const supabase = getSupabaseClient()

  // Validação do escolaId
  if (!escolaId) {
    console.error("Erro ao buscar relatório de vendas: escolaId is undefined or null")
    return []
  }

  // Primeiro, buscamos os pedidos com informações básicas do aluno
  const { data: pedidos, error } = await supabase
    .from("store_orders")
    .select(`
      id,
      total_amount,
      payment_type,
      status,
      created_at,
      student:student_id (
        id,
        registration_number
      )
    `)
    .eq("school_id", escolaId)
    .gte("created_at", dataInicio)
    .lte("created_at", dataFim)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar relatório de vendas:", error)
    throw new Error("Não foi possível carregar o relatório de vendas")
  }

  // Para cada pedido, buscamos o nome completo do aluno na tabela profiles
  if (pedidos && pedidos.length > 0) {
    for (const pedido of pedidos) {
      if (pedido.student) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", pedido.student.id)
          .single()

        if (!profileError && profileData) {
          pedido.student.full_name = profileData.full_name
        }
      }
    }
  }

  return pedidos as StoreOrder[]
}

export async function getRelatorioProdutosMaisVendidos(escolaId: string, dataInicio: string, dataFim: string) {
  const supabase = getSupabaseClient()

  // Validação do escolaId
  if (!escolaId) {
    console.error("Erro ao buscar produtos mais vendidos: escolaId is undefined or null")
    return []
  }

  const { data, error } = await supabase.rpc("get_top_selling_products", {
    p_school_id: escolaId,
    p_start_date: dataInicio,
    p_end_date: dataFim,
  })

  if (error) {
    console.error("Erro ao buscar produtos mais vendidos:", error)
    throw new Error("Não foi possível carregar os produtos mais vendidos")
  }

  return data
}

// Função corrigida para usar school_id em vez de store_id
export async function getFinanceiroData(storeId: string) {
  const supabase = getSupabaseClient()

  // Validação do storeId
  if (!storeId) {
    console.error("Erro ao buscar dados financeiros: storeId is undefined or null")
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      topProducts: [],
      salesTrend: [],
      paymentMethods: [],
    }
  }

  try {
    // Buscar todos os pedidos da loja usando school_id em vez de store_id
    const { data: orders, error: ordersError } = await supabase
      .from("store_orders")
      .select("*")
      .eq("school_id", storeId) // Usando school_id em vez de store_id
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Erro ao buscar pedidos para relatório financeiro:", ordersError)
      throw new Error("Não foi possível carregar os dados financeiros")
    }

    // Filtrar pedidos completados para cálculos financeiros
    const completedOrders = orders?.filter((order) => order.status === "completed") || []

    // Calcular métricas financeiras
    const totalOrders = completedOrders.length

    // Calcular receita total
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + (order.total_amount || 0)
    }, 0)

    // Calcular ticket médio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Buscar os produtos mais vendidos
    // Vamos fazer uma consulta manual em vez de usar a função RPC que pode não existir
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("store_order_items")
      .select(`
        quantity,
        product_id,
        product:product_id (name, price)
      `)
      .in(
        "order_id",
        completedOrders.map((order) => order.id),
      )

    if (orderItemsError) {
      console.error("Erro ao buscar itens de pedidos:", orderItemsError)
    }

    // Agrupar por produto e calcular totais
    const productSales: Record<string, { id: string; name: string; quantity: number; total_revenue: number }> = {}

    if (orderItems) {
      orderItems.forEach((item) => {
        if (item.product && item.product_id) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              id: item.product_id,
              name: item.product.name,
              quantity: 0,
              total_revenue: 0,
            }
          }

          productSales[item.product_id].quantity += item.quantity || 0
          productSales[item.product_id].total_revenue += (item.quantity || 0) * (item.product.price || 0)
        }
      })
    }

    // Converter para array e ordenar por quantidade vendida
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Agrupar vendas por dia para gráfico de tendência
    const salesByDay = completedOrders.reduce((acc: Record<string, number>, order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + (order.total_amount || 0)
      return acc
    }, {})

    // Converter para formato de array para uso em gráficos
    const salesTrend = Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount,
    }))

    // Agrupar por método de pagamento
    const paymentMethods: Record<string, number> = {}
    completedOrders.forEach((order) => {
      const method = order.payment_type || "unknown"
      paymentMethods[method] = (paymentMethods[method] || 0) + 1
    })

    // Converter para array
    const paymentMethodsData = Object.entries(paymentMethods).map(([method, count]) => ({
      method,
      count,
    }))

    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      topProducts,
      salesTrend,
      paymentMethods: paymentMethodsData,
    }
  } catch (error) {
    console.error("Erro ao buscar dados financeiros:", error)
    throw new Error("Não foi possível carregar os dados financeiros")
  }
}

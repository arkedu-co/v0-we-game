import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PedidoDetalhes } from "@/components/escola/loja/pedido-detalhes"

interface PedidoPageProps {
  params: {
    id: string
  }
}

export default async function PedidoPage({ params }: PedidoPageProps) {
  const supabase = getSupabaseServer()

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/escola/login")
  }

  // Verificar se a escola tem uma loja
  const { data: storeData } = await supabase.from("school_stores").select("*").eq("school_id", session.user.id).single()

  if (!storeData) {
    redirect("/escola/loja")
  }

  // Buscar pedido com informações do aluno e itens
  const { data: pedido } = await supabase
    .from("store_orders")
    .select(`
      *,
      student:student_id (
        *,
        profile:id (*)
      ),
      items:store_order_items (
        *,
        product:product_id (*)
      )
    `)
    .eq("id", params.id)
    .eq("store_id", storeData.id)
    .single()

  if (!pedido) {
    redirect("/escola/loja/pedidos")
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Detalhes do Pedido</h1>
        <PedidoDetalhes pedido={pedido} />
      </div>
    </DashboardLayout>
  )
}

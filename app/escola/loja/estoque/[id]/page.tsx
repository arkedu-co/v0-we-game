import { Suspense } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { EstoqueProdutoDetalhes } from "@/components/escola/loja/estoque-produto-detalhes"
import { getSupabaseServer } from "@/lib/supabase/server"
import { getProduto } from "@/lib/services/loja-service"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EstoqueProdutoPageProps {
  params: {
    id: string
  }
}

export default async function EstoqueProdutoPage({ params }: EstoqueProdutoPageProps) {
  const supabase = getSupabaseServer()

  // Verificar autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/escola/login")
  }

  // Obter ID da escola
  const { data: profile } = await supabase.from("profiles").select("id, user_type").eq("id", session.user.id).single()

  if (!profile || profile.user_type !== "escola") {
    redirect("/")
  }

  const escolaId = profile.id
  const produtoId = params.id

  // Buscar produto
  let produto
  try {
    produto = await getProduto(produtoId)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    redirect("/escola/loja/estoque")
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Histórico de Estoque: {produto.name}</h1>
          <Link href="/escola/loja/estoque">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Carregando histórico de estoque...</span>
            </div>
          }
        >
          <EstoqueProdutoDetalhes escolaId={escolaId} produtoId={produtoId} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

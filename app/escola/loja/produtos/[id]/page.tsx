import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { ProdutoForm } from "@/components/escola/loja/produto-form"

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/escola/login")
  }

  // Get the school ID associated with the logged-in user
  const { data: schoolData, error: schoolError } = await supabase
    .from("schools")
    .select("id")
    .eq("director_id", session.user.id)
    .single()

  if (schoolError || !schoolData) {
    console.error("Error fetching school:", schoolError)
    redirect("/escola/dashboard")
  }

  const schoolId = schoolData.id

  // Verificar se a escola tem uma loja
  const { data: storeData, error: storeError } = await supabase
    .from("school_stores")
    .select("id")
    .eq("school_id", schoolId)
    .single()

  if (storeError || !storeData) {
    console.error("Error fetching store:", storeError)
    redirect("/escola/loja")
  }

  // Check if we're creating a new product or editing an existing one
  const isNewProduct = params.id === "novo"

  let produtoData = null

  // Only fetch product data if we're editing an existing product
  if (!isNewProduct) {
    const { data: produto, error: produtoError } = await supabase
      .from("store_products")
      .select("*")
      .eq("id", params.id)
      .eq("school_id", schoolId)
      .single()

    if (produtoError || !produto) {
      console.error("Error fetching product:", produtoError)
      redirect("/escola/loja/produtos")
    }

    produtoData = produto
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{isNewProduct ? "Novo Produto" : "Editar Produto"}</h1>
        <ProdutoForm schoolId={schoolId} storeId={storeData.id} produtoId={isNewProduct ? undefined : params.id} />
      </div>
    </DashboardLayout>
  )
}

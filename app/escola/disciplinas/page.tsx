import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { getEscolaSupabaseServer } from "@/lib/supabase/escola"
import { cookies } from "next/headers"
import { DisciplinasCardList } from "@/components/escola/disciplinas/disciplinas-card-list"

export default async function DisciplinasPage() {
  // Usar cookies() para obter o cookie store
  const cookieStore = cookies()
  const supabase = getEscolaSupabaseServer(cookieStore)

  // Verificar a sessão do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Buscar a escola associada ao usuário logado
  let escolaId: string | null = null

  if (session) {
    // Tentar buscar como diretor
    const { data: escolaDiretor } = await supabase
      .from("schools")
      .select("id")
      .eq("director_id", session.user.id)
      .single()

    if (escolaDiretor) {
      escolaId = escolaDiretor.id
    } else {
      // Tentar buscar como proprietário
      const { data: escolaProprietario } = await supabase
        .from("schools")
        .select("id")
        .eq("owner_id", session.user.id)
        .single()

      if (escolaProprietario) {
        escolaId = escolaProprietario.id
      }
    }
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Disciplinas</h1>
          <a
            href="/escola/disciplinas/nova"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Nova Disciplina
          </a>
        </div>
        <DisciplinasCardList escolaId={escolaId} />
      </div>
    </DashboardLayout>
  )
}

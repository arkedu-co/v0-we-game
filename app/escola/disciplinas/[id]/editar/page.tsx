import { DisciplinaForm } from "@/components/escola/disciplinas/disciplina-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { escolaSidebarContent } from "@/components/escola/sidebar-content"
import { EscolaSidebarIcons } from "@/components/escola/sidebar-icons"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export default async function EditarDisciplinaPage({ params }: { params: { id: string } }) {
  // Usando uma abordagem alternativa para autenticação
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  // Buscar dados sem redirecionamentos
  let session = null
  let escola = null
  let disciplina = null
  let error = null

  try {
    // Buscar sessão
    const { data: sessionData } = await supabase.auth.getSession()
    session = sessionData.session

    // Se tiver sessão, buscar escola
    if (session) {
      const { data: escolaData } = await supabase
        .from("schools")
        .select("id, name")
        .eq("director_id", session.user.id)
        .single()
      escola = escolaData
    }

    // Buscar disciplina independentemente da autenticação
    const { data: disciplinaData } = await supabase.from("subjects").select("*").eq("id", params.id).single()
    disciplina = disciplinaData
  } catch (e) {
    console.error("Erro ao buscar dados:", e)
    error = e
  }

  return (
    <DashboardLayout userType="escola" sidebarContent={escolaSidebarContent} sidebarIcons={<EscolaSidebarIcons />}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Editar Disciplina</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            <p>Ocorreu um erro ao carregar os dados. Por favor, tente novamente.</p>
          </div>
        )}

        {!session && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            <p>Você não está autenticado. Por favor, faça login para editar esta disciplina.</p>
            <a href="/escola/login" className="underline mt-2 inline-block">
              Ir para página de login
            </a>
          </div>
        )}

        {session && !escola && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            <p>Não foi possível encontrar sua escola. Verifique se você tem permissão para acessar esta página.</p>
          </div>
        )}

        {!disciplina && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            <p>Disciplina não encontrada. Verifique se o ID está correto.</p>
            <a href="/escola/disciplinas" className="underline mt-2 inline-block">
              Voltar para lista de disciplinas
            </a>
          </div>
        )}

        {session && escola && disciplina && disciplina.school_id !== escola.id && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            <p>Você não tem permissão para editar esta disciplina, pois ela não pertence à sua escola.</p>
          </div>
        )}

        {session && escola && disciplina && disciplina.school_id === escola.id && (
          <>
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
              <p>
                Você está editando a disciplina: <strong>{disciplina.name}</strong>
              </p>
            </div>
            <DisciplinaForm escolaId={escola.id} disciplina={disciplina} isEditing={true} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

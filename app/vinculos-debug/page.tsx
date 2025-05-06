import { getSupabaseServerCompat } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function VinculosDebugPage() {
  const cookieStore = cookies()
  const supabase = getSupabaseServerCompat(cookieStore)

  // Verificar sessão
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Vinculos</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Status da Sessão</h2>

        {sessionError ? (
          <div className="bg-red-100 p-4 rounded mb-4">
            <h3 className="font-bold text-red-800">Erro na Sessão</h3>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(sessionError, null, 2)}</pre>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-bold">Dados da Sessão</h3>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(sessionData, null, 2)}</pre>
          </div>
        )}

        <h3 className="font-bold mt-4">Cookies Disponíveis</h3>
        <ul className="list-disc pl-5 mt-2">
          {cookieStore.getAll().map((cookie) => (
            <li key={cookie.name}>
              {cookie.name}: {cookie.value.substring(0, 20)}...
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <a href="/escola/vinculos/novo" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Tentar página de vínculos
        </a>
      </div>
    </div>
  )
}

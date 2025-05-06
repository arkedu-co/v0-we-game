"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export function ProfessoresStaticList() {
  const [professores, setProfessores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)

  useEffect(() => {
    async function fetchProfessores() {
      try {
        const supabase = createClientComponentClient<Database>()

        // Buscar a primeira escola disponível
        const { data: escolas, error: escolasError } = await supabase.from("schools").select("id, name").limit(1)

        if (escolasError) {
          setDebug({ escolasError })
          throw new Error("Erro ao buscar escolas")
        }

        if (!escolas || escolas.length === 0) {
          setDebug({ message: "Nenhuma escola encontrada" })
          setError("Nenhuma escola encontrada")
          setLoading(false)
          return
        }

        const escolaId = escolas[0].id
        setDebug({ escolaId, escolaNome: escolas[0].name })

        // Buscar professores com JOIN na tabela profiles usando o mesmo ID
        // Removendo a coluna 'phone' que não existe
        const { data, error } = await supabase
          .from("teachers")
          .select(`
            id,
            education,
            subjects,
            profiles!inner(
              full_name,
              email,
              avatar_url,
              user_type
            )
          `)
          .eq("school_id", escolaId)

        if (error) {
          setDebug({ error })
          throw new Error("Erro ao buscar professores")
        }

        console.log("Dados dos professores:", data)
        setDebug((prev) => ({ ...prev, professoresData: data }))

        setProfessores(data || [])
        setLoading(false)
      } catch (error: any) {
        console.error("Erro ao buscar professores:", error)
        setError(error.message || "Erro ao buscar professores")
        setLoading(false)
      }
    }

    fetchProfessores()
  }, [])

  if (loading) {
    return <div className="p-4">Carregando professores...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">Erro: {error}</div>
        {debug && (
          <details className="mt-4 p-2 border border-gray-300 rounded">
            <summary className="cursor-pointer text-sm text-gray-500">Informações de depuração</summary>
            <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-xs">{JSON.stringify(debug, null, 2)}</pre>
          </details>
        )}
      </div>
    )
  }

  if (professores.length === 0) {
    return (
      <div className="p-4">
        <p>Nenhum professor encontrado.</p>
        {debug && (
          <details className="mt-4 p-2 border border-gray-300 rounded">
            <summary className="cursor-pointer text-sm text-gray-500">Informações de depuração</summary>
            <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-xs">{JSON.stringify(debug, null, 2)}</pre>
          </details>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Nome</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Tipo</th>
              <th className="py-3 px-6 text-left">Formação</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {professores.map((professor) => (
              <tr key={professor.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left">{professor.profiles?.full_name || "N/A"}</td>
                <td className="py-3 px-6 text-left">{professor.profiles?.email || "N/A"}</td>
                <td className="py-3 px-6 text-left">{professor.profiles?.user_type || "N/A"}</td>
                <td className="py-3 px-6 text-left">{professor.education || "N/A"}</td>
                <td className="py-3 px-6 text-left">
                  <a href={`/escola/professores/${professor.id}`} className="text-blue-600 hover:text-blue-800 mr-2">
                    Detalhes
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {debug && (
        <details className="mt-4 p-2 border border-gray-300 rounded">
          <summary className="cursor-pointer text-sm text-gray-500">Informações de depuração</summary>
          <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-xs">{JSON.stringify(debug, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

interface VinculoFormProps {
  escolaId: string
}

interface Professor {
  id: string
  name: string
}

interface Turma {
  id: string
  name: string
}

interface Disciplina {
  id: string
  name: string
}

export function VinculoForm({ escolaId }: VinculoFormProps) {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [professorId, setProfessorId] = useState("")
  const [turmaId, setTurmaId] = useState("")
  const [disciplinaId, setDisciplinaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Buscando dados para a escola:", escolaId)

        // Buscar professores - corrigido para usar full_name em vez de name
        const { data: professoresData, error: professoresError } = await supabase
          .from("teachers")
          .select("id, profiles(full_name)")
          .eq("school_id", escolaId)

        if (professoresError) {
          console.error("Erro ao buscar professores:", professoresError)
          setError("Erro ao carregar professores")
          return
        }

        console.log("Professores encontrados:", professoresData)

        const professoresFormatados = professoresData.map((professor) => ({
          id: professor.id,
          name: professor.profiles?.full_name || "Professor sem nome",
        }))

        setProfessores(professoresFormatados)

        // Buscar turmas
        const { data: turmasData, error: turmasError } = await supabase
          .from("classes")
          .select("id, name")
          .eq("school_id", escolaId)

        if (turmasError) {
          console.error("Erro ao buscar turmas:", turmasError)
          setError("Erro ao carregar turmas")
          return
        }

        console.log("Turmas encontradas:", turmasData)
        setTurmas(turmasData)

        // Buscar disciplinas
        const { data: disciplinasData, error: disciplinasError } = await supabase
          .from("subjects")
          .select("id, name")
          .eq("school_id", escolaId)

        if (disciplinasError) {
          console.error("Erro ao buscar disciplinas:", disciplinasError)
          setError("Erro ao carregar disciplinas")
          return
        }

        console.log("Disciplinas encontradas:", disciplinasData)
        setDisciplinas(disciplinasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados necessários")
      }
    }

    if (escolaId) {
      fetchData()
    }
  }, [escolaId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Verificar se já existe um vínculo com os mesmos dados
      const { data: existingVinculo, error: checkError } = await supabase
        .from("teacher_class_subjects")
        .select("id")
        .eq("teacher_id", professorId)
        .eq("class_id", turmaId)
        .eq("subject_id", disciplinaId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Erro ao verificar vínculo existente:", checkError)
        setError("Erro ao verificar vínculo existente")
        setLoading(false)
        return
      }

      if (existingVinculo) {
        setError("Já existe um vínculo com esses dados")
        setLoading(false)
        return
      }

      // Criar novo vínculo
      const { error: insertError } = await supabase.from("teacher_class_subjects").insert([
        {
          teacher_id: professorId,
          class_id: turmaId,
          subject_id: disciplinaId,
          school_id: escolaId,
        },
      ])

      if (insertError) {
        console.error("Erro ao criar vínculo:", insertError)
        setError("Erro ao criar vínculo")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/escola/vinculos")
      }, 2000)
    } catch (error) {
      console.error("Erro ao criar vínculo:", error)
      setError("Erro ao processar solicitação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">Vínculo criado com sucesso! Redirecionando...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="professor" className="block text-sm font-medium text-gray-700 mb-1">
            Professor
          </label>
          <select
            id="professor"
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Selecione um professor</option>
            {professores.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">
            Turma
          </label>
          <select
            id="turma"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Selecione uma turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="disciplina" className="block text-sm font-medium text-gray-700 mb-1">
            Disciplina
          </label>
          <select
            id="disciplina"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Selecione uma disciplina</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/escola/vinculos")}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { fetchVinculos, deleteVinculo } from "@/lib/services/vinculo-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash, Search, BookOpen, Users, Calendar, Filter, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function VinculosPageContent() {
  const [vinculos, setVinculos] = useState<any[]>([])
  const [filteredVinculos, setFilteredVinculos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [escolaId, setEscolaId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Buscar ID da escola
  useEffect(() => {
    async function getEscolaId() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/escola/login")
          return
        }

        const { data: escola } = await supabase.from("schools").select("id").eq("director_id", session.user.id).single()

        if (escola) {
          setEscolaId(escola.id)
        } else {
          router.push("/escola/login")
        }
      } catch (error) {
        console.error("Erro ao buscar ID da escola:", error)
        router.push("/escola/login")
      }
    }

    getEscolaId()
  }, [supabase, router])

  // Carregar vínculos quando o ID da escola estiver disponível
  useEffect(() => {
    if (!escolaId) return

    async function loadVinculos() {
      try {
        setLoading(true)
        const data = await fetchVinculos(escolaId)
        setVinculos(data)
        setFilteredVinculos(data)
      } catch (err) {
        console.error("Erro ao buscar vínculos:", err)
        setError("Não foi possível carregar os vínculos. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadVinculos()
  }, [escolaId])

  // Filtrar vínculos quando o termo de busca ou a aba ativa mudar
  useEffect(() => {
    if (!vinculos.length) return

    let filtered = [...vinculos]

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (vinculo) =>
          vinculo.teachers?.profiles?.full_name?.toLowerCase().includes(term) ||
          vinculo.classes?.name?.toLowerCase().includes(term) ||
          vinculo.subjects?.name?.toLowerCase().includes(term),
      )
    }

    // Filtrar por aba
    if (activeTab !== "todos") {
      if (activeTab === "fundamental") {
        filtered = filtered.filter((vinculo) => vinculo.classes?.name?.toLowerCase().includes("fundamental"))
      } else if (activeTab === "medio") {
        filtered = filtered.filter(
          (vinculo) =>
            vinculo.classes?.name?.toLowerCase().includes("médio") ||
            vinculo.classes?.name?.toLowerCase().includes("medio"),
        )
      }
    }

    setFilteredVinculos(filtered)
  }, [searchTerm, activeTab, vinculos])

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este vínculo? Esta ação não pode ser desfeita.")) {
      try {
        const result = await deleteVinculo(id)
        if (result.success) {
          setVinculos(vinculos.filter((vinculo) => vinculo.id !== id))
          setFilteredVinculos(filteredVinculos.filter((vinculo) => vinculo.id !== id))
          toast.success("Vínculo excluído com sucesso")
        } else {
          toast.error("Erro ao excluir vínculo")
        }
      } catch (err) {
        toast.error("Erro ao excluir vínculo")
        console.error("Erro ao excluir vínculo:", err)
      }
    }
  }

  const refreshVinculos = async () => {
    if (!escolaId) return

    try {
      setRefreshing(true)
      const data = await fetchVinculos(escolaId)
      setVinculos(data)
      setFilteredVinculos(data)
      toast.success("Vínculos atualizados com sucesso")
    } catch (err) {
      console.error("Erro ao atualizar vínculos:", err)
      toast.error("Erro ao atualizar vínculos")
    } finally {
      setRefreshing(false)
    }
  }

  if (!escolaId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vínculos</h1>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vínculos</h1>
        <p className="text-gray-500">Carregando vínculos entre professores, turmas e disciplinas...</p>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vínculos</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">{error}</p>
              <Button variant="outline" className="mt-4" onClick={refreshVinculos} disabled={refreshing}>
                {refreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vínculos</h1>
          <p className="text-gray-500">Gerencie os vínculos entre professores, turmas e disciplinas</p>
        </div>
        <Button onClick={() => router.push("/escola/vinculos/novo")}>
          <Plus className="h-4 w-4 mr-2" /> Novo Vínculo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Vínculos Cadastrados</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar vínculos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={refreshVinculos} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="fundamental">Ensino Fundamental</TabsTrigger>
              <TabsTrigger value="medio">Ensino Médio</TabsTrigger>
            </TabsList>
            <TabsContent value="todos" className="mt-0">
              {renderVinculosTable(filteredVinculos, handleDelete)}
            </TabsContent>
            <TabsContent value="fundamental" className="mt-0">
              {renderVinculosTable(filteredVinculos, handleDelete)}
            </TabsContent>
            <TabsContent value="medio" className="mt-0">
              {renderVinculosTable(filteredVinculos, handleDelete)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como funcionam os vínculos?</CardTitle>
          <CardDescription>
            Entenda como os vínculos conectam professores, turmas e disciplinas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-700">Professor</h3>
              </div>
              <p className="text-sm text-gray-600">
                O professor é vinculado a uma ou mais turmas e disciplinas específicas. Cada professor pode lecionar
                diferentes disciplinas para diferentes turmas.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-700">Turma</h3>
              </div>
              <p className="text-sm text-gray-600">
                A turma representa um grupo de alunos. Cada turma pode ter vários professores, cada um responsável por
                uma disciplina diferente.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-700">Disciplina</h3>
              </div>
              <p className="text-sm text-gray-600">
                A disciplina é a matéria lecionada. Uma mesma disciplina pode ser ensinada por diferentes professores em
                diferentes turmas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function renderVinculosTable(vinculos: any[], handleDelete: (id: string) => Promise<void>) {
  if (vinculos.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-center mb-4">
          <Filter className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum vínculo encontrado</h3>
        <p className="text-gray-500 mb-4">Não foram encontrados vínculos com os critérios selecionados.</p>
        <Button variant="outline" onClick={() => (window.location.href = "/escola/vinculos/novo")}>
          <Plus className="h-4 w-4 mr-2" /> Criar novo vínculo
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-3 font-medium text-gray-500">Professor</th>
            <th className="text-left p-3 font-medium text-gray-500">Turma</th>
            <th className="text-left p-3 font-medium text-gray-500">Disciplina</th>
            <th className="text-right p-3 font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody>
          {vinculos.map((vinculo) => (
            <tr key={vinculo.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-3">
                <div className="font-medium">{vinculo.teachers?.profiles?.full_name || "Nome não disponível"}</div>
              </td>
              <td className="p-3">
                <div className="flex items-center">
                  <span>{vinculo.classes?.name || "Turma não disponível"}</span>
                  {vinculo.classes?.year && (
                    <Badge variant="outline" className="ml-2">
                      {vinculo.classes.year}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="p-3">
                <Badge variant="secondary">{vinculo.subjects?.name || "Disciplina não disponível"}</Badge>
              </td>
              <td className="p-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(vinculo.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfessorEditFormProps {
  professorId: string
}

interface Professor {
  id: string
  education?: string
  subjects?: string[]
  profile: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

export function ProfessorEditForm({ professorId }: ProfessorEditFormProps) {
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [education, setEducation] = useState("")
  const [subjects, setSubjects] = useState("")

  const router = useRouter()

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Buscar dados do professor
        const { data: professorData, error: professorError } = await supabase
          .from("teachers")
          .select(`
            *,
            profile:profiles!inner (
              full_name,
              email,
              avatar_url
            )
          `)
          .eq("id", professorId)
          .single()

        if (professorError) {
          throw new Error(`Erro ao buscar professor: ${professorError.message}`)
        }

        if (!professorData) {
          throw new Error("Professor não encontrado")
        }

        setProfessor({
          id: professorData.id,
          education: professorData.education,
          subjects: professorData.subjects,
          profile: {
            full_name: professorData.profile.full_name,
            email: professorData.profile.email,
            avatar_url: professorData.profile.avatar_url,
          },
        })

        // Preencher os campos do formulário
        setFullName(professorData.profile.full_name)
        setEmail(professorData.profile.email)
        setEducation(professorData.education || "")
        setSubjects(professorData.subjects ? professorData.subjects.join(", ") : "")
      } catch (err: any) {
        console.error("Erro:", err)
        setError(err.message || "Ocorreu um erro ao carregar os dados do professor")
      } finally {
        setLoading(false)
      }
    }

    fetchProfessor()
  }, [professorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email) {
      toast.error("Nome e email são obrigatórios")
      return
    }

    try {
      setSaving(true)
      const supabase = getSupabaseClient()

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email: email,
        })
        .eq("id", professorId)

      if (profileError) {
        throw new Error(`Erro ao atualizar perfil: ${profileError.message}`)
      }

      // Atualizar dados do professor
      const subjectsArray = subjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")

      const { error: teacherError } = await supabase
        .from("teachers")
        .update({
          education: education || null,
          subjects: subjectsArray.length > 0 ? subjectsArray : null,
        })
        .eq("id", professorId)

      if (teacherError) {
        throw new Error(`Erro ao atualizar professor: ${teacherError.message}`)
      }

      toast.success("Professor atualizado com sucesso")
      router.push(`/escola/professores/${professorId}`)
    } catch (err: any) {
      console.error("Erro:", err)
      toast.error(err.message || "Ocorreu um erro ao salvar os dados do professor")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando dados do professor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editar Professor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Professor</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Formação Acadêmica</Label>
              <Input id="education" value={education} onChange={(e) => setEducation(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjects">Especialidades (separadas por vírgula)</Label>
              <Textarea
                id="subjects"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Ex: Matemática, Física, Química"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

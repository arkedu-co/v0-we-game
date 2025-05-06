"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { obterRegraXP, criarRegraXP, atualizarRegraXP } from "@/lib/services/xp-service"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"

interface RegraXPFormProps {
  id?: string
  schoolId?: string
}

export default function RegraXPForm({ id, schoolId }: RegraXPFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor_xp: 0,
    school_id: schoolId || "",
  })

  // Verificar a sessão do usuário
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session check error:", error)
          setAuthError(true)
          setError("Erro de autenticação. Por favor, faça login novamente.")
          return
        }

        if (!data.session) {
          console.error("No session found")
          setAuthError(true)
          setError("Sessão expirada. Por favor, faça login novamente.")
          return
        }

        console.log("Session verified successfully")
      } catch (err) {
        console.error("Error checking session:", err)
        setAuthError(true)
        setError("Erro ao verificar sessão. Por favor, tente novamente.")
      }
    }

    checkSession()
  }, [])

  // Obter o school_id do usuário logado se não for fornecido como prop
  useEffect(() => {
    // Se já temos o school_id como prop, não precisamos buscá-lo
    if (schoolId) {
      console.log("Using school ID from props:", schoolId)
      setFormData((prev) => ({ ...prev, school_id: schoolId }))
      return
    }

    const getSchoolId = async () => {
      try {
        setLoading(true)
        console.log("Attempting to get school ID...")

        // Método 1: Tentar obter o school_id do perfil do usuário
        const supabase = getSupabaseClient()

        // Verificar se o usuário está autenticado
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setAuthError(true)
          throw new Error("Erro ao verificar a sessão do usuário")
        }

        if (!session?.user) {
          console.error("No user session found")
          setAuthError(true)
          throw new Error("Usuário não autenticado")
        }

        console.log("User authenticated, ID:", session.user.id)

        // Verificar se o usuário é uma escola ou tem um school_id associado
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
          throw new Error("Erro ao buscar perfil do usuário")
        }

        console.log("User profile:", profile)

        if (profile?.user_type === "escola") {
          // Se o usuário for uma escola, o ID do usuário é o ID da escola
          console.log("User is a school, using user ID as school ID")
          setFormData((prev) => ({ ...prev, school_id: session.user.id }))
          return
        }

        // Método 2: Verificar se o usuário é um professor
        if (profile?.user_type === "professor") {
          console.log("User is a teacher, checking for school association")

          const { data: teacher, error: teacherError } = await supabase
            .from("teachers")
            .select("school_id")
            .eq("id", session.user.id)
            .single()

          if (teacherError) {
            console.error("Teacher error:", teacherError)
            // Não lançar erro aqui, apenas registrar
          } else if (teacher?.school_id) {
            console.log("Teacher is associated with school:", teacher.school_id)
            setFormData((prev) => ({ ...prev, school_id: teacher.school_id }))
            return
          }
        }

        // Método 3: Verificar diretamente na tabela schools
        console.log("Checking if user has a school record")

        const { data: directSchool, error: directSchoolError } = await supabase
          .from("schools")
          .select("id")
          .eq("owner_id", session.user.id)
          .single()

        if (directSchoolError && directSchoolError.code !== "PGRST116") {
          console.error("Direct school error:", directSchoolError)
          // Não lançar erro aqui, apenas registrar
        } else if (directSchool) {
          console.log("Found school with user as owner:", directSchool.id)
          setFormData((prev) => ({ ...prev, school_id: directSchool.id }))
          return
        }

        // Se chegou aqui, não foi possível obter o school_id
        console.error("Could not determine school ID through any method")
        throw new Error("Não foi possível determinar a escola associada ao seu perfil.")
      } catch (error) {
        console.error("Erro ao obter school_id:", error)
        setError(
          "Não foi possível obter a escola associada ao seu perfil. Por favor, verifique se você está logado como uma escola ou um usuário associado a uma escola.",
        )
      } finally {
        setLoading(false)
      }
    }

    getSchoolId()
  }, [schoolId])

  useEffect(() => {
    if (id) {
      const fetchRegraXP = async () => {
        try {
          setLoading(true)
          const data = await obterRegraXP(id)
          setFormData({
            nome: data.name || data.nome,
            descricao: data.description || data.descricao,
            valor_xp: data.xp_value || data.valor_xp,
            school_id: data.school_id || schoolId || formData.school_id,
          })
        } catch (error) {
          console.error("Erro ao carregar regra de XP:", error)
          setError("Não foi possível carregar os dados da regra de XP.")
        } finally {
          setLoading(false)
        }
      }

      fetchRegraXP()
    }
  }, [id, schoolId, formData.school_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "valor_xp" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar se o school_id está presente
      if (!formData.school_id) {
        throw new Error("ID da escola não encontrado. Por favor, tente novamente ou contate o suporte.")
      }

      console.log("Submitting form with data:", formData)

      // Continuar com o envio normal do formulário
      if (id) {
        await atualizarRegraXP(id, formData)
      } else {
        await criarRegraXP(formData)
      }
      router.push("/escola/xp/regras")
    } catch (error) {
      console.error("Erro ao salvar regra de XP:", error)
      setError(
        error instanceof Error ? error.message : "Ocorreu um erro ao salvar a regra de XP. Por favor, tente novamente.",
      )
    } finally {
      setLoading(false)
    }
  }

  // Se houver um erro de autenticação, mostrar opções para fazer login
  if (authError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de Autenticação</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link href="/escola/login">Fazer Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/escola/xp/regras">Voltar para Regras</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Regra</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Presença em aula"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a regra de XP e quando ela deve ser aplicada"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valor_xp">Valor de XP</Label>
              <Input
                id="valor_xp"
                name="valor_xp"
                type="number"
                value={formData.valor_xp}
                onChange={handleChange}
                required
                min={0}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/escola/xp/regras")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

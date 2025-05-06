"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserType } from "@/lib/types"

interface RegisterFormProps {
  userType: UserType
  redirectPath: string
}

export function RegisterForm({ userType, redirectPath }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Registrar o usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Criar o perfil do usuário
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          full_name: fullName,
          user_type: userType,
        })

        if (profileError) throw profileError

        // Criar registro específico baseado no tipo de usuário
        if (userType === "professor") {
          const { error: teacherError } = await supabase.from("teachers").insert({
            id: data.user.id,
            subjects: [],
          })

          if (teacherError) throw teacherError
        } else if (userType === "responsavel") {
          const { error: guardianError } = await supabase.from("guardians").insert({
            id: data.user.id,
            phone: "",
          })

          if (guardianError) throw guardianError
        } else if (userType === "aluno") {
          const { error: studentError } = await supabase.from("students").insert({
            id: data.user.id,
            registration_number: `REG-${Date.now()}`,
            birth_date: new Date().toISOString(),
            grade: "1",
            class: "A",
          })

          if (studentError) throw studentError
        }

        router.push(redirectPath)
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Registro {getUserTypeLabel(userType)}</CardTitle>
        <CardDescription>Crie uma nova conta para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function getUserTypeLabel(userType: UserType): string {
  const labels: Record<UserType, string> = {
    admin: "Administrador",
    escola: "Escola",
    professor: "Professor",
    responsavel: "Responsável",
    aluno: "Aluno",
  }

  return labels[userType]
}

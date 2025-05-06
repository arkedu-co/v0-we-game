"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export function ProfessorLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Limpar qualquer sessão anterior
      await supabase.auth.signOut()

      // Fazer login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.error("Erro de login:", loginError)
        setError(loginError.message)
        return
      }

      if (!data.session) {
        setError("Falha ao criar sessão")
        return
      }

      console.log("Login bem-sucedido, verificando tipo de usuário")

      // Verificar se o usuário é um professor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        setError("Erro ao verificar perfil de usuário")
        return
      }

      if (!profile || profile.user_type !== "professor") {
        console.log("Usuário não é professor:", profile?.user_type)
        // Fazer logout se não for professor
        await supabase.auth.signOut()
        setError("Acesso não autorizado. Este login é apenas para professores.")
        return
      }

      console.log("Usuário é professor, redirecionando para dashboard")

      // Redirecionar para o dashboard
      router.push("/professor/dashboard")
    } catch (err) {
      console.error("Erro não tratado:", err)
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
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
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <a href="/professor/recuperar-senha" className="text-blue-600 hover:text-blue-800">
          Esqueceu sua senha?
        </a>
      </div>
    </div>
  )
}

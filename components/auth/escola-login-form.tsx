"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export function EscolaLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/escola/dashboard"
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Validar campos
      if (!email || !password) {
        setError("Por favor, preencha todos os campos")
        return
      }

      // Fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de login:", error)
        setError(
          error.message === "Invalid login credentials"
            ? "Credenciais inválidas. Verifique seu email e senha."
            : error.message,
        )
        return
      }

      if (!data.session) {
        setError("Não foi possível iniciar a sessão. Tente novamente.")
        return
      }

      // Verificar o tipo de usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.session.user.id)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        setError("Erro ao verificar seu perfil. Tente novamente.")
        return
      }

      // Verificar se é uma escola
      if (profile.user_type !== "escola" && profile.user_type !== "admin") {
        setError("Este login é exclusivo para escolas. Use o portal adequado para o seu tipo de usuário.")
        // Fazer logout
        await supabase.auth.signOut()
        return
      }

      // Redirecionar para a página solicitada ou dashboard
      console.log("Login bem-sucedido, redirecionando para:", redirectTo)

      // Forçar um pequeno atraso para garantir que a sessão seja registrada
      setTimeout(() => {
        window.location.href = redirectTo
      }, 500)
    } catch (err) {
      console.error("Erro no processo de login:", err)
      setError("Ocorreu um erro durante o login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Login da Escola</CardTitle>
        <CardDescription className="text-center">Acesse o sistema escolar com suas credenciais</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/escola/recuperar-senha" className="text-sm text-purple-600 hover:text-purple-800">
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link href="/admin/register" className="text-purple-600 hover:text-purple-800">
            Entre em contato com o administrador
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfessorLoginFormClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      console.log("[Professor Login] Iniciando login")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[Professor Login] Erro de autenticação:", error.message)
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Credenciais inválidas. Verifique seu email e senha."
            : error.message,
        )
        setLoading(false)
        return
      }

      console.log("[Professor Login] Login bem-sucedido, verificando tipo de usuário")

      // Verificar se o usuário é um professor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("[Professor Login] Erro ao buscar perfil:", profileError.message)
        setErrorMessage("Erro ao verificar perfil de usuário.")
        setLoading(false)
        return
      }

      if (profile.user_type !== "professor") {
        console.log("[Professor Login] Usuário não é professor, fazendo logout")
        await supabase.auth.signOut()
        setErrorMessage("Acesso não autorizado. Este login é apenas para professores.")
        setLoading(false)
        return
      }

      console.log("[Professor Login] Usuário autenticado como professor, redirecionando")

      // Pequeno atraso para garantir que a sessão seja persistida
      setTimeout(() => {
        router.push("/professor/dashboard")
      }, 500)
    } catch (error) {
      console.error("[Professor Login] Erro inesperado:", error)
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente mais tarde.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.email@exemplo.com"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
          className="mt-1"
        />
      </div>
      {errorMessage && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <div className="mt-4 text-center text-sm">
        <a href="/professor/recuperar-senha" className="text-blue-600 hover:text-blue-800">
          Esqueceu sua senha?
        </a>
      </div>
    </form>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, School } from "lucide-react"
import Link from "next/link"

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          setUserEmail(userData.user.email)
        }
      } else {
        // Se não houver sessão, verificar se há um hash na URL
        const hash = window.location.hash
        if (!hash) {
          router.push("/admin/login")
        }
      }
    }

    checkSession()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!password || !confirmPassword) {
        throw new Error("Por favor, preencha todos os campos")
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem")
      }

      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres")
      }

      // Atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message || "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="mb-8 flex flex-col items-center">
        <School className="h-12 w-12 text-blue-600 mb-2" />
        <h1 className="text-2xl font-bold">Sistema Escolar</h1>
        <p className="text-muted-foreground">Redefinição de Senha</p>
      </div>

      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
            <CardDescription>
              {userEmail ? `Defina uma nova senha para ${userEmail}` : "Defina uma nova senha para sua conta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Senha redefinida com sucesso!</h3>
                <p className="text-center text-muted-foreground mb-4">
                  Você será redirecionado para a página de login em instantes...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          {!success && (
            <CardFooter className="flex justify-center">
              <Link href="/admin/login" className="text-sm text-blue-600 hover:underline">
                Voltar para o login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

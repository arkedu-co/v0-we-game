"use client"

import type React from "react"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, School } from "lucide-react"
import Link from "next/link"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email) {
        throw new Error("Por favor, informe seu email")
      }

      // Verificar se o email existe e é de um administrador
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .eq("user_type", "admin")
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw new Error("Erro ao verificar email")
      }

      if (!profileData) {
        // Não informamos ao usuário que o email não existe por questões de segurança
        // Simulamos que o email foi enviado
        setSuccess(true)
        return
      }

      // Enviar email de recuperação de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/redefinir-senha`,
      })

      if (resetError) {
        throw new Error("Erro ao enviar email de recuperação")
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "Erro ao processar solicitação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="mb-8 flex flex-col items-center">
        <School className="h-12 w-12 text-blue-600 mb-2" />
        <h1 className="text-2xl font-bold">Sistema Escolar</h1>
        <p className="text-muted-foreground">Recuperação de Senha</p>
      </div>

      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
            <CardDescription>Informe seu email para receber instruções de recuperação de senha</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Email enviado!</h3>
                <p className="text-center text-muted-foreground mb-4">
                  Se houver uma conta associada a este email, você receberá instruções para redefinir sua senha.
                </p>
                <Link href="/admin/login">
                  <Button variant="outline">Voltar para o login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      Enviando...
                    </>
                  ) : (
                    "Enviar instruções"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/admin/login" className="text-sm text-blue-600 hover:underline">
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

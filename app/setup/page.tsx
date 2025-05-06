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
import { CheckCircle2, ArrowRight, School } from "lucide-react"

export default function SetupWizard() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Dados do administrador
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleNext = () => {
    if (step === 1) {
      if (!fullName || !email) {
        setError("Por favor, preencha todos os campos.")
        return
      }
      setError(null)
      setStep(2)
    }
  }

  const handleBack = () => {
    setError(null)
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar senha
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      setLoading(false)
      return
    }

    try {
      // Verificar se já existe um administrador
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "admin")

      if (countError) throw countError

      if (count && count > 0) {
        setError("Já existe um administrador configurado no sistema.")
        setLoading(false)
        return
      }

      // Criar o usuário no Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Criar o perfil de administrador
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          full_name: fullName,
          user_type: "admin",
        })

        if (profileError) throw profileError

        setSuccess(true)
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 3000)
      }
    } catch (error: any) {
      setError(error.message || "Erro ao criar administrador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <School className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">Configuração Inicial</CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? "Vamos configurar o primeiro administrador do sistema"
                : "Configure a senha para o administrador"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Administrador criado com sucesso!</h3>
                <p className="text-center text-muted-foreground">
                  Você será redirecionado para o dashboard em instantes...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Digite o nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite o email"
                        required
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a senha"
                        required
                      />
                    </div>
                  </>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </form>
            )}
          </CardContent>

          {!success && (
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  Voltar
                </Button>
              ) : (
                <div></div>
              )}

              {step === 1 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Criando..." : "Finalizar"}
                </Button>
              )}
            </CardFooter>
          )}
        </Card>

        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <div className={`h-2 w-8 rounded ${step === 1 ? "bg-blue-600" : "bg-gray-300"}`}></div>
            <div className={`h-2 w-8 rounded ${step === 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

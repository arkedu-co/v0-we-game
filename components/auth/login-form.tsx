"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, LogIn } from "lucide-react"
import type { UserType } from "@/lib/types"

interface LoginFormProps {
  userType: UserType
  redirectPath: string
}

function getUserTypeLabel(userType: UserType): string {
  switch (userType) {
    case "admin":
      return "Admin"
    case "escola":
      return "Escola"
    case "professor":
      return "Professor"
    case "responsavel":
      return "Responsável"
    case "aluno":
      return "Aluno"
    default:
      return "Unknown"
  }
}

export function LoginForm({ userType, redirectPath }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [diagnosticInfo, setDiagnosticInfo] = useState<Record<string, any>>({})
  const router = useRouter()

  // Effect to handle redirection after successful login
  useEffect(() => {
    if (loginSuccess) {
      console.log("Login successful, redirecting to:", redirectPath)
      router.push(redirectPath)
      router.refresh()
    }
  }, [loginSuccess, redirectPath, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDiagnosticInfo({})

    try {
      // Verificar se os campos estão preenchidos
      if (!email || !password) {
        throw new Error("Por favor, preencha todos os campos")
      }

      console.log("Tentando fazer login com:", email)

      // Capture environment variables for diagnostics
      setDiagnosticInfo({
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + "..."
          : "undefined",
      })

      // Initialize Supabase client with explicit error handling
      let supabase
      try {
        supabase = getSupabaseClient()
        console.log("Supabase client initialized successfully")
      } catch (initError: any) {
        console.error("Failed to initialize Supabase client:", initError)
        setDiagnosticInfo((prev) => ({
          ...prev,
          supabaseInitError: initError.message,
        }))
        throw new Error(`Erro ao inicializar cliente Supabase: ${initError.message}`)
      }

      // Tentar fazer login com Supabase Auth
      console.log("Attempting authentication...")
      const authStart = performance.now()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      const authTime = performance.now() - authStart
      console.log(`Authentication completed in ${authTime.toFixed(2)}ms`)

      setDiagnosticInfo((prev) => ({
        ...prev,
        authTime: `${authTime.toFixed(2)}ms`,
        authSuccess: !authError,
      }))

      if (authError) {
        console.error("Erro de autenticação:", authError)
        // Traduzir mensagens de erro comuns do Supabase
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos")
        } else if (authError.message.includes("Email not confirmed")) {
          throw new Error("Email não confirmado. Por favor, verifique sua caixa de entrada")
        } else {
          throw new Error(authError.message)
        }
      }

      if (!data.user) {
        throw new Error("Erro ao fazer login. Tente novamente")
      }

      console.log("Login bem-sucedido, verificando tipo de usuário")
      setDiagnosticInfo((prev) => ({
        ...prev,
        userId: data.user?.id,
        userEmail: data.user?.email,
      }))

      // Verificar se o usuário tem o tipo correto
      console.log("Fetching user profile...")
      const profileStart = performance.now()
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single()
      const profileTime = performance.now() - profileStart
      console.log(`Profile fetch completed in ${profileTime.toFixed(2)}ms`)

      setDiagnosticInfo((prev) => ({
        ...prev,
        profileFetchTime: `${profileTime.toFixed(2)}ms`,
        profileSuccess: !profileError,
        profileError: profileError ? profileError.message : null,
        profileErrorCode: profileError ? profileError.code : null,
      }))

      if (profileError) {
        console.error("Erro ao verificar perfil:", profileError)
        if (profileError.code === "PGRST116") {
          throw new Error("Perfil de usuário não encontrado. Entre em contato com o administrador")
        } else {
          throw new Error(`Erro ao verificar perfil: ${profileError.message}`)
        }
      }

      if (profileData.user_type !== userType) {
        console.error("Tipo de usuário incorreto:", profileData.user_type, "esperado:", userType)
        // Fazer logout se o tipo de usuário não corresponder
        await supabase.auth.signOut()
        throw new Error(`Acesso não autorizado. Este login é apenas para ${getUserTypeLabel(userType).toLowerCase()}`)
      }

      console.log("Tipo de usuário verificado, redirecionando para:", redirectPath)

      // Login bem-sucedido, marcar como sucesso para acionar o useEffect
      setLoginSuccess(true)

      // Forçar redirecionamento imediato como fallback
      setTimeout(() => {
        console.log("Forçando redirecionamento após timeout")
        window.location.href = redirectPath
      }, 1000)
    } catch (error: any) {
      console.error("Erro no processo de login:", error)
      setError(error.message || "Erro ao fazer login")
      setDiagnosticInfo((prev) => ({
        ...prev,
        finalError: error.message,
        errorStack: error.stack,
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Login</h2>
        <p className="text-gray-500">Entre com a sua conta</p>
      </div>
      <div className="grid gap-6">
        {error && (
          <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>

            {/* Show diagnostic info when there's an error */}
            {Object.keys(diagnosticInfo).length > 0 && (
              <div className="mt-2 text-xs border-t border-red-200 pt-2">
                <details>
                  <summary className="cursor-pointer font-medium">Informações de diagnóstico</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(diagnosticInfo, null, 2)}</pre>
                </details>
              </div>
            )}
          </Alert>
        )}
        {loginSuccess && (
          <Alert className="rounded-lg border-green-200 bg-green-50">
            <AlertDescription className="text-green-600">Login bem-sucedido! Redirecionando...</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="seuemail@exemplo.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || loginSuccess}
              className="px-4 py-3 rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200"
            />
          </div>
          <div className="grid gap-2 mt-4">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              placeholder="********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || loginSuccess}
              className="px-4 py-3 rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200"
            />
          </div>
          <Button
            className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium text-white"
            disabled={loading || loginSuccess}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aguarde...
              </>
            ) : loginSuccess ? (
              <>
                Redirecionando...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Entrar
                <LogIn className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

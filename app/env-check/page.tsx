"use client"

import { useState, useEffect } from "react"
import { verifySupabaseEnvironment, checkSupabaseConnection } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export default function EnvCheckPage() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      // Check environment variables
      const env = verifySupabaseEnvironment()
      setEnvInfo(env)

      // Check connection
      setChecking(true)
      const isConnected = await checkSupabaseConnection()
      setConnectionStatus(isConnected)
    } catch (error) {
      console.error("Error checking environment:", error)
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verificação de Ambiente</CardTitle>
          <CardDescription>Verificando variáveis de ambiente e conexão com Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Variáveis de Ambiente</h3>

                <div className="flex items-center">
                  {envInfo?.hasUrl ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>NEXT_PUBLIC_SUPABASE_URL: {envInfo?.hasUrl ? "Presente" : "Ausente"}</span>
                </div>

                {envInfo?.urlPrefix && <div className="text-sm text-gray-500 ml-7">Prefixo: {envInfo.urlPrefix}</div>}

                <div className="flex items-center">
                  {envInfo?.hasKey ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envInfo?.hasKey ? "Presente" : "Ausente"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Teste de Conexão</h3>

                {checking ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span>Verificando conexão...</span>
                  </div>
                ) : connectionStatus === true ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <span>Conexão com Supabase estabelecida com sucesso</span>
                  </div>
                ) : connectionStatus === false ? (
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span>Falha ao conectar com Supabase</span>
                  </div>
                ) : null}
              </div>

              {(!envInfo?.hasUrl || !envInfo?.hasKey || connectionStatus === false) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Problemas detectados</AlertTitle>
                  <AlertDescription>
                    {!envInfo?.hasUrl && <p>• NEXT_PUBLIC_SUPABASE_URL não está definido</p>}
                    {!envInfo?.hasKey && <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY não está definido</p>}
                    {connectionStatus === false && <p>• Não foi possível conectar ao Supabase</p>}
                  </AlertDescription>
                </Alert>
              )}

              {envInfo?.hasUrl && envInfo?.hasKey && connectionStatus === true && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Tudo certo!</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Todas as variáveis de ambiente estão configuradas corretamente e a conexão com o Supabase está
                    funcionando.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkEnvironment} disabled={checking} className="w-full">
            {checking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar novamente
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

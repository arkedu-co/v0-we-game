"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ConnectionTroubleshooter() {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    // Verificar status inicial
    setIsOnline(navigator.onLine)

    // Adicionar event listeners para mudanças de status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      // Tentar fazer uma requisição simples para verificar a conexão
      const response = await fetch("/api/health", { cache: "no-store" })
      setIsOnline(response.ok)
    } catch (error) {
      setIsOnline(false)
    } finally {
      setIsChecking(false)
      setLastChecked(new Date())
    }
  }

  return (
    <div className="space-y-4">
      <Alert variant={isOnline ? "default" : "destructive"}>
        <div className="flex items-center">
          {isOnline ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
          <AlertTitle>{isOnline ? "Conectado" : "Desconectado"}</AlertTitle>
        </div>
        <AlertDescription>
          {isOnline
            ? "Sua conexão com a internet parece estar funcionando corretamente."
            : "Você parece estar offline. Verifique sua conexão com a internet."}
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <Button onClick={checkConnection} disabled={isChecking} variant="outline" size="sm">
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar conexão
            </>
          )}
        </Button>
        {lastChecked && (
          <span className="text-xs text-gray-500">Última verificação: {lastChecked.toLocaleTimeString()}</span>
        )}
      </div>

      {!isOnline && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Sugestões:</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Verifique se seu dispositivo está conectado à internet</li>
            <li>Reinicie seu roteador ou modem</li>
            <li>Tente usar uma conexão diferente (Wi-Fi, dados móveis)</li>
            <li>Verifique se o serviço está em manutenção</li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Exportação adicional para compatibilidade
export default ConnectionTroubleshooter

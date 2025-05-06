"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function LoginFallback() {
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar o fallback após um pequeno atraso para evitar flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login de Professor</CardTitle>
        <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-center text-amber-600">
            O formulário de login está carregando. Se esta mensagem persistir, por favor, recarregue a página.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Recarregar página</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-xs text-center text-muted-foreground">
          Problemas para acessar? Entre em contato com o administrador da escola.
        </div>
      </CardFooter>
    </Card>
  )
}

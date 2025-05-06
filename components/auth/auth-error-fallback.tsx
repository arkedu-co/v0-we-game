"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface AuthErrorFallbackProps {
  message?: string
  redirectTo?: string
  redirectLabel?: string
}

export function AuthErrorFallback({
  message = "Você precisa estar autenticado para acessar esta página.",
  redirectTo = "/escola/login",
  redirectLabel = "Fazer Login",
}: AuthErrorFallbackProps) {
  const [currentPath, setCurrentPath] = useState<string>("")

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  const loginUrl = currentPath ? `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}` : redirectTo

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500 mr-4" />
          <h2 className="text-2xl font-bold text-gray-800">Erro de Autenticação</h2>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center">
          <Link href={loginUrl}>
            <Button className="bg-purple-600 hover:bg-purple-700">{redirectLabel}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

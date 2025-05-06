"use client"

import { useEffect, useState } from "react"

export function HeadersUsageChecker() {
  const [components, setComponents] = useState<string[]>([])

  useEffect(() => {
    // Esta função é executada apenas no cliente
    // Vamos verificar os componentes que podem estar usando next/headers
    const checkComponents = async () => {
      try {
        const response = await fetch("/api/check-headers-usage")
        const data = await response.json()
        setComponents(data.components)
      } catch (error) {
        console.error("Erro ao verificar componentes:", error)
      }
    }

    checkComponents()
  }, [])

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h3 className="font-bold text-yellow-800">Componentes que podem estar usando next/headers:</h3>
      {components.length > 0 ? (
        <ul className="mt-2 list-disc pl-5">
          {components.map((component, index) => (
            <li key={index} className="text-yellow-700">
              {component}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-yellow-700">Nenhum componente identificado ou verificação em andamento...</p>
      )}
    </div>
  )
}

import { HeadersUsageChecker } from "@/components/diagnostics/headers-usage-checker"

export default function HeadersDiagnosticPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Uso de next/headers</h1>
      <p className="mb-6">
        Esta página ajuda a identificar componentes que podem estar usando next/headers e causando problemas de
        compatibilidade entre App Router e Pages Router.
      </p>

      <HeadersUsageChecker />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="font-bold text-blue-800">Solução:</h2>
        <ol className="mt-2 list-decimal pl-5 space-y-2 text-blue-700">
          <li>Identifique componentes que usam next/headers</li>
          <li>Crie versões alternativas desses componentes que não dependam de next/headers</li>
          <li>Use as versões alternativas em páginas do Pages Router</li>
          <li>Ou migre completamente para o App Router</li>
        </ol>
      </div>
    </div>
  )
}

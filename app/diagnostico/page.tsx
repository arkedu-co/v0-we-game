import { ConnectionTroubleshooter } from "@/components/diagnostics/connection-troubleshooter"

export default function DiagnosticPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Diagnóstico do Sistema</h1>
      <ConnectionTroubleshooter />

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Esta página ajuda a diagnosticar problemas de conexão com o servidor.
          <br />
          Se os problemas persistirem, entre em contato com o suporte técnico.
        </p>
      </div>
    </div>
  )
}

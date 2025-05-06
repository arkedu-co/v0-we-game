export default function HeadersFixPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Correção de Imports de next/headers</h1>
      <p className="mb-6">
        Esta página fornece instruções para corrigir problemas com imports de next/headers em páginas do Pages Router.
      </p>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
        <h2 className="font-bold text-yellow-800 mb-2">Problema:</h2>
        <p className="text-yellow-700">
          O erro "You're importing a component that needs next/headers" ocorre quando um componente que usa next/headers
          é importado em uma página do Pages Router.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
        <h2 className="font-bold text-blue-800 mb-2">Soluções:</h2>
        <ol className="list-decimal pl-5 space-y-2 text-blue-700">
          <li>
            Use as versões compatíveis dos componentes:
            <ul className="list-disc pl-5 mt-1">
              <li>getSupabaseServerCompat() em vez de getSupabaseServer()</li>
              <li>createServerClientCompat() em vez de createServerClient()</li>
            </ul>
          </li>
          <li>
            Use o utilitário de detecção automática:
            <ul className="list-disc pl-5 mt-1">
              <li>import {"{ getSupabaseAuto }"} from "@/lib/supabase/auto"</li>
              <li>const supabase = getSupabaseAuto()</li>
            </ul>
          </li>
          <li>
            Execute o script de correção automática:
            <pre className="bg-gray-100 p-2 rounded mt-1">npx tsx scripts/fix-headers-imports.ts</pre>
          </li>
        </ol>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <h2 className="font-bold text-green-800 mb-2">Solução a longo prazo:</h2>
        <p className="text-green-700">
          Migre completamente para o App Router, movendo todas as páginas da pasta pages/ para a pasta app/.
        </p>
      </div>
    </div>
  )
}

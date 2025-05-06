import { getEconomiaConfig } from "@/lib/services/economia-service"
import { EconomiaForm } from "@/components/escola/economia/economia-form"

export const metadata = {
  title: "Configurações da Economia | WeGame",
}

export default async function EconomiaPage() {
  const config = await getEconomiaConfig()

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações da Economia</h1>
        <p className="text-gray-500 mt-2">
          Configure os parâmetros econômicos da sua escola, como o salário diário dos alunos.
        </p>
      </div>

      <div className="grid gap-6">
        <EconomiaForm config={config} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Como funciona a economia?</h3>
          <p className="text-blue-700">
            Os alunos recebem automaticamente a quantidade de átomos definida como "Salário Diário" todos os dias. Esses
            átomos podem ser usados para comprar itens na loja da escola ou trocados por benefícios.
          </p>
        </div>
      </div>
    </div>
  )
}

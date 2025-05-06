import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

interface HistoricoXPAlunoProps {
  alunoId: string
}

export function HistoricoXPAluno({ alunoId }: HistoricoXPAlunoProps) {
  // Aqui você buscaria o histórico real do aluno usando o alunoId
  const historicoXP = [
    {
      id: "1",
      regra: "Participação em Aula",
      valor: 10,
      data: "2023-05-15T10:30:00Z",
      professor: "Prof. Carlos Silva",
    },
    {
      id: "2",
      regra: "Entrega de Atividade",
      valor: 15,
      data: "2023-05-10T14:15:00Z",
      professor: "Prof. Carlos Silva",
    },
    {
      id: "3",
      regra: "Nota Máxima",
      valor: 25,
      data: "2023-05-05T09:45:00Z",
      professor: "Prof. Ana Souza",
    },
    {
      id: "4",
      regra: "Ajuda aos Colegas",
      valor: 20,
      data: "2023-04-28T13:20:00Z",
      professor: "Prof. Carlos Silva",
    },
    {
      id: "5",
      regra: "Participação em Aula",
      valor: 10,
      data: "2023-04-20T11:10:00Z",
      professor: "Prof. Ana Souza",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de XP</CardTitle>
        <CardDescription>Registro de XP recebido pelo aluno</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historicoXP.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="mr-4 rounded-full bg-purple-100 p-2">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  +{item.valor} XP por {item.regra}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(item.data).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  • {item.professor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

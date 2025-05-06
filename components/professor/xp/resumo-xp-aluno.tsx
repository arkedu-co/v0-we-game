import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award } from "lucide-react"

interface ResumoXPAlunoProps {
  alunoId: string
}

export function ResumoXPAluno({ alunoId }: ResumoXPAlunoProps) {
  // Aqui você buscaria os dados reais do aluno usando o alunoId
  const dadosXP = {
    totalXP: 720,
    nivel: 3,
    proximoNivel: 1000,
    progresso: 72, // porcentagem para o próximo nível
    posicaoRanking: 2,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Resumo de XP</CardTitle>
        <CardDescription>Progresso e nível atual do aluno</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Total de XP</p>
                <p className="text-2xl font-bold">{dadosXP.totalXP} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium leading-none">Nível</p>
              <p className="text-2xl font-bold">{dadosXP.nivel}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o Nível {dadosXP.nivel + 1}</span>
              <span>{dadosXP.progresso}%</span>
            </div>
            <Progress value={dadosXP.progresso} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              Faltam {dadosXP.proximoNivel - dadosXP.totalXP} XP para o próximo nível
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <span className="font-bold text-yellow-600">{dadosXP.posicaoRanking}</span>
                </div>
                <span className="text-sm font-medium">Posição no Ranking</span>
              </div>
              <span className="text-sm font-medium">Top {dadosXP.posicaoRanking}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

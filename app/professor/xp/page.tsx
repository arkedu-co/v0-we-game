import type { Metadata } from "next"
import Link from "next/link"
import { Award, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "XP | Professor",
  description: "Gerenciamento de XP para alunos",
}

export default async function XPPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de XP</h2>
          <p className="text-muted-foreground">Distribua XP para seus alunos e acompanhe o progresso deles.</p>
        </div>
        <Link href="/professor/xp/distribuir">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Distribuir XP
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="regras" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regras">Regras de XP</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="regras" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participação em Aula</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+10 XP</div>
                <p className="text-xs text-muted-foreground">Para alunos que participam ativamente das aulas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrega de Atividade</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+15 XP</div>
                <p className="text-xs text-muted-foreground">Para alunos que entregam atividades no prazo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nota Máxima</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+25 XP</div>
                <p className="text-xs text-muted-foreground">Para alunos que tiram nota máxima em avaliações</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de XP</CardTitle>
              <CardDescription>Registro de XP distribuído recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-purple-100 p-2">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Maria Silva recebeu +15 XP por Entrega de Atividade
                    </p>
                    <p className="text-sm text-muted-foreground">Hoje às 10:30</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-purple-100 p-2">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      João Santos recebeu +10 XP por Participação em Aula
                    </p>
                    <p className="text-sm text-muted-foreground">Ontem às 14:15</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-purple-100 p-2">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Ana Oliveira recebeu +25 XP por Nota Máxima</p>
                    <p className="text-sm text-muted-foreground">2 dias atrás</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de XP</CardTitle>
              <CardDescription>Alunos com maior acúmulo de XP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                    <span className="font-bold text-yellow-600">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ana Oliveira</p>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div className="ml-4 font-bold">850 XP</div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                    <span className="font-bold text-gray-600">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">João Santos</p>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <div className="ml-4 font-bold">720 XP</div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <span className="font-bold text-amber-600">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Maria Silva</p>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div className="ml-4 font-bold">680 XP</div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <span className="font-bold text-gray-600">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pedro Almeida</p>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: "55%" }}></div>
                    </div>
                  </div>
                  <div className="ml-4 font-bold">550 XP</div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <span className="font-bold text-gray-600">5</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Carla Mendes</p>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="ml-4 font-bold">480 XP</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

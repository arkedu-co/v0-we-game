"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Award } from "lucide-react"

interface SaldoAlunoProps {
  alunoId: string
}

interface SaldoData {
  atomos: number
  xp: {
    atual: number
    total: number
    nivel: string
    progresso: number
  }
  carregando: boolean
  erro: string | null
}

export function SaldoAluno({ alunoId }: SaldoAlunoProps) {
  const [saldo, setSaldo] = useState<SaldoData>({
    atomos: 0,
    xp: {
      atual: 0,
      total: 0,
      nivel: "Iniciante",
      progresso: 0,
    },
    carregando: true,
    erro: null,
  })

  useEffect(() => {
    async function carregarSaldo() {
      if (!alunoId) return

      try {
        const supabase = getSupabaseClient()

        // Buscar saldo de átomos
        const { data: atomosData, error: atomosError } = await supabase
          .from("student_atom_balance")
          .select("balance")
          .eq("student_id", alunoId)
          .single()

        if (atomosError && atomosError.code !== "PGRST116") {
          console.error("Erro ao buscar saldo de átomos:", atomosError)
          setSaldo((prev) => ({ ...prev, erro: "Erro ao carregar saldo de átomos", carregando: false }))
          return
        }

        // Buscar XP e nível
        const { data: xpData, error: xpError } = await supabase
          .from("student_xp")
          .select(`
            xp_amount,
            level:level_id (
              id,
              name,
              min_xp,
              max_xp
            )
          `)
          .eq("student_id", alunoId)
          .single()

        if (xpError && xpError.code !== "PGRST116") {
          console.error("Erro ao buscar XP:", xpError)
          setSaldo((prev) => ({ ...prev, erro: "Erro ao carregar XP", carregando: false }))
          return
        }

        // Calcular dados de XP e nível
        let xpAtual = 0
        let xpTotal = 0
        let nivelNome = "Iniciante"
        let progresso = 0

        if (xpData) {
          xpAtual = xpData.xp_amount || 0

          if (xpData.level) {
            nivelNome = xpData.level.name
            const minXP = xpData.level.min_xp || 0
            const maxXP = xpData.level.max_xp || 100
            xpTotal = maxXP

            // Calcular progresso percentual dentro do nível atual
            const xpNoNivel = xpAtual - minXP
            const rangeNivel = maxXP - minXP
            progresso = Math.min(100, Math.max(0, (xpNoNivel / rangeNivel) * 100))
          }
        }

        // Atualizar estado
        setSaldo({
          atomos: atomosData?.balance || 0,
          xp: {
            atual: xpAtual,
            total: xpTotal,
            nivel: nivelNome,
            progresso: progresso,
          },
          carregando: false,
          erro: null,
        })
      } catch (error) {
        console.error("Erro ao carregar saldo:", error)
        setSaldo((prev) => ({ ...prev, erro: "Erro ao carregar dados do aluno", carregando: false }))
      }
    }

    carregarSaldo()
  }, [alunoId])

  if (saldo.carregando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carteira do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (saldo.erro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carteira do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800">{saldo.erro}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carteira do Aluno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Saldo de Átomos */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Átomos</p>
                <p className="text-2xl font-bold text-amber-900">{saldo.atomos}</p>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-1">Moeda virtual para compras na loja da escola</p>
          </div>

          {/* Nível de XP */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Nível</p>
                <p className="text-2xl font-bold text-blue-900">{saldo.xp.nivel}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-blue-700 mb-1">
                <span>XP: {saldo.xp.atual}</span>
                <span>Próximo nível: {saldo.xp.total}</span>
              </div>
              <Progress value={saldo.xp.progresso} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

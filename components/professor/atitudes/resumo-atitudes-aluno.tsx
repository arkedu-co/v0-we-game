"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, TrendingUp, Zap } from "lucide-react"

interface ResumoAtitudesAlunoProps {
  alunoId: string
}

interface Resumo {
  totalAtitudes: number
  atitudesPositivas: number
  atitudesNegativas: number
  totalXP: number
  totalAtomos: number
}

export function ResumoAtitudesAluno({ alunoId }: ResumoAtitudesAlunoProps) {
  const [resumo, setResumo] = useState<Resumo>({
    totalAtitudes: 0,
    atitudesPositivas: 0,
    atitudesNegativas: 0,
    totalXP: 0,
    totalAtomos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarResumo() {
      if (!alunoId) return

      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("applied_attitudes")
          .select(`
            id,
            attitude:attitude_id (
              id,
              name,
              type,
              reward_value,
              reward_type,
              reward_value_xp,
              reward_value_atoms
            )
          `)
          .eq("student_id", alunoId)

        if (error) {
          console.error("Erro ao buscar atitudes:", error)
          return
        }

        // Calcular resumo
        const novoResumo = {
          totalAtitudes: data.length,
          atitudesPositivas: data.filter((a) => a.attitude?.type === "positive").length,
          atitudesNegativas: data.filter((a) => a.attitude?.type === "negative").length,
          totalXP: data.reduce((total, a) => {
            if (a.attitude?.reward_type === "xp" || a.attitude?.reward_type === "both") {
              return total + (a.attitude?.reward_value_xp || 0)
            }
            return total
          }, 0),
          totalAtomos: data.reduce((total, a) => {
            if (a.attitude?.reward_type === "atoms" || a.attitude?.reward_type === "both") {
              return total + (a.attitude?.reward_value_atoms || 0)
            }
            return total
          }, 0),
        }

        setResumo(novoResumo)
      } catch (error) {
        console.error("Erro ao carregar resumo:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarResumo()
  }, [alunoId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Atitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Atitudes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Total de Atitudes</p>
              <p className="text-2xl font-bold text-purple-900">{resumo.totalAtitudes}</p>
              <div className="flex text-xs mt-1">
                <span className="text-green-600 mr-2">+{resumo.atitudesPositivas} positivas</span>
                <span className="text-red-600">-{resumo.atitudesNegativas} negativas</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total de XP</p>
              <p className="text-2xl font-bold text-blue-900">{resumo.totalXP}</p>
              <p className="text-xs text-blue-600 mt-1">Pontos de experiência acumulados</p>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700">Total de Átomos</p>
              <p className="text-2xl font-bold text-amber-900">{resumo.totalAtomos}</p>
              <p className="text-xs text-amber-600 mt-1">Moeda virtual para a loja</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

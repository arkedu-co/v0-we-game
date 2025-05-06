"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { obterAtitude, criarAtitude, atualizarAtitude } from "@/lib/services/atitude-service"
import { getSupabaseClient } from "@/lib/supabase/client"

interface AtitudeFormProps {
  id?: string
}

export default function AtitudeForm({ id }: AtitudeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "positive",
    recompensas: {
      xp: false,
      atoms: false,
    },
    valor_xp: 0,
    valor_atoms: 0,
    school_id: "",
  })

  // Obter o school_id do usuário logado
  useEffect(() => {
    const getSchoolId = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          console.error("No active session found")
          setError("Sessão não encontrada. Por favor, faça login novamente.")
          return
        }

        console.log("User ID:", session.user.id)

        // For escola user type, the user ID is the school ID
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        console.log("User profile:", profile)

        if (profile) {
          // For escola user type, the user's ID is the school ID
          if (profile.user_type === "escola") {
            setFormData((prev) => ({ ...prev, school_id: session.user.id }))
            console.log("Setting school_id to user ID:", session.user.id)
          }
          // For other user types, use the school_id from the profile
          else if (profile.school_id) {
            setFormData((prev) => ({ ...prev, school_id: profile.school_id }))
            console.log("Setting school_id from profile:", profile.school_id)
          } else {
            // If no school_id in profile, try to get it from schools table
            const { data: schoolData } = await supabase.from("schools").select("id").eq("id", session.user.id).single()

            if (schoolData?.id) {
              setFormData((prev) => ({ ...prev, school_id: schoolData.id }))
              console.log("Setting school_id from schools table:", schoolData.id)
            } else {
              console.error("School ID not found in user profile or schools table")
              setError("Não foi possível identificar a escola. Por favor, contate o suporte.")
            }
          }
        } else {
          console.error("User profile not found")
          setError("Perfil de usuário não encontrado. Por favor, contate o suporte.")
        }
      } catch (err) {
        console.error("Error fetching school ID:", err)
        setError("Erro ao obter dados da escola. Por favor, tente novamente.")
      }
    }

    getSchoolId()
  }, [])

  useEffect(() => {
    if (id) {
      const fetchAtitude = async () => {
        try {
          setLoading(true)
          const data = await obterAtitude(id)

          // Determinar quais recompensas estão ativas
          const hasXP = data.reward_type === "xp" || data.reward_type === "both"
          const hasAtoms = data.reward_type === "atoms" || data.reward_type === "both"

          setFormData({
            nome: data.name || data.nome,
            descricao: data.description || data.descricao,
            tipo: data.type || data.tipo,
            recompensas: {
              xp: hasXP,
              atoms: hasAtoms,
            },
            valor_xp: hasXP ? data.reward_value_xp || data.valor_xp || 0 : 0,
            valor_atoms: hasAtoms ? data.reward_value_atoms || data.valor_atoms || 0 : 0,
            school_id: data.school_id,
          })
        } catch (error) {
          console.error("Erro ao carregar atitude:", error)
          setError("Não foi possível carregar os dados da atitude.")
        } finally {
          setLoading(false)
        }
      }

      fetchAtitude()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "valor_xp" || name === "valor_atoms" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      recompensas: {
        ...prev.recompensas,
        [name]: checked,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar se o school_id está presente
    if (!formData.school_id) {
      setError("ID da escola não encontrado. Por favor, recarregue a página ou contate o suporte.")
      setLoading(false)
      return
    }

    // Validar se pelo menos um tipo de recompensa foi selecionado
    if (!formData.recompensas.xp && !formData.recompensas.atoms) {
      setError("Selecione pelo menos um tipo de recompensa.")
      setLoading(false)
      return
    }

    // Validar se os valores das recompensas selecionadas são maiores que zero
    if (formData.recompensas.xp && formData.valor_xp <= 0) {
      setError("O valor de XP deve ser maior que zero.")
      setLoading(false)
      return
    }

    if (formData.recompensas.atoms && formData.valor_atoms <= 0) {
      setError("O valor de Átomos deve ser maior que zero.")
      setLoading(false)
      return
    }

    try {
      // Determinar o tipo de recompensa com base nas seleções
      let rewardType = "none"
      if (formData.recompensas.xp && formData.recompensas.atoms) {
        rewardType = "both"
      } else if (formData.recompensas.xp) {
        rewardType = "xp"
      } else if (formData.recompensas.atoms) {
        rewardType = "atoms"
      }

      // Calcular o valor principal da recompensa
      let rewardValue = 0
      if (rewardType === "xp" || rewardType === "both") {
        rewardValue = formData.valor_xp
      } else if (rewardType === "atoms") {
        rewardValue = formData.valor_atoms
      }

      const atitudeData = {
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo,
        recompensa_tipo: rewardType,
        valor_xp: formData.valor_xp,
        valor_atoms: formData.valor_atoms,
        school_id: formData.school_id,
        // Não precisamos adicionar reward_value aqui, pois o service vai calculá-lo
      }

      console.log("Submitting attitude with data:", atitudeData)

      if (id) {
        await atualizarAtitude(id, atitudeData)
      } else {
        await criarAtitude(atitudeData)
      }
      router.push("/escola/atitudes")
    } catch (error) {
      console.error("Erro ao salvar atitude:", error)
      setError("Ocorreu um erro ao salvar a atitude. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Atitude</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Participação em aula"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a atitude e quando ela deve ser aplicada"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Atitude</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="positive">Positiva</SelectItem>
                  <SelectItem value="negative">Negativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tipos de Recompensa</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="xp"
                    checked={formData.recompensas.xp}
                    onCheckedChange={(checked) => handleCheckboxChange("xp", checked === true)}
                  />
                  <Label htmlFor="xp" className="cursor-pointer">
                    XP
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="atoms"
                    checked={formData.recompensas.atoms}
                    onCheckedChange={(checked) => handleCheckboxChange("atoms", checked === true)}
                  />
                  <Label htmlFor="atoms" className="cursor-pointer">
                    Átomos
                  </Label>
                </div>
              </div>
            </div>

            {formData.recompensas.xp && (
              <div className="grid gap-2">
                <Label htmlFor="valor_xp">Valor de XP</Label>
                <Input
                  id="valor_xp"
                  name="valor_xp"
                  type="number"
                  value={formData.valor_xp}
                  onChange={handleChange}
                  required={formData.recompensas.xp}
                  min={0}
                />
              </div>
            )}

            {formData.recompensas.atoms && (
              <div className="grid gap-2">
                <Label htmlFor="valor_atoms">Valor de Átomos</Label>
                <Input
                  id="valor_atoms"
                  name="valor_atoms"
                  type="number"
                  value={formData.valor_atoms}
                  onChange={handleChange}
                  required={formData.recompensas.atoms}
                  min={0}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/escola/atitudes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

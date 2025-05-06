"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Store, Coins, DollarSign, Plus } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { SchoolStore } from "@/lib/types"

interface SchoolStoreDetailsProps {
  store: SchoolStore | null
  schoolId: string
  schoolName: string
  onUpdate?: () => void
}

export function SchoolStoreDetails({ store, schoolId, schoolName, onUpdate }: SchoolStoreDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [atomsToAdd, setAtomsToAdd] = useState(0)
  const [realToAdd, setRealToAdd] = useState(0)
  const supabase = getSupabaseClient()

  const handleAddAtoms = async () => {
    if (!store) return
    if (atomsToAdd <= 0) {
      setError("A quantidade de átomos deve ser maior que zero")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase
        .from("school_stores")
        .update({
          atoms_balance: store.atoms_balance + atomsToAdd,
        })
        .eq("id", store.id)
        .select()
        .single()

      if (error) throw error

      setSuccessMessage(`${atomsToAdd} átomos adicionados com sucesso!`)
      setAtomsToAdd(0)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      console.error("Erro ao adicionar átomos:", error)
      setError(error.message || "Erro ao adicionar átomos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddReal = async () => {
    if (!store) return
    if (realToAdd <= 0) {
      setError("O valor em reais deve ser maior que zero")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase
        .from("school_stores")
        .update({
          real_balance: store.real_balance + realToAdd,
        })
        .eq("id", store.id)
        .select()
        .single()

      if (error) throw error

      setSuccessMessage(`R$ ${realToAdd.toFixed(2)} adicionados com sucesso!`)
      setRealToAdd(0)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      console.error("Erro ao adicionar saldo em reais:", error)
      setError(error.message || "Erro ao adicionar saldo em reais")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStore = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase
        .from("school_stores")
        .insert({
          school_id: schoolId,
          name: `Loja ${schoolName}`,
          description: `Loja oficial da escola ${schoolName}`,
          atoms_balance: 0,
          real_balance: 0,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setSuccessMessage("Loja criada com sucesso!")
      if (onUpdate) onUpdate()
    } catch (error: any) {
      console.error("Erro ao criar loja:", error)
      setError(error.message || "Erro ao criar loja")
    } finally {
      setLoading(false)
    }
  }

  if (!store) {
    return (
      <Card>
        <CardHeader className="bg-primary/5 rounded-t-lg border-b">
          <CardTitle className="text-xl text-gray-900">Loja da Escola</CardTitle>
          <CardDescription className="text-gray-600">Esta escola ainda não possui uma loja</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Store className="h-16 w-16 text-gray-400" />
            <p className="text-center text-gray-600">
              A loja permite que a escola gerencie seus átomos e realize transações com alunos e professores.
            </p>
            <Button onClick={handleCreateStore} disabled={loading} variant="gradient" className="mt-4">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Loja"
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4 shadow-md">
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mt-4 bg-green-50 text-green-800 border-green-200 shadow-md">
                <AlertDescription className="text-base">{successMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="bg-primary/5 rounded-t-lg border-b">
        <CardTitle className="text-xl text-gray-900">Loja da Escola</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-xl shadow-md">
              <div className="flex items-center mb-3">
                <Coins className="h-7 w-7 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-blue-800">Saldo em Átomos</h3>
              </div>
              <p className="text-3xl font-bold text-blue-700">{store.atoms_balance}</p>
              <p className="text-sm text-blue-600 mt-2">Moeda virtual para uso na plataforma</p>
            </div>

            <div className="p-6 bg-green-50 rounded-xl shadow-md">
              <div className="flex items-center mb-3">
                <DollarSign className="h-7 w-7 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-green-800">Saldo em Reais</h3>
              </div>
              <p className="text-3xl font-bold text-green-700">R$ {store.real_balance.toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-2">Saldo financeiro disponível</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Adicionar Saldo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="atoms" className="text-base font-medium text-gray-900">
                  Adicionar Átomos
                </Label>
                <div className="flex space-x-3">
                  <Input
                    id="atoms"
                    type="number"
                    min="0"
                    value={atomsToAdd || ""}
                    onChange={(e) => setAtomsToAdd(Number.parseInt(e.target.value) || 0)}
                    disabled={loading}
                    className="h-12 bg-white border-gray-300 text-gray-900"
                  />
                  <Button
                    onClick={handleAddAtoms}
                    disabled={loading || atomsToAdd <= 0}
                    variant="gradient"
                    className="h-12 px-6 font-medium"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5 mr-2" />}
                    {loading ? "" : "Adicionar"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="real" className="text-base font-medium text-gray-900">
                  Adicionar Reais (R$)
                </Label>
                <div className="flex space-x-3">
                  <Input
                    id="real"
                    type="number"
                    min="0"
                    step="0.01"
                    value={realToAdd || ""}
                    onChange={(e) => setRealToAdd(Number.parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    className="h-12 bg-white border-gray-300 text-gray-900"
                  />
                  <Button
                    onClick={handleAddReal}
                    disabled={loading || realToAdd <= 0}
                    variant="gradient"
                    className="h-12 px-6 font-medium"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5 mr-2" />}
                    {loading ? "" : "Adicionar"}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6 shadow-md">
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mt-6 bg-green-50 text-green-800 border-green-200 shadow-md">
                <AlertDescription className="text-base">{successMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

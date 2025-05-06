"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import type { School } from "@/lib/types"
import { createSchoolWithStore, updateSchool } from "@/lib/services/school-service"

interface SchoolFormProps {
  school?: School
  isEditing?: boolean
  onSuccess?: (data: any) => void
}

export function SchoolForm({ school, isEditing = false, onSuccess }: SchoolFormProps) {
  const [name, setName] = useState(school?.name || "")
  const [address, setAddress] = useState(school?.address || "")
  const [phone, setPhone] = useState(school?.phone || "")
  const [email, setEmail] = useState(school?.email || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setCredentials(null)

    try {
      if (!name || !address || !email) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      if (isEditing && school) {
        // Atualizar escola existente
        const updatedSchool = await updateSchool(school.id, {
          name,
          address,
          phone,
          email,
        })

        setSuccessMessage("Escola atualizada com sucesso!")
        if (onSuccess) onSuccess(updatedSchool)
      } else {
        // Validar senha para nova escola
        if (!password) {
          throw new Error("Por favor, defina uma senha para a escola")
        }

        if (password.length < 6) {
          throw new Error("A senha deve ter pelo menos 6 caracteres")
        }

        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem")
        }

        // Criar nova escola com a senha fornecida
        const result = await createSchoolWithStore({
          name,
          address,
          phone,
          email,
          password,
        })

        setSuccessMessage("Escola criada com sucesso!")
        setCredentials(result.credentials)
        if (onSuccess) onSuccess(result)
      }
    } catch (error: any) {
      console.error("Erro ao salvar escola:", error)
      setError(error.message || "Erro ao salvar escola")
    } finally {
      setLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Card>
      <CardHeader className="bg-primary/5 rounded-t-lg border-b">
        <CardTitle className="text-xl text-gray-900">{isEditing ? "Editar Escola" : "Nova Escola"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium text-gray-900">
              Nome da Escola *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da escola"
              disabled={loading}
              required
              className="h-12 bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-medium text-gray-900">
              Endereço *
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Digite o endereço completo"
              disabled={loading}
              required
              className="min-h-[100px] bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-medium text-gray-900">
              Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              disabled={loading}
              className="h-12 bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium text-gray-900">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="escola@exemplo.com"
              disabled={loading || isEditing} // Email não pode ser alterado na edição
              required
              className="h-12 bg-white border-gray-300 text-gray-900"
            />
            {isEditing && <p className="text-xs text-gray-600">O email não pode ser alterado após a criação.</p>}
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-900">
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    disabled={loading}
                    required
                    className="h-12 bg-white border-gray-300 text-gray-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-600">A senha deve ter pelo menos 6 caracteres.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-900">
                  Confirmar Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a senha"
                    disabled={loading}
                    required
                    className="h-12 bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive" className="shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="bg-green-50 text-green-800 border-green-200 shadow-md">
              <AlertDescription className="text-base">{successMessage}</AlertDescription>
            </Alert>
          )}

          {credentials && (
            <Alert className="bg-blue-50 text-blue-800 border-blue-200 shadow-md">
              <div className="space-y-3">
                <AlertDescription className="font-semibold text-base">Credenciais de acesso geradas:</AlertDescription>
                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <p className="mb-2">
                    <strong>Email:</strong> {credentials.email}
                  </p>
                  <p>
                    <strong>Senha:</strong> {credentials.password}
                  </p>
                </div>
                <AlertDescription className="text-sm">
                  Guarde estas informações em um local seguro. A senha não poderá ser recuperada novamente.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between p-6 border-t bg-primary/5">
        <Button variant="outline" onClick={() => router.back()} disabled={loading} className="font-medium h-12 px-6">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          variant="gradient"
          className="font-medium h-12 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isEditing ? "Atualizando..." : "Criando..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {isEditing ? "Atualizar Escola" : "Criar Escola"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

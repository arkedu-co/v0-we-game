"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getAvatares, deleteAvatar } from "@/lib/services/avatar-service"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Avatar } from "@/lib/types"
import { getSessionAndSchoolIdClient } from "@/lib/session-utils-client"

export default function AvataresList() {
  const [avatares, setAvatares] = useState<Avatar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAvatares = async () => {
      try {
        setLoading(true)

        // Usar a função getSessionAndSchoolId para obter o ID da escola
        const { schoolId } = await getSessionAndSchoolIdClient()

        if (!schoolId) {
          throw new Error("ID da escola não disponível")
        }

        console.log("Buscando avatares para a escola:", schoolId)

        // Buscar avatares da escola
        const listaAvatares = await getAvatares(schoolId)
        console.log(`Encontrados ${listaAvatares.length} avatares`)
        setAvatares(listaAvatares)
      } catch (err: any) {
        console.error("Erro ao buscar avatares:", err)
        setError(err.message || "Não foi possível carregar os avatares.")
      } finally {
        setLoading(false)
      }
    }

    fetchAvatares()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este avatar?")) return

    try {
      await deleteAvatar(id)
      setAvatares(avatares.filter((avatar) => avatar.id !== id))
    } catch (err: any) {
      console.error("Erro ao excluir avatar:", err)
      setError(err.message || "Não foi possível excluir o avatar.")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (avatares.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum avatar cadastrado</p>
            <Link href="/escola/avatares/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Avatar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {avatares.map((avatar) => (
            <div key={avatar.id} className="flex flex-col items-center">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border mb-2">
                <Image
                  src={avatar.image_url || "/placeholder.svg"}
                  alt={avatar.name || "Avatar"}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-medium text-sm text-center mb-1">{avatar.name}</h3>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/escola/avatares/${avatar.id}/editar`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(avatar.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

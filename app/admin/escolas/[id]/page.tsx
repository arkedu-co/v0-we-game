"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SchoolForm } from "@/components/admin/school-form"
import { SchoolStoreDetails } from "@/components/admin/school-store-details"
import { adminSidebarContent } from "@/components/admin/sidebar-content"
import { AdminSidebarIcons } from "@/components/admin/sidebar-icons"
import { getSchoolWithStore } from "@/lib/services/school-service"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { School, SchoolStore } from "@/lib/types"

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const [school, setSchool] = useState<(School & { store: SchoolStore | null }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isNewSchool = params.id === "nova"

  const fetchSchool = async () => {
    // Se for a página de nova escola, não precisamos buscar dados
    if (isNewSchool) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getSchoolWithStore(params.id)
      setSchool(data)
    } catch (error: any) {
      console.error("Erro ao buscar escola:", error)
      setError(error.message || "Erro ao carregar dados da escola")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchool()
  }, [params.id, isNewSchool])

  // Renderização para a página de nova escola
  if (isNewSchool) {
    return (
      <DashboardLayout
        userType="admin"
        sidebarContent={adminSidebarContent({ activeItem: "escolas" })}
        sidebarIcons={<AdminSidebarIcons />}
      >
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Nova Escola</h1>
          <p className="text-gray-600">Preencha os dados abaixo para cadastrar uma nova escola no sistema.</p>
          <SchoolForm />
        </div>
      </DashboardLayout>
    )
  }

  // Renderização para a página de edição de escola existente
  return (
    <DashboardLayout
      userType="admin"
      sidebarContent={adminSidebarContent({ activeItem: "escolas" })}
      sidebarIcons={<AdminSidebarIcons />}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {loading ? "Carregando..." : school ? `Escola: ${school.name}` : "Escola não encontrada"}
        </h1>
        <p className="text-gray-600">Gerencie os dados da escola e sua loja.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        ) : school ? (
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-white shadow-md p-1 rounded-lg">
              <TabsTrigger
                value="details"
                className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
              >
                Detalhes da Escola
              </TabsTrigger>
              <TabsTrigger
                value="store"
                className="text-base py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-800 data-[state=active]:text-white"
              >
                Loja da Escola
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <SchoolForm school={school} isEditing={true} onSuccess={fetchSchool} />
            </TabsContent>
            <TabsContent value="store" className="mt-6">
              <SchoolStoreDetails
                store={school.store}
                schoolId={school.id}
                schoolName={school.name}
                onUpdate={fetchSchool}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Alert variant="destructive" className="shadow-card">
            <AlertDescription className="text-base">Escola não encontrada</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}

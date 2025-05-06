"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient, checkSupabaseConnection } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { School, Users, User, Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { adminSidebarContent } from "@/components/admin/sidebar-content"
import { AdminSidebarIcons } from "@/components/admin/sidebar-icons"

export default function AdminDashboardPage() {
  const [schoolCount, setSchoolCount] = useState(0)
  const [teacherCount, setTeacherCount] = useState(0)
  const [studentCount, setStudentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    setConnectionError(false)

    try {
      // Verificar conexão com o Supabase
      const isConnected = await checkSupabaseConnection()
      if (!isConnected) {
        setConnectionError(true)
        setError("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.")
        setLoading(false)
        return
      }

      // Verificar sessão
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Erro ao verificar sessão:", sessionError)
        throw new Error("Erro ao verificar sessão de usuário")
      }

      if (!sessionData.session) {
        console.log("Nenhuma sessão encontrada no dashboard")
        router.push("/admin/login")
        return
      }

      console.log("Sessão encontrada, verificando tipo de usuário")

      // Verificar se o usuário é um administrador
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", sessionData.session.user.id)
          .single()

        if (profileError) {
          console.error("Erro ao verificar perfil:", profileError)
          throw new Error("Erro ao verificar perfil de usuário")
        }

        if (!profile || profile.user_type !== "admin") {
          console.log("Usuário não é administrador")
          await supabase.auth.signOut()
          router.push("/admin/login")
          return
        }

        console.log("Usuário confirmado como administrador, buscando dados")
      } catch (error) {
        console.error("Erro ao processar perfil:", error)
        throw error
      }

      // Buscar contagens
      try {
        // Contar escolas
        const { count: schoolsCount, error: schoolsError } = await supabase
          .from("schools")
          .select("*", { count: "exact", head: true })

        if (schoolsError) throw schoolsError
        setSchoolCount(schoolsCount || 0)

        // Contar professores
        const { count: teachersCount, error: teachersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "professor")

        if (teachersError) throw teachersError
        setTeacherCount(teachersCount || 0)

        // Contar alunos
        const { count: studentsCount, error: studentsError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "aluno")

        if (studentsError) throw studentsError
        setStudentCount(studentsCount || 0)
      } catch (error: any) {
        console.error("Erro ao buscar contagens:", error)
        throw new Error("Erro ao carregar dados do dashboard")
      }
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error)
      setError(error.message || "Erro ao carregar dados")

      // Verificar se é um erro de conexão
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setConnectionError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("Dashboard do administrador montado, buscando dados")
    fetchData()
  }, [])

  const handleRetry = () => {
    fetchData()
  }

  return (
    <DashboardLayout
      userType="admin"
      sidebarContent={adminSidebarContent({ activeItem: "dashboard" })}
      sidebarIcons={<AdminSidebarIcons />}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo ao painel administrativo do sistema escolar.</p>
        </div>

        {connectionError ? (
          <div className="p-6">
            <Alert variant="destructive" className="mb-6 shadow-card">
              <AlertDescription className="text-base">
                Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleRetry}
              variant="gradient"
              className="w-full sm:w-auto py-6 text-base font-medium shadow-card"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Tentar novamente
            </Button>
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert variant="destructive" className="mb-6 shadow-card">
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
            <Button
              onClick={handleRetry}
              variant="gradient"
              className="w-full sm:w-auto py-6 text-base font-medium shadow-card"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center text-primary">
                  <School className="h-6 w-6 mr-3 text-primary" />
                  Escolas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center space-x-3 py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-lg text-gray-900">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900">{schoolCount}</div>
                    <p className="text-sm text-gray-600 mt-2">Escolas cadastradas no sistema</p>
                    <Button
                      variant="gradient"
                      className="mt-4 w-full font-medium"
                      onClick={() => router.push("/admin/escolas")}
                    >
                      Ver todas
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center text-primary">
                  <Users className="h-6 w-6 mr-3 text-primary" />
                  Professores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center space-x-3 py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-lg text-gray-900">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900">{teacherCount}</div>
                    <p className="text-sm text-gray-600 mt-2">Professores cadastrados no sistema</p>
                    <Button
                      variant="gradient"
                      className="mt-4 w-full font-medium"
                      onClick={() => router.push("/admin/professores")}
                    >
                      Ver todos
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center text-primary">
                  <User className="h-6 w-6 mr-3 text-primary" />
                  Alunos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex items-center space-x-3 py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-lg text-gray-900">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900">{studentCount}</div>
                    <p className="text-sm text-gray-600 mt-2">Alunos cadastrados no sistema</p>
                    <Button
                      variant="gradient"
                      className="mt-4 w-full font-medium"
                      onClick={() => router.push("/admin/alunos")}
                    >
                      Ver todos
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

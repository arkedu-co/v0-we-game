"use client"

import * as React from "react"
import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { UserType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  User,
  Loader2,
  Search,
  AlertCircle,
  Home,
  BookOpen,
  Users,
  BookOpenCheck,
  LinkIcon,
  Calendar,
  GraduationCap,
  UserSquare2,
  Star,
  Award,
  Trophy,
  ShoppingBag,
  Package,
  ClipboardList,
  Truck,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Bell,
  HelpCircle,
  ImageIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SidebarItem {
  title: string
  href: string
  icon: ReactNode
}

interface DashboardLayoutProps {
  children: ReactNode
  userType: UserType
  sidebarContent: SidebarItem[]
  sidebarIcons?: ReactNode
}

export function DashboardLayout({ children, userType, sidebarContent = [], sidebarIcons }: DashboardLayoutProps) {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("dashboard")
  const [schoolName, setSchoolName] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Sincronizar a categoria ativa do localStorage
    const handleStorageChange = () => {
      const categoriaArmazenada = localStorage.getItem("escolaCategoriaAtiva")
      if (categoriaArmazenada) {
        setCategoriaAtiva(categoriaArmazenada)
      }
    }

    // Verificar ao montar o componente
    handleStorageChange()

    // Adicionar listener para mudanças no localStorage
    window.addEventListener("storage", handleStorageChange)

    // Também podemos verificar periodicamente
    const interval = setInterval(handleStorageChange, 500)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          console.log("Running on server, skipping auth check")
          setLoading(false)
          return
        }

        // Get user session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("Erro ao verificar sessão. Por favor, tente novamente.")
          setLoading(false)
          return
        }

        if (!session) {
          console.log("No session found")
          setError("Sessão não encontrada. Por favor, faça login novamente.")
          setLoading(false)
          return
        }

        setIsAuthenticated(true)
        const user = session.user
        console.log("User authenticated:", user.id)

        // Get user profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profileError) {
            console.error("Profile error:", profileError)
            setError("Erro ao buscar perfil. Por favor, tente novamente.")
            setLoading(false)
            return
          }

          // Check if user type matches
          if (userType && profileData.user_type !== userType) {
            console.log(`Incorrect user type: ${profileData.user_type}, expected: ${userType}`)
            setError(`Você está tentando acessar uma área restrita a ${getUserTypeLabel(userType)}.`)
            setLoading(false)
            return
          }

          // Set user data
          setUserName(profileData.full_name || "Usuário")
          setUserEmail(profileData.email || "")
          setAvatarUrl(profileData.avatar_url || "")

          // If user is a school, get school data
          if (userType === "escola") {
            try {
              // Primeiro, tente buscar pelo ID do diretor ou proprietário
              const { data: schoolData, error: schoolError } = await supabase
                .from("schools")
                .select("name")
                .or(`director_id.eq.${user.id},owner_id.eq.${user.id}`)
                .single()

              if (!schoolError && schoolData) {
                console.log("Found school by director/owner:", schoolData.name)
                setSchoolName(schoolData.name)
              } else {
                // Se não encontrar, tente buscar diretamente pelo ID da escola
                const { data: directSchool, error: directSchoolError } = await supabase
                  .from("schools")
                  .select("name")
                  .eq("id", user.id)
                  .single()

                if (!directSchoolError && directSchool) {
                  console.log("Found school by direct ID:", directSchool.name)
                  setSchoolName(directSchool.name)
                } else {
                  console.log("Could not find school name")
                }
              }
            } catch (schoolError) {
              console.error("Error fetching school data:", schoolError)
              // Non-critical error, continue
            }
          }
        } catch (profileError) {
          console.error("Profile error:", profileError)
          setError("Erro ao buscar dados do perfil. Por favor, tente novamente.")
          setLoading(false)
          return
        }
      } catch (error: any) {
        console.error("User data fetch error:", error)
        setError(error.message || "Erro ao carregar dados do usuário")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, supabase, userType])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      setError("Erro ao fazer logout. Tente novamente.")
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-primary">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-red-500 mr-4" />
            <h2 className="text-2xl font-bold text-gray-800">Erro de Autenticação</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center">
            <Link href={`/${userType}/login`}>
              <Button className="bg-purple-600 hover:bg-purple-700">Fazer Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen font-poppins bg-gradient-to-b from-gray-50 to-white">
      {/* Sidebar de ícones - agora com degradê roxo */}
      <div className="fixed left-0 top-0 flex flex-col bg-gradient-to-b from-purple-600 to-purple-900 w-16 min-w-16 h-full z-30 transition-all duration-300">
        <div className="flex items-center justify-center h-16 border-b border-purple-700">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="bg-purple-800 text-white">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 py-4 flex flex-col items-center text-white">
          {typeof sidebarIcons === "function" ? React.createElement(sidebarIcons) : sidebarIcons}
        </div>
        <div className="p-4 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-purple-700 rounded-full"
          >
            {sidebarCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            )}
          </Button>
        </div>
        <div className="p-4 border-t border-purple-700 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-white hover:bg-purple-700 rounded-full"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar de menus - agora fixo */}
      <div
        className={cn(
          "fixed left-16 top-0 bg-white border-r border-gray-200 h-full overflow-y-auto transition-all duration-300 z-20",
          sidebarCollapsed ? "w-0 opacity-0" : "w-64 opacity-100",
        )}
      >
        <div className="h-16 border-b border-gray-200 flex items-center px-6">
          <h2 className="text-lg font-semibold text-primary-dark">
            {userType === "escola" ? schoolName || "Escola" : getUserTypeLabel(userType)}
          </h2>
        </div>
        <div className="p-4 text-gray-700">
          {/* Aqui vamos renderizar o conteúdo do SidebarContent em vez de usar o sidebarContent diretamente */}
          {userType === "escola" && (
            <div className="escola-sidebar-content">
              {/* Importamos o SidebarContent diretamente aqui */}
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {categoriaAtiva === "dashboard"
                      ? "Dashboard"
                      : categoriaAtiva === "academico"
                        ? "Acadêmico"
                        : categoriaAtiva === "pessoas"
                          ? "Pessoas"
                          : categoriaAtiva === "gamificacao"
                            ? "Gamificação"
                            : categoriaAtiva === "loja"
                              ? "Loja"
                              : categoriaAtiva === "relatorios"
                                ? "Relatórios"
                                : categoriaAtiva === "configuracoes"
                                  ? "Configurações"
                                  : "Menu"}
                  </h2>
                </div>

                <div className="flex-1 overflow-auto py-2">
                  <nav className="grid gap-1 px-2">
                    {/* Dashboard */}
                    {categoriaAtiva === "dashboard" && (
                      <Link
                        href="/escola/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Home className="h-5 w-5 text-gray-500" />
                        <span>Dashboard</span>
                      </Link>
                    )}

                    {/* Acadêmico */}
                    {categoriaAtiva === "academico" && (
                      <>
                        <Link
                          href="/escola/cursos"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <BookOpen className="h-5 w-5 text-gray-500" />
                          <span>Cursos</span>
                        </Link>
                        <Link
                          href="/escola/turmas"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Users className="h-5 w-5 text-gray-500" />
                          <span>Turmas</span>
                        </Link>
                        <Link
                          href="/escola/disciplinas"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <BookOpenCheck className="h-5 w-5 text-gray-500" />
                          <span>Disciplinas</span>
                        </Link>
                        <Link
                          href="/escola/vinculos"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <LinkIcon className="h-5 w-5 text-gray-500" />
                          <span>Vínculos</span>
                        </Link>
                        <Link
                          href="/escola/calendario"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span>Calendário Acadêmico</span>
                        </Link>
                      </>
                    )}

                    {/* Pessoas */}
                    {categoriaAtiva === "pessoas" && (
                      <>
                        <Link
                          href="/escola/alunos"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <GraduationCap className="h-5 w-5 text-gray-500" />
                          <span>Alunos</span>
                        </Link>
                        <Link
                          href="/escola/professores"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <UserSquare2 className="h-5 w-5 text-gray-500" />
                          <span>Professores</span>
                        </Link>
                        <Link
                          href="/escola/responsaveis"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Users className="h-5 w-5 text-gray-500" />
                          <span>Responsáveis</span>
                        </Link>
                      </>
                    )}

                    {/* Gamificação */}
                    {categoriaAtiva === "gamificacao" && (
                      <>
                        <Link
                          href="/escola/atitudes"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Star className="h-5 w-5 text-gray-500" />
                          <span>Atitudes</span>
                        </Link>
                        <Link
                          href="/escola/xp/regras"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Award className="h-5 w-5 text-gray-500" />
                          <span>Regras de XP</span>
                        </Link>
                        <Link
                          href="/escola/xp/niveis"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Trophy className="h-5 w-5 text-gray-500" />
                          <span>Níveis de XP</span>
                        </Link>
                        <Link
                          href="/escola/avatares"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <ImageIcon className="h-5 w-5 text-gray-500" />
                          <span>Avatares</span>
                        </Link>
                      </>
                    )}

                    {/* Loja */}
                    {categoriaAtiva === "loja" && (
                      <>
                        <Link
                          href="/escola/loja"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <ShoppingBag className="h-5 w-5 text-gray-500" />
                          <span>Visão Geral</span>
                        </Link>
                        <Link
                          href="/escola/loja/produtos"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Package className="h-5 w-5 text-gray-500" />
                          <span>Produtos</span>
                        </Link>
                        <Link
                          href="/escola/loja/pedidos"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <ClipboardList className="h-5 w-5 text-gray-500" />
                          <span>Pedidos</span>
                        </Link>
                        <Link
                          href="/escola/loja/entregas"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Truck className="h-5 w-5 text-gray-500" />
                          <span>Entregas</span>
                        </Link>
                        <Link
                          href="/escola/loja/estoque"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Package className="h-5 w-5 text-gray-500" />
                          <span>Estoque</span>
                        </Link>
                        <Link
                          href="/escola/loja/financeiro"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <BarChart3 className="h-5 w-5 text-gray-500" />
                          <span>Financeiro</span>
                        </Link>
                      </>
                    )}

                    {/* Relatórios */}
                    {categoriaAtiva === "relatorios" && (
                      <>
                        <Link
                          href="/escola/relatorios/desempenho"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <PieChart className="h-5 w-5 text-gray-500" />
                          <span>Desempenho Acadêmico</span>
                        </Link>
                        <Link
                          href="/escola/relatorios/frequencia"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span>Frequência</span>
                        </Link>
                        <Link
                          href="/escola/relatorios/gamificacao"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Award className="h-5 w-5 text-gray-500" />
                          <span>Gamificação</span>
                        </Link>
                        <Link
                          href="/escola/relatorios/financeiro"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <BarChart3 className="h-5 w-5 text-gray-500" />
                          <span>Financeiro</span>
                        </Link>
                      </>
                    )}

                    {/* Configurações */}
                    {categoriaAtiva === "configuracoes" && (
                      <>
                        <Link
                          href="/escola/configuracoes"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Settings className="h-5 w-5 text-gray-500" />
                          <span>Configurações</span>
                        </Link>
                        <Link
                          href="/escola/notificacoes"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Bell className="h-5 w-5 text-gray-500" />
                          <span>Notificações</span>
                        </Link>
                        <Link
                          href="/escola/ajuda"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                        >
                          <HelpCircle className="h-5 w-5 text-gray-500" />
                          <span>Ajuda</span>
                        </Link>
                      </>
                    )}
                  </nav>
                </div>

                {/* Botão de sair no final do menu */}
                <div className="p-2 border-t border-gray-200">
                  <a
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 text-gray-500" />
                    <span>Sair</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Para outros tipos de usuário, continuamos usando o sidebarContent */}
          {userType !== "escola" && (
            <nav className="space-y-1">
              {Array.isArray(sidebarContent) &&
                sidebarContent.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-gray-900 hover:bg-gray-100"
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                ))}
            </nav>
          )}
        </div>
      </div>

      {/* Conteúdo principal - com margem à esquerda para compensar o sidebar fixo */}
      <div className={cn("flex-1 overflow-auto flex flex-col", sidebarCollapsed ? "ml-16" : "ml-80")}>
        {/* Barra superior estilo vidro embaçado - agora fixa */}
        <div
          className="fixed top-0 right-0 h-16 border-b border-gray-200 bg-white bg-opacity-60 backdrop-blur-lg shadow-lg flex items-center justify-between px-6 z-10 transition-all duration-300"
          style={{
            left: sidebarCollapsed ? "4rem" : "20rem",
            width: "calc(100% - " + (sidebarCollapsed ? "4rem" : "20rem") + ")",
          }}
        >
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                className="pl-10 h-10 bg-transparent border-gray-300 text-gray-900 rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={userName} />
                <AvatarFallback className="bg-primary text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900 hidden md:inline-block">{userName}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo principal - com padding-top para compensar a barra superior fixa */}
        <div className="pt-20 p-6 flex-1">
          <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white text-gray-900">{children}</main>
        </div>
      </div>
    </div>
  )
}

function getUserTypeLabel(userType: UserType): string {
  const labels: Record<UserType, string> = {
    admin: "Administrador",
    escola: "Escola",
    professor: "Professor",
    responsavel: "Responsável",
    aluno: "Aluno",
  }

  return labels[userType]
}

// Also export as default for compatibility with both import styles
export default DashboardLayout

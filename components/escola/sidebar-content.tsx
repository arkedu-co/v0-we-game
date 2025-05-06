"use client"

import { useEffect, useState } from "react"
import {
  Home,
  GraduationCap,
  Users,
  BookOpen,
  ShoppingBag,
  Package,
  ClipboardList,
  BarChart3,
  Truck,
  Settings,
  LogOut,
  UserSquare2,
  BookOpenCheck,
  LinkIcon,
  Award,
  Star,
  Trophy,
  ChevronRight,
  PieChart,
  FileText,
  Calendar,
  Bell,
  HelpCircle,
  ImageIcon,
} from "lucide-react"
import { categoriasPrincipais } from "./sidebar-icons"

// Definição das subcategorias organizadas por categoria principal
const subcategorias = {
  dashboard: [
    {
      title: "Dashboard",
      href: "/escola/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
  ],
  academico: [
    {
      title: "Cursos",
      href: "/escola/cursos",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Turmas",
      href: "/escola/turmas",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Disciplinas",
      href: "/escola/disciplinas",
      icon: <BookOpenCheck className="h-5 w-5" />,
    },
    {
      title: "Vínculos",
      href: "/escola/vinculos",
      icon: <LinkIcon className="h-5 w-5" />,
    },
    {
      title: "Calendário Acadêmico",
      href: "/escola/calendario",
      icon: <Calendar className="h-5 w-5" />,
    },
  ],
  pessoas: [
    {
      title: "Alunos",
      href: "/escola/alunos",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      title: "Professores",
      href: "/escola/professores",
      icon: <UserSquare2 className="h-5 w-5" />,
    },
    {
      title: "Responsáveis",
      href: "/escola/responsaveis",
      icon: <Users className="h-5 w-5" />,
    },
  ],
  gamificacao: [
    {
      title: "Atitudes",
      href: "/escola/atitudes",
      icon: <Star className="h-5 w-5" />,
    },
    {
      title: "Regras de XP",
      href: "/escola/xp/regras",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "Níveis de XP",
      href: "/escola/xp/niveis",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      title: "Avatares",
      href: "/escola/avatares",
      icon: <ImageIcon className="h-5 w-5" />,
    },
    {
      title: "Economia",
      href: "/escola/economia",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ],
  loja: [
    {
      title: "Visão Geral",
      href: "/escola/loja",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: "Produtos",
      href: "/escola/loja/produtos",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Pedidos",
      href: "/escola/loja/pedidos",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Entregas",
      href: "/escola/loja/entregas",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      title: "Estoque",
      href: "/escola/loja/estoque",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Financeiro",
      href: "/escola/loja/financeiro",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ],
  relatorios: [
    {
      title: "Desempenho Acadêmico",
      href: "/escola/relatorios/desempenho",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      title: "Frequência",
      href: "/escola/relatorios/frequencia",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Gamificação",
      href: "/escola/relatorios/gamificacao",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "Financeiro",
      href: "/escola/relatorios/financeiro",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ],
  configuracoes: [
    {
      title: "Configurações",
      href: "/escola/configuracoes",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Notificações",
      href: "/escola/notificacoes",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Ajuda",
      href: "/escola/ajuda",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ],
}

// Lista completa para compatibilidade com código existente
export const escolaSidebarContent = [
  ...subcategorias.dashboard,
  ...subcategorias.academico,
  ...subcategorias.pessoas,
  ...subcategorias.gamificacao,
  ...subcategorias.loja,
  ...subcategorias.relatorios,
  ...subcategorias.configuracoes,
  {
    title: "Sair",
    href: "/",
    icon: <LogOut className="h-5 w-5" />,
  },
]

// Componente SidebarContent
export function SidebarContent({ isMobile = false, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("dashboard")

  // Recuperar a categoria ativa do localStorage ao carregar o componente
  useEffect(() => {
    const categoriaArmazenada = localStorage.getItem("escolaCategoriaAtiva")
    if (categoriaArmazenada) {
      setCategoriaAtiva(categoriaArmazenada)
    }
  }, [])

  // Encontrar a categoria atual para exibir o título
  const categoriaAtual = categoriasPrincipais.find((cat) => cat.id === categoriaAtiva)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{categoriaAtual?.label || "Menu"}</h2>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {/* Exibir as subcategorias da categoria ativa */}
          {subcategorias[categoriaAtiva as keyof typeof subcategorias]?.map((item) => (
            <div key={item.href} onClick={isMobile ? onClose : undefined}>
              <a
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
              >
                <span className="text-gray-500">{item.icon}</span>
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
              </a>
            </div>
          ))}
        </nav>
      </div>

      {/* Botão de sair no final do menu */}
      <div className="p-2 border-t border-gray-200">
        <a
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
          onClick={isMobile ? onClose : undefined}
        >
          <LogOut className="h-5 w-5 text-gray-500" />
          <span>Sair</span>
        </a>
      </div>
    </div>
  )
}

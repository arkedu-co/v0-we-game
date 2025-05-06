import { Home, Users, BookOpen, Settings, Award } from "lucide-react"

export const professorSidebarContent = [
  {
    title: "Dashboard",
    href: "/professor/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Minhas Turmas",
    href: "/professor/turmas",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Notas e Atividades",
    href: "/professor/notas",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "XP",
    href: "/professor/xp",
    icon: <Award className="h-5 w-5" />,
  },
  {
    title: "Configurações",
    href: "/professor/configuracoes",
    icon: <Settings className="h-5 w-5" />,
  },
]

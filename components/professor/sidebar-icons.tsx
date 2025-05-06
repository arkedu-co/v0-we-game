import { Home, Users, BookOpen, Settings, LogOut, Award } from "lucide-react"
import Link from "next/link"

// Componente para renderizar os ícones da sidebar
export function SidebarIcons() {
  return (
    <>
      <Link href="/professor/dashboard" className="p-2 rounded-full hover:bg-purple-700">
        <Home className="h-6 w-6" />
      </Link>
      <Link href="/professor/turmas" className="p-2 rounded-full hover:bg-purple-700">
        <Users className="h-6 w-6" />
      </Link>
      <Link href="/professor/notas" className="p-2 rounded-full hover:bg-purple-700">
        <BookOpen className="h-6 w-6" />
      </Link>
      <Link href="/professor/atitudes" className="p-2 rounded-full hover:bg-purple-700">
        <Award className="h-6 w-6" />
      </Link>
      <Link href="/professor/configuracoes" className="p-2 rounded-full hover:bg-purple-700">
        <Settings className="h-6 w-6" />
      </Link>
      <div className="flex-1"></div>
      <Link href="/" className="p-2 rounded-full hover:bg-purple-700">
        <LogOut className="h-6 w-6" />
      </Link>
    </>
  )
}

// Exportar o componente SidebarIcons como professorSidebarIcons também
export const professorSidebarIcons = SidebarIcons

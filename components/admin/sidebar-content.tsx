import { School, Users, User, BookOpen, Calendar, LayoutDashboard, Settings } from "lucide-react"
import Link from "next/link"

interface AdminSidebarContentProps {
  activeItem?: "dashboard" | "escolas" | "professores" | "alunos" | "disciplinas" | "anos-letivos"
}

export function adminSidebarContent({ activeItem = "dashboard" }: AdminSidebarContentProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 mb-2">Principal</h3>
        <Link href="/admin/dashboard" passHref>
          <div
            className={`flex items-center px-3 py-2 rounded-md ${activeItem === "dashboard" ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </div>
        </Link>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 mb-2">Gerenciamento</h3>
        <Link href="/admin/escolas" passHref>
          <div
            className={`flex items-center px-3 py-2 rounded-md ${activeItem === "escolas" ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <School className="h-5 w-5 mr-3" />
            <span>Escolas</span>
          </div>
        </Link>
        <Link href="/admin/professores" passHref>
          <div
            className={`flex items-center px-3 py-2 rounded-md ${activeItem === "professores" ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Users className="h-5 w-5 mr-3" />
            <span>Professores</span>
          </div>
        </Link>
        <Link href="/admin/alunos" passHref>
          <div
            className={`flex items-center px-3 py-2 rounded-md ${activeItem === "alunos" ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <User className="h-5 w-5 mr-3" />
            <span>Alunos</span>
          </div>
        </Link>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 mb-2">Acadêmico</h3>
        <Link href="/admin/disciplinas" passHref>
          <div
            className={`flex items-center px-3 py-2 rounded-md ${activeItem === "disciplinas" ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <BookOpen className="h-5 w-5 mr-3" />
            <span>Disciplinas</span>
          </div>
        </Link>
        <Link href="/admin/anos-letivos" passHref>
          <div
            className={`flex items-center px-3 py-2 rounded-md ${activeItem === "anos-letivos" ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <Calendar className="h-5 w-5 mr-3" />
            <span>Anos Letivos</span>
          </div>
        </Link>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 mb-2">Sistema</h3>
        <Link href="/admin/configuracoes" passHref>
          <div className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
            <Settings className="h-5 w-5 mr-3" />
            <span>Configurações</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

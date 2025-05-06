import type React from "react"
import Link from "next/link"
import { Users, School, GraduationCap, UserRound, BookOpen, Settings, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-white">
      {/* Header com logo e botão de configuração */}
      <header className="w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <School className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema Escolar</h1>
        </div>
        <Link href="/setup" passHref>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-primary">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuração</span>
          </Button>
        </Link>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-7xl mx-auto w-full">
        {/* Seção de boas-vindas */}
        <section className="text-center mb-16 max-w-3xl">
          <div className="inline-block mb-6 bg-primary/10 px-4 py-2 rounded-full">
            <span className="text-primary font-medium">Plataforma Educacional Integrada</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Bem-vindo ao <span className="text-gradient">Sistema Escolar</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Uma plataforma completa para gestão escolar, conectando administradores, escolas, professores, responsáveis
            e alunos.
          </p>
        </section>

        {/* Cards de perfil */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          <ProfileCard
            title="Administrador"
            description="Gerencie todo o sistema escolar, escolas, usuários e configurações"
            href="/admin/login"
            icon={<Users className="h-6 w-6" />}
            color="bg-blue-50"
            iconColor="text-blue-600"
          />

          <ProfileCard
            title="Escola"
            description="Administre sua instituição de ensino, cursos, turmas e professores"
            href="/escola/login"
            icon={<School className="h-6 w-6" />}
            color="bg-purple-50"
            iconColor="text-primary"
            featured={true}
          />

          <ProfileCard
            title="Professor"
            description="Gerencie turmas, notas, frequência e atividades dos alunos"
            href="/professor/login"
            icon={<GraduationCap className="h-6 w-6" />}
            color="bg-green-50"
            iconColor="text-green-600"
          />

          <ProfileCard
            title="Responsável"
            description="Acompanhe o desempenho, notas e frequência dos alunos"
            href="/responsavel/login"
            icon={<UserRound className="h-6 w-6" />}
            color="bg-amber-50"
            iconColor="text-amber-600"
          />

          <ProfileCard
            title="Aluno"
            description="Acesse suas notas, atividades, materiais e informações escolares"
            href="/aluno/login"
            icon={<BookOpen className="h-6 w-6" />}
            color="bg-rose-50"
            iconColor="text-rose-600"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center">
        <div className="max-w-5xl mx-auto border-t border-gray-200 pt-8">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Sistema Escolar Integrado. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

function ProfileCard({
  title,
  description,
  href,
  icon,
  color = "bg-gray-50",
  iconColor = "text-gray-600",
  featured = false,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color?: string
  iconColor?: string
  featured?: boolean
}) {
  return (
    <Link href={href} className="group">
      <div
        className={`
        relative rounded-xl p-6 transition-all duration-300
        ${color} border border-transparent
        ${
          featured
            ? "ring-2 ring-primary shadow-[0_15px_30px_-10px_rgba(0,0,0,0.25)]"
            : "hover:border-gray-200 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)]"
        }
        flex flex-col h-full transform transition-transform duration-300 hover:-translate-y-1
      `}
      >
        {/* Ícone */}
        <div
          className={`
          ${iconColor} ${featured ? "bg-white" : color}
          w-14 h-14 rounded-xl flex items-center justify-center
          shadow-md mb-5
        `}
        >
          {icon}
        </div>

        {/* Conteúdo */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-5 flex-grow">{description}</p>

        {/* Botão de acesso */}
        <div
          className={`
          mt-2 flex items-center text-sm font-medium
          ${featured ? "text-primary" : "text-gray-700 group-hover:text-primary"}
          transition-colors duration-300
        `}
        >
          Acessar
          <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
        </div>

        {/* Indicador de destaque */}
        {featured && (
          <div className="absolute top-3 right-3 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
            Principal
          </div>
        )}
      </div>
    </Link>
  )
}

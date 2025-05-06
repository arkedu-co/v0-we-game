"use client"

import { useState, useEffect } from "react"
import { Home, Users, BookOpen, ShoppingBag, Settings, LogOut, Award, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

// Definição das categorias principais
export const categoriasPrincipais = [
  {
    id: "dashboard",
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "/escola/dashboard",
  },
  {
    id: "academico",
    icon: <BookOpen className="h-5 w-5" />,
    label: "Acadêmico",
    href: "#",
  },
  {
    id: "pessoas",
    icon: <Users className="h-5 w-5" />,
    label: "Pessoas",
    href: "#",
  },
  {
    id: "gamificacao",
    icon: <Award className="h-5 w-5" />,
    label: "Gamificação",
    href: "#",
  },
  {
    id: "loja",
    icon: <ShoppingBag className="h-5 w-5" />,
    label: "Loja",
    href: "#",
  },
  {
    id: "relatorios",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Relatórios",
    href: "#",
  },
  {
    id: "configuracoes",
    icon: <Settings className="h-5 w-5" />,
    label: "Configurações",
    href: "/escola/configuracoes",
  },
]

export function EscolaSidebarIcons() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("dashboard")

  // Função para atualizar a categoria ativa e armazenar no localStorage
  const handleCategoriaClick = (categoriaId: string) => {
    setCategoriaAtiva(categoriaId)
    localStorage.setItem("escolaCategoriaAtiva", categoriaId)

    // Disparar um evento para notificar outros componentes sobre a mudança
    const event = new Event("categoriaChanged")
    window.dispatchEvent(event)
  }

  // Recuperar a categoria ativa do localStorage ao carregar o componente
  useEffect(() => {
    const categoriaArmazenada = localStorage.getItem("escolaCategoriaAtiva")
    if (categoriaArmazenada) {
      setCategoriaAtiva(categoriaArmazenada)
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {categoriasPrincipais.map((categoria) => (
            <a
              key={categoria.id}
              href={categoria.href}
              className={cn(
                "flex justify-center items-center h-10 w-10 rounded-lg text-white transition-all duration-200",
                categoriaAtiva === categoria.id ? "bg-white bg-opacity-20 shadow-inner" : "hover:bg-purple-700",
              )}
              onClick={(e) => {
                if (categoria.href === "#") {
                  e.preventDefault()
                }
                handleCategoriaClick(categoria.id)
              }}
              title={categoria.label}
            >
              {categoria.icon}
            </a>
          ))}

          <a
            href="/"
            className="flex justify-center items-center h-10 w-10 rounded-lg text-white hover:bg-purple-700 mt-4"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </div>
  )
}

// Alias para compatibilidade
export const escolaSidebarIcons = EscolaSidebarIcons

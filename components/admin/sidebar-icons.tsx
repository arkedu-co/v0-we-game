"use client"

import type React from "react"

import { LayoutDashboard, School, Users, BookOpen, Calendar, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarIconProps {
  href: string
  icon: React.ReactNode
  label: string
}

function SidebarIcon({ href, icon, label }: SidebarIconProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-lg mb-4 text-white relative group",
        isActive ? "bg-white text-purple-700" : "hover:bg-purple-700",
      )}
      title={label}
    >
      {icon}
      <span className="absolute left-full ml-2 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </Link>
  )
}

export function AdminSidebarIcons() {
  return (
    <>
      <SidebarIcon href="/admin/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
      <SidebarIcon href="/admin/escolas" icon={<School className="h-5 w-5" />} label="Escolas" />
      <SidebarIcon href="/admin/professores" icon={<Users className="h-5 w-5" />} label="Professores" />
      <SidebarIcon href="/admin/alunos" icon={<User className="h-5 w-5" />} label="Alunos" />
      <SidebarIcon href="/admin/disciplinas" icon={<BookOpen className="h-5 w-5" />} label="Disciplinas" />
      <SidebarIcon href="/admin/anos-letivos" icon={<Calendar className="h-5 w-5" />} label="Anos Letivos" />
      <SidebarIcon href="/admin/configuracoes" icon={<Settings className="h-5 w-5" />} label="Configurações" />
    </>
  )
}

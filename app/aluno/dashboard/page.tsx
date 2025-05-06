"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { BookOpen, Calendar, ClipboardList, Award } from "lucide-react"
import Link from "next/link"

export default function AlunoDashboardPage() {
  const [gradeAverage, setGradeAverage] = useState<number | null>(null)
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Buscar média de notas (simplificado)
        const { data: grades, error: gradesError } = await supabase
          .from("grades")
          .select("score")
          .eq("student_id", user.id)

        if (gradesError) throw gradesError

        if (grades && grades.length > 0) {
          const sum = grades.reduce((acc, grade) => acc + grade.score, 0)
          setGradeAverage(Number.parseFloat((sum / grades.length).toFixed(2)))
        }

        // Buscar taxa de presença (simplificado)
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance")
          .select("status")
          .eq("student_id", user.id)

        if (attendanceError) throw attendanceError

        if (attendance && attendance.length > 0) {
          const presentCount = attendance.filter((a) => a.status === "presente").length
          setAttendanceRate(Number.parseFloat(((presentCount / attendance.length) * 100).toFixed(2)))
        }
      } catch (error) {
        console.error("Erro ao buscar dados do aluno:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [supabase])

  const sidebarContent = (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/aluno/dashboard" passHref>
          <SidebarMenuButton asChild isActive>
            <span className="flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/aluno/notas" passHref>
          <SidebarMenuButton asChild>
            <span className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Minhas Notas</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/aluno/frequencia" passHref>
          <SidebarMenuButton asChild>
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Minha Frequência</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/aluno/boletim" passHref>
          <SidebarMenuButton asChild>
            <span className="flex items-center">
              <Award className="mr-2 h-4 w-4" />
              <span>Boletim</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )

  return (
    <DashboardLayout userType="aluno" sidebarContent={sidebarContent}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : (gradeAverage ?? "N/A")}</div>
            <p className="text-xs text-muted-foreground">Sua média geral de notas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : attendanceRate ? `${attendanceRate}%` : "N/A"}</div>
            <p className="text-xs text-muted-foreground">Sua taxa de presença nas aulas</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Users, BookOpen, Calendar, ClipboardList } from "lucide-react"
import Link from "next/link"
import type { Student } from "@/lib/types"

export default function ResponsavelDashboardPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Buscar alunos vinculados ao responsável
        const { data: guardianStudents, error: guardianError } = await supabase
          .from("student_guardian")
          .select("student_id")
          .eq("guardian_id", user.id)

        if (guardianError) throw guardianError

        if (guardianStudents && guardianStudents.length > 0) {
          const studentIds = guardianStudents.map((gs) => gs.student_id)

          // Buscar detalhes dos alunos
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select(`
              *,
              profile:profiles(*)
            `)
            .in("id", studentIds)

          if (studentsError) throw studentsError
          setStudents(studentsData || [])
        }
      } catch (error) {
        console.error("Erro ao buscar alunos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [supabase])

  const sidebarContent = (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/responsavel/dashboard" passHref>
          <SidebarMenuButton asChild isActive>
            <span className="flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/responsavel/alunos" passHref>
          <SidebarMenuButton asChild>
            <span className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Meus Alunos</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/responsavel/notas" passHref>
          <SidebarMenuButton asChild>
            <span className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Notas</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/responsavel/frequencia" passHref>
          <SidebarMenuButton asChild>
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Frequência</span>
            </span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )

  return (
    <DashboardLayout userType="responsavel" sidebarContent={sidebarContent}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Meus Alunos</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : students.length === 0 ? (
          <p>Nenhum aluno vinculado à sua conta.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{student.profile?.full_name}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Matrícula: {student.registration_number}</p>
                  <p className="text-xs text-muted-foreground">Série: {student.grade}</p>
                  <p className="text-xs text-muted-foreground">Turma: {student.class}</p>
                  <Link
                    href={`/responsavel/aluno/${student.id}`}
                    className="text-xs text-blue-600 hover:underline mt-2 block"
                  >
                    Ver detalhes
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

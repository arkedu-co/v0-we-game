import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer()

  try {
    const formData = await request.formData()

    // Extract form data
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const education = formData.get("education") as string
    const subjects = formData.get("subjects") as string
    const schoolId = formData.get("schoolId") as string

    if (!fullName || !email || !password || !schoolId) {
      return NextResponse.json(
        { error: "Dados incompletos. Por favor, preencha todos os campos obrigatórios." },
        { status: 400 },
      )
    }

    console.log("Criando professor com os dados:", { fullName, email, education, schoolId })

    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError || !authData.user) {
      console.error("Erro ao criar usuário:", authError)
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError?.message || "Erro desconhecido"}` },
        { status: 500 },
      )
    }

    // 2. Create profile manually
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      user_type: "professor",
    })

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError)
      // Try to delete the user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Erro ao criar perfil: ${profileError.message}` }, { status: 500 })
    }

    // Parse subjects
    const subjectsArray = subjects
      ? subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    // 3. Create teacher record - using 'id' instead of 'user_id'
    const { error: teacherError } = await supabase.from("teachers").insert({
      id: authData.user.id, // Changed from user_id to id
      school_id: schoolId,
      education: education || null,
      subjects: subjectsArray,
    })

    if (teacherError) {
      console.error("Erro ao criar professor:", teacherError)
      // Try to delete the user and profile if teacher creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Erro ao criar professor: ${teacherError.message}` }, { status: 500 })
    }

    // Revalidate the professors page
    revalidatePath("/escola/professores")

    return NextResponse.json({ success: true, message: "Professor criado com sucesso" })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: `Erro ao processar requisição: ${(error as Error).message}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = getSupabaseServer()

  try {
    const formData = await request.formData()

    // Extract form data
    const id = formData.get("id") as string
    const fullName = formData.get("fullName") as string
    const education = formData.get("education") as string
    const subjects = formData.get("subjects") as string

    if (!id || !fullName) {
      return NextResponse.json(
        { error: "Dados incompletos. Por favor, preencha todos os campos obrigatórios." },
        { status: 400 },
      )
    }

    // 1. Update profile
    const { error: profileError } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", id)

    if (profileError) {
      console.error("Erro ao atualizar perfil:", profileError)
      return NextResponse.json({ error: `Erro ao atualizar perfil: ${profileError.message}` }, { status: 500 })
    }

    // Parse subjects
    const subjectsArray = subjects
      ? subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    // 2. Update teacher record - using 'id' instead of 'user_id'
    const { error: teacherError } = await supabase
      .from("teachers")
      .update({
        education: education || null,
        subjects: subjectsArray,
      })
      .eq("id", id) // Changed from user_id to id

    if (teacherError) {
      console.error("Erro ao atualizar professor:", teacherError)
      return NextResponse.json({ error: `Erro ao atualizar professor: ${teacherError.message}` }, { status: 500 })
    }

    // Revalidate the professors page
    revalidatePath("/escola/professores")

    return NextResponse.json({ success: true, message: "Professor atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: `Erro ao processar requisição: ${(error as Error).message}` }, { status: 500 })
  }
}

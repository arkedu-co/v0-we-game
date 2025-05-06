import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export const maxDuration = 60 // Set max duration to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const storeId = formData.get("storeId") as string
    const entityType = (formData.get("entityType") as string) || "produtos" // Default to produtos if not provided

    console.log("Upload request received:", {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      storeId,
      entityType,
    })

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!storeId) {
      return NextResponse.json({ error: "ID da entidade não fornecido" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Por favor, envie apenas arquivos de imagem" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "A imagem deve ter no máximo 5MB" }, { status: 400 })
    }

    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    // Use a path structure that works with existing code
    // This matches the path structure used for products
    const filePath = `${entityType}/${storeId}/${fileName}`

    console.log("File will be uploaded to path:", filePath)

    // Get the file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Initialize Supabase client with service role key using direct client creation
    // This ensures we're not using cookies or browser auth which might be causing issues
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 })
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false, // Don't persist the session
          autoRefreshToken: false, // Don't auto refresh the token
        },
      },
    )

    console.log("Attempting to upload file to path:", filePath)

    // Upload the file to Supabase Storage with explicit upsert option
    const { data, error: uploadError } = await supabase.storage.from("we").upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true, // Use upsert to overwrite if file exists
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: "Erro ao fazer upload do arquivo: " + uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("we").getPublicUrl(filePath)

    console.log("File uploaded successfully, public URL:", publicUrlData.publicUrl)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error: any) {
    console.error("Error in upload API route:", error)
    return NextResponse.json({ error: "Erro interno do servidor: " + error.message }, { status: 500 })
  }
}

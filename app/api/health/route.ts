import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    // Test basic connectivity
    const internetTest = await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      cache: "no-store",
    })
      .then(() => ({ status: "ok", message: "Internet connection available" }))
      .catch((error) => ({ status: "error", message: `Internet test failed: ${error.message}` }))

    // Test Supabase connectivity
    let supabaseTest
    try {
      const supabase = getSupabaseClient()
      const startTime = performance.now()

      // Try a simple query that doesn't require authentication
      const { data, error } = await supabase.from("health_check").select("count").maybeSingle()

      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      if (error && error.code !== "PGRST204") {
        // PGRST204 just means the table doesn't exist, which is fine for a health check
        supabaseTest = {
          status: "error",
          message: `Supabase query failed: ${error.message} (${error.code})`,
          details: error,
        }
      } else {
        supabaseTest = {
          status: "ok",
          message: `Supabase connection successful (${responseTime}ms)`,
          responseTime,
        }
      }
    } catch (error: any) {
      supabaseTest = {
        status: "error",
        message: `Supabase connection exception: ${error.message}`,
        stack: error.stack,
      }
    }

    // Get environment info
    const envInfo = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + "...",
      nodeEnv: process.env.NODE_ENV,
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      internet: internetTest,
      supabase: supabaseTest,
      environment: envInfo,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: `Health check failed: ${error.message}`,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

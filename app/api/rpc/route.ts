import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { functionName, params } = await request.json()

  if (functionName === "check_table_exists") {
    const { data, error } = await supabase.rpc("check_table_exists", {
      table_name: params.table_name,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exists: data })
  }

  return NextResponse.json({ error: "Function not found" }, { status: 404 })
}

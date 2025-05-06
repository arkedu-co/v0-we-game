"use server"

import { getSupabaseServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getSchoolIdForCurrentUser() {
  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      throw new Error(`Authentication error: ${sessionError.message}`)
    }

    if (!session?.user) {
      console.error("No authenticated user found")
      throw new Error("No authenticated user found. Please log in.")
    }

    // Log successful authentication
    console.log("User authenticated successfully:", session.user.id)

    // Check if the user is a school
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      throw new Error(`Profile error: ${profileError.message}`)
    }

    if (profile?.user_type === "escola") {
      // If the user is a school, the user ID is the school ID
      console.log("User is a school, returning user ID as school ID:", session.user.id)
      return session.user.id
    }

    // Check if the user is a teacher
    if (profile?.user_type === "professor") {
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("school_id")
        .eq("id", session.user.id)
        .single()

      if (teacherError) {
        console.error("Teacher error:", teacherError)
        throw new Error(`Teacher error: ${teacherError.message}`)
      }

      if (teacher?.school_id) {
        console.log("User is a teacher, returning school ID:", teacher.school_id)
        return teacher.school_id
      }
    }

    // Check directly in the schools table
    const { data: directSchool, error: directSchoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("owner_id", session.user.id)
      .single()

    if (directSchoolError && directSchoolError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is expected if the user is not a school owner
      console.error("Direct school error:", directSchoolError)
      throw new Error(`School lookup error: ${directSchoolError.message}`)
    }

    if (directSchool) {
      console.log("Found school with user as owner, returning school ID:", directSchool.id)
      return directSchool.id
    }

    console.error("Could not determine school ID through any method")
    throw new Error("Could not determine school ID. Please ensure you have the correct permissions.")
  } catch (error) {
    console.error("Error getting school ID:", error)
    throw error
  }
}

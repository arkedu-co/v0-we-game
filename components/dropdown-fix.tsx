"use client"

import { useEffect } from "react"
import { fixDropdowns } from "@/lib/fix-dropdowns"

export function DropdownFix() {
  useEffect(() => {
    fixDropdowns()
  }, [])

  return null
}

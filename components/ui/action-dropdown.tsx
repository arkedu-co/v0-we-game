"use client"

import type * as React from "react"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ActionDropdownProps {
  label?: string
  actions: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
    className?: string
  }[]
}

export function ActionDropdown({ label = "Ações", actions }: ActionDropdownProps) {
  return (
    <div className="action-dropdown-wrapper" style={{ position: "relative", zIndex: 50 }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="action-dropdown-content"
          style={{ zIndex: 999, backgroundColor: "white" }}
        >
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action, index) => (
            <DropdownMenuItem key={index} className={`cursor-pointer ${action.className || ""}`}>
              {action.href ? (
                <Link href={action.href} className="flex w-full items-center">
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Link>
              ) : (
                <button onClick={action.onClick} className="flex w-full items-center">
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

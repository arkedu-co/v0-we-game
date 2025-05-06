"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

interface SimpleActionMenuProps {
  actions: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
    className?: string
  }[]
}

export function SimpleActionMenu({ actions }: SimpleActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Abrir menu de ações"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 min-w-[150px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {actions.map((action, index) => (
            <div key={index} className={`${action.className || ""}`}>
              {action.href ? (
                <Link
                  href={action.href}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    action.onClick?.()
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

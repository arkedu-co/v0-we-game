"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

interface NativeActionMenuProps {
  actions: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
    className?: string
    variant?: "default" | "destructive"
  }[]
  align?: "right" | "left"
  triggerClassName?: string
}

export function NativeActionMenu({ actions, align = "right", triggerClassName }: NativeActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonId = useRef(`menu-button-${Math.random().toString(36).substr(2, 9)}`).current
  const menuId = useRef(`menu-${Math.random().toString(36).substr(2, 9)}`).current

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Fechar o menu quando pressionar ESC
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          triggerClassName || ""
        }`}
      >
        <span className="sr-only">Abrir menu de ações</span>
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={buttonId}
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1" role="none">
            {actions.map((action, index) => {
              const itemClassName = `flex w-full items-center px-4 py-2 text-sm ${
                action.variant === "destructive" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"
              } ${action.className || ""}`

              return (
                <div key={index} role="none">
                  {action.href ? (
                    <Link href={action.href} className={itemClassName} role="menuitem" onClick={() => setIsOpen(false)}>
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`text-left ${itemClassName}`}
                      role="menuitem"
                      onClick={() => {
                        action.onClick?.()
                        setIsOpen(false)
                      }}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

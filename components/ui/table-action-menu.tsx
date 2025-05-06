"use client"

import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface TableActionMenuProps {
  item: any
  viewHref?: string
  editHref?: string
  onDelete?: () => void
  onView?: () => void
  onEdit?: () => void
  additionalActions?: {
    label: string
    href?: string
    onClick?: () => void
  }[]
}

export function TableActionMenu({
  item,
  viewHref,
  editHref,
  onDelete,
  onView,
  onEdit,
  additionalActions = [],
}: TableActionMenuProps) {
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
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsOpen(!isOpen)}>
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-[999] mt-1 min-w-[8rem] rounded-md border border-gray-300 bg-white p-1 shadow-lg">
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">Ações</div>

          {viewHref && (
            <div className="cursor-pointer px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-sm">
              <Link href={viewHref} className="flex w-full">
                Visualizar
              </Link>
            </div>
          )}

          {onView && (
            <div
              onClick={() => {
                onView()
                setIsOpen(false)
              }}
              className="cursor-pointer px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-sm"
            >
              Visualizar
            </div>
          )}

          {editHref && (
            <div className="cursor-pointer px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-sm">
              <Link href={editHref} className="flex w-full">
                Editar
              </Link>
            </div>
          )}

          {onEdit && (
            <div
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="cursor-pointer px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-sm"
            >
              Editar
            </div>
          )}

          {(viewHref || editHref || onView || onEdit) && additionalActions.length > 0 && (
            <div className="my-1 h-px bg-gray-200"></div>
          )}

          {additionalActions.map((action, index) => (
            <div key={index} className="cursor-pointer px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-sm">
              {action.href ? (
                <Link href={action.href} className="flex w-full">
                  {action.label}
                </Link>
              ) : (
                <span
                  onClick={() => {
                    action.onClick?.()
                    setIsOpen(false)
                  }}
                  className="flex w-full"
                >
                  {action.label}
                </span>
              )}
            </div>
          ))}

          {onDelete && (
            <>
              {(viewHref || editHref || onView || onEdit || additionalActions.length > 0) && (
                <div className="my-1 h-px bg-gray-200"></div>
              )}
              <div
                onClick={() => {
                  onDelete()
                  setIsOpen(false)
                }}
                className="cursor-pointer px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100 rounded-sm"
              >
                Excluir
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

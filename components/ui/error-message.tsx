"use client"

import { useRouter } from "next/navigation"

interface ErrorMessageProps {
  title: string
  message: string
  actionText?: string
  actionHref?: string
  onRetry?: () => void
}

export function ErrorMessage({
  title,
  message,
  actionText = "Tentar novamente",
  actionHref,
  onRetry,
}: ErrorMessageProps) {
  const router = useRouter()

  const handleAction = () => {
    if (onRetry) {
      onRetry()
    } else if (actionHref) {
      router.push(actionHref)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2">{message}</p>
      <button onClick={handleAction} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {actionText}
      </button>
    </div>
  )
}

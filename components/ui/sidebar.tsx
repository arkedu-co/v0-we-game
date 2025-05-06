"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { ChevronDown, Menu } from "lucide-react"

interface SidebarContextProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextProps>({
  isOpen: true,
  toggleSidebar: () => {},
})

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => {
  return useContext(SidebarContext)
}

export const Sidebar = ({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  const { isOpen } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar-background border-r border-sidebar-border transition-transform duration-300 transform-translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

export const SidebarHeader = ({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("p-4 border-b border-sidebar-border", className)} {...props}>
      {children}
    </div>
  )
}

export const SidebarContent = ({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("py-4 overflow-y-auto", className)} {...props}>
      {children}
    </div>
  )
}

export const SidebarTrigger = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 hover:bg-primary-light hover:text-primary h-9 px-3 py-2",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="ml-2">Menu</span>
    </button>
  )
}

export const SidebarMenu = ({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("space-y-1 px-3", className)} {...props}>
      {children}
    </div>
  )
}

export const SidebarMenuItem = ({
  className,
  children,
  ...props
}: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export const SidebarMenuButton = ({
  className,
  isActive,
  children,
  asChild,
  ...props
}: {
  className?: string
  isActive?: boolean
  children: React.ReactNode
  asChild?: boolean
} & (React.AnchorHTMLAttributes<HTMLAnchorElement> | React.ButtonHTMLAttributes<HTMLButtonElement>)) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp className={cn("sidebar-item w-full text-left", isActive ? "active" : "", className)} {...props}>
      {children}
    </Comp>
  )
}

export const SidebarSection = ({
  title,
  children,
  defaultOpen = true,
  className,
  ...props
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("mb-2", className)} {...props}>
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-sidebar-foreground opacity-70"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      <div className={cn("mt-1", isOpen ? "block" : "hidden")}>{children}</div>
    </div>
  )
}

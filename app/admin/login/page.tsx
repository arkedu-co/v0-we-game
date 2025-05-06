import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { School } from "lucide-react"

export const metadata: Metadata = {
  title: "Login Administrador | Sistema Escolar",
  description: "Faça login como administrador para acessar o sistema escolar",
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-light to-white p-4 font-poppins">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-primary rounded-full p-4 mb-4 shadow-lg">
          <School className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-primary-dark">Sistema Escolar</h1>
        <p className="text-primary-dark/70 mt-1">Painel do Administrador</p>
      </div>
      <div className="w-full max-w-md">
        <LoginForm userType="admin" redirectPath="/admin/dashboard" />
      </div>
    </div>
  )
}

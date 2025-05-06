import { LoginForm } from "@/components/auth/login-form"

export default function AlunoLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <LoginForm userType="aluno" redirectPath="/aluno/dashboard" />
      </div>
    </div>
  )
}

import { ProfessorLoginForm } from "@/components/auth/professor-login-form"

export default function ProfessorLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Login do Professor</h1>
          <p className="text-gray-600">Acesse sua conta para gerenciar suas turmas</p>
        </div>

        <ProfessorLoginForm />
      </div>
    </div>
  )
}

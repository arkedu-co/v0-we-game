import { RegisterForm } from "@/components/auth/register-form"

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <RegisterForm userType="admin" redirectPath="/admin/dashboard" />
      </div>
    </div>
  )
}

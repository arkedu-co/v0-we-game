import { redirect } from "next/navigation"

export default function Home() {
  // Redirecionar para a página inicial com os cards de perfil
  return redirect("/home")
}

import DistribuirXPClientPage from "./DistribuirXPClientPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Distribuir XP | Professor",
  description: "Distribuição de XP para alunos",
}

export default function DistribuirXPPage() {
  return <DistribuirXPClientPage />
}

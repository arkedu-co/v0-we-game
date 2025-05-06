export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Adicionar a função generateStudentCode após as funções existentes

// Modificar apenas a função generateStudentCode para gerar um código de exatamente 6 caracteres
export function generateStudentCode(): string {
  // Gera um código de exatamente 6 dígitos
  const randomPart = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, 6)

  return randomPart
}

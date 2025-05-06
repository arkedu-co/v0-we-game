export type UserType = "admin" | "escola" | "professor" | "responsavel" | "aluno"
export type PriceType = "atoms" | "real"
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "delivered"
export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded"
export type PaymentMethod = "atoms" | "cash" | "credit_card" | "debit_card" | "pix"
export type AttitudeType = "positive" | "negative"
export type RewardType = "atoms" | "xp" | "both" | "none"

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  user_type: UserType
  created_at: string
  updated_at: string
}

export interface School {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  website: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface SchoolStore {
  id: string
  school_id: string
  name: string
  description?: string
  atoms_balance: number
  real_balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StoreProduct {
  id: string
  school_id: string
  name: string
  description?: string
  price: number
  price_type: "atoms" | "real"
  stock_quantity: number
  image_url?: string
  active: boolean // Changed from is_active to active to match the database schema
  created_at: string
  updated_at: string
}

export interface StoreOrder {
  id: string
  school_id: string
  student_id: string
  total_amount: number
  payment_type: "atoms" | "real" | "mixed"
  status: "pending" | "paid" | "cancelled" | "delivered"
  created_at: string
  updated_at: string
  student?: {
    id: string
    full_name?: string
    registration_number: string
  }
  items?: StoreOrderItem[]
}

export interface StoreOrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  price_type: "atoms" | "real"
  created_at: string
  product?: StoreProduct
}

export interface StoreInventoryMovement {
  id: string
  school_id: string
  product_id: string
  quantity: number
  movement_type: "in" | "out" | "adjustment"
  reason?: string
  reference_id?: string
  created_by: string
  created_at: string
  product?: StoreProduct
}

export interface StoreDelivery {
  id: string
  order_id: string
  status: "pending" | "in_progress" | "delivered" | "cancelled"
  delivered_at?: string
  delivered_by?: string
  notes?: string
  created_at: string
  updated_at: string
  order?: StoreOrder
}

// Atualizar a interface Teacher para incluir school_id
export interface Teacher {
  id: string
  name: string
  email: string
  school_id: string
  created_at?: string
  updated_at?: string
}

export interface Guardian {
  id: string
  phone: string
  address?: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Student {
  id: string
  name: string
  email: string
  school_id: string
  created_at?: string
  updated_at?: string
}

// Atualizado para incluir image_url
export interface Subject {
  id: string
  name: string
  description?: string
  school_id: string
  created_at?: string
  updated_at?: string
}

export interface Course {
  id: string
  name: string
  description?: string
  school_id: string
  created_at?: string
  updated_at?: string
}

export interface Class {
  id: string
  name: string
  description?: string
  course_id: string
  school_id: string
  year: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  class_id: string
  teacher_id: string
  term: string
  score: number
  evaluation_date: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  class_id: string
  date: string
  status: "presente" | "ausente" | "justificado"
  notes?: string
  created_at: string
  updated_at: string
}

// Adicionar a interface TeacherClassSubject
export interface TeacherClassSubject {
  id: string
  teacher_id: string
  class_id: string
  subject_id: string
  school_id: string
  created_at?: string
  updated_at?: string
  teacher?: Teacher
  class?: Class
  subject?: Subject
}

export interface StudentProfile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  user_type: UserType
}

export interface StudentAtomBalance {
  id: string
  student_id: string
  balance: number
  updated_at: string
  student?: Student
}

export interface AtomTransaction {
  id: string
  student_id: string
  amount: number
  transaction_type: "credit" | "debit"
  reference_type: string
  reference_id: string
  description?: string
  created_at: string
  student?: Student
}

// Novas interfaces para o sistema de atitudes, XP e níveis

export interface Attitude {
  id: string
  name: string
  description: string
  type: string
  reward_type: string
  reward_value: number // Added this field to match the database schema
  reward_value_xp: number
  reward_value_atoms: number
  school_id: string
  created_at: string
  updated_at: string

  // Campos para compatibilidade com o frontend
  nome?: string
  descricao?: string
  tipo?: string
  recompensa_tipo?: string
  valor_xp?: number
  valor_atoms?: number
}

export interface AppliedAttitude {
  id: string
  attitude_id: string
  student_id: string
  applied_by: string
  notes: string | null
  school_id: string
  created_at: string
}

export interface XPRule {
  id: string
  name: string
  description: string
  xp_value: number
  school_id: string
  created_at: string
  updated_at: string
}

export interface XPLevel {
  id: string
  name: string
  description: string
  min_xp: number
  max_xp: number
  avatar_url: string | null
  school_id: string
  created_at: string
  updated_at: string
}

export interface StudentXP {
  id: string
  student_id: string
  xp_amount: number
  level_id: string | null
  school_id: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: number
  student_id: number
  class_id: number
  enrollment_date: string
  status: string
  created_at: string
  updated_at: string
  student?: Student
  class?: Class
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  school_id: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  student_id: string
  school_id: string
  status: "pending" | "approved" | "rejected" | "delivered"
  total_price: number
  created_at?: string
  updated_at?: string
  student?: Student
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at?: string
  updated_at?: string
  product?: Product
}

export interface Inventory {
  id: string
  product_id: string
  school_id: string
  quantity: number
  min_quantity: number
  created_at?: string
  updated_at?: string
  product?: Product
}

export interface Delivery {
  id: string
  order_id: string
  school_id: string
  delivered_at: string
  notes?: string
  created_at?: string
  updated_at?: string
  order?: Order
}

export interface Avatar {
  id: string
  name: string
  description?: string
  category: string
  image_url: string
  school_id: string
  created_at?: string
  updated_at?: string
}

export interface RegraXP {
  id: string
  name: string
  description?: string
  points: number
  school_id: string
  created_at?: string
  updated_at?: string
}

// Verificar e atualizar a interface NivelXP ou XPLevel para refletir o esquema real do banco de dados
export interface NivelXP {
  id: string
  school_id: string
  name: string
  description?: string
  min_xp: number
  max_xp: number
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

// Alias para compatibilidade
//export type XPLevel = NivelXP // Removing the alias to avoid redeclaration

export interface Atitude {
  id: string
  name: string
  description?: string
  school_id: string
  created_at?: string
  updated_at?: string
}

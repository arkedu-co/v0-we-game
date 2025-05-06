export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserType = "admin" | "escola" | "professor" | "responsavel" | "aluno"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          user_type: UserType
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          user_type: UserType
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          user_type?: UserType
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          address: string
          phone?: string
          email?: string
          director_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          address: string
          phone?: string
          email?: string
          director_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string | null
          email?: string | null
          director_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      school_stores: {
        Row: {
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
        Insert: {
          id?: string
          school_id: string
          name: string
          description?: string
          atoms_balance?: number
          real_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          description?: string | null
          atoms_balance?: number
          real_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          school_id: string
          subjects: string[]
          education?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          school_id: string
          subjects: string[]
          education?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          subjects?: string[]
          education?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          school_id: string
          registration_number: string
          birth_date: string
          grade: string
          class: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          school_id: string
          registration_number: string
          birth_date: string
          grade: string
          class: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          registration_number?: string
          birth_date?: string
          grade?: string
          class?: string
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school_id: string
          grade: string
          name: string
          year: number
          teacher_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          school_id: string
          grade: string
          name: string
          year: number
          teacher_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          grade?: string
          name?: string
          year?: number
          teacher_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      grades: {
        Row: {
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
        Insert: {
          id: string
          student_id: string
          subject_id: string
          class_id: string
          teacher_id: string
          term: string
          score: number
          evaluation_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          class_id?: string
          teacher_id?: string
          term?: string
          score?: number
          evaluation_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          class_id: string
          date: string
          status: "presente" | "ausente" | "justificado"
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          student_id: string
          class_id: string
          date: string
          status: "presente" | "ausente" | "justificado"
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          date?: string
          status?: "presente" | "ausente" | "justificado"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guardians: {
        Row: {
          id: string
          phone: string
          address?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          phone: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_guardian: {
        Row: {
          student_id: string
          guardian_id: string
          relationship: string
          created_at: string
        }
        Insert: {
          student_id: string
          guardian_id: string
          relationship: string
          created_at?: string
        }
        Update: {
          student_id?: string
          guardian_id?: string
          relationship?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

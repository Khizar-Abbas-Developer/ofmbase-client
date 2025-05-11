export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          type: 'agency' | 'creator' | 'employee'
          role?: string
          permissions?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          type: 'agency' | 'creator' | 'employee'
          role?: string
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          type?: 'agency' | 'creator' | 'employee'
          role?: string
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          agency_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... rest of the existing types
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_employee_permissions: {
        Args: { employee_id: string }
        Returns: { permission: string }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
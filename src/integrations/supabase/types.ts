export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          branch: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nik: string
          role: Database["public"]["Enums"]["user_role"] | "customer_service"
          updated_at: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          nik: string
          role?: Database["public"]["Enums"]["user_role"] | "customer_service"
          updated_at?: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nik?: string
          role?: Database["public"]["Enums"]["user_role"] | "customer_service"
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      car_brands: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      car_models: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaint_history: {
        Row: {
          action: string
          complaint_id: string
          description: string | null
          id: string
          new_status: string | null
          old_status: string | null
          performed_at: string
          performed_by: string
        }
        Insert: {
          action: string
          complaint_id: string
          description?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_at?: string
          performed_by: string
        }
        Update: {
          action?: string
          complaint_id?: string
          description?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_at?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_department: string | null
          assigned_to: string | null
          attachments: string[] | null
          branch: string
          category: string
          created_at: string
          created_by: string
          customer_address: string | null
          customer_name: string
          customer_phone: string
          description: string
          id: string
          last_service_date: string | null
          last_service_items: string | null
          status: string
          sub_category: string | null
          ticket_number: string
          updated_at: string
          vehicle_brand: string
          vehicle_fuel_type: string | null
          vehicle_model: string
          vehicle_odometer: number | null
          vehicle_plate_number: string | null
          vehicle_transmission: string | null
          vehicle_vin: string | null
          vehicle_year: number | null
        }
        Insert: {
          assigned_department?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          branch: string
          category: string
          created_at?: string
          created_by: string
          customer_address?: string | null
          customer_name: string
          customer_phone: string
          description: string
          id?: string
          last_service_date?: string | null
          last_service_items?: string | null
          status?: string
          sub_category?: string | null
          ticket_number: string
          updated_at?: string
          vehicle_brand: string
          vehicle_fuel_type?: string | null
          vehicle_model: string
          vehicle_odometer?: number | null
          vehicle_plate_number?: string | null
          vehicle_transmission?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Update: {
          assigned_department?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          branch?: string
          category?: string
          created_at?: string
          created_by?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string
          description?: string
          id?: string
          last_service_date?: string | null
          last_service_items?: string | null
          status?: string
          sub_category?: string | null
          ticket_number?: string
          updated_at?: string
          vehicle_brand?: string
          vehicle_fuel_type?: string | null
          vehicle_model?: string
          vehicle_odometer?: number | null
          vehicle_plate_number?: string | null
          vehicle_transmission?: string | null
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      fuel_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nik: string | null
          updated_at: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          email?: string | null
          id: string
          name: string
          nik?: string | null
          updated_at?: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nik?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sub_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      technical_reports: {
        Row: {
          complaint_id: string
          conclusion: string
          created_at: string
          created_by: string
          damage_analysis: string
          estimated_cost: number | null
          id: string
          media_attachments: Json | null
          pic_name: string
          problem_parts: string | null
          recommendation: string | null
          repair_method: string
          updated_at: string
        }
        Insert: {
          complaint_id: string
          conclusion: string
          created_at?: string
          created_by: string
          damage_analysis: string
          estimated_cost?: number | null
          id?: string
          media_attachments?: Json | null
          pic_name: string
          problem_parts?: string | null
          recommendation?: string | null
          repair_method: string
          updated_at?: string
        }
        Update: {
          complaint_id?: string
          conclusion?: string
          created_at?: string
          created_by?: string
          damage_analysis?: string
          estimated_cost?: number | null
          id?: string
          media_attachments?: Json | null
          pic_name?: string
          problem_parts?: string | null
          recommendation?: string | null
          repair_method?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_reports_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: true
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      transmission_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      social_complaints: {
        Row: {
          id: string
          channel: string
          username: string
          link: string | null
          datetime: string
          complain_category: string
          complain_summary: string
          original_complain_text: string
          contact_status: 'Sulit Dihubungi' | 'Berhasil Dihubungi' | 'Belum Dicoba'
          viral_risk: 'Normal' | 'Potensi Viral'
          follow_up_note: string | null
          status: 'Open' | 'Monitoring' | 'Closed'
          created_at: string
        }
        Insert: {
          id?: string
          channel: string
          username: string
          link?: string | null
          datetime?: string
          complain_category: string
          complain_summary: string
          original_complain_text: string
          contact_status?: 'Sulit Dihubungi' | 'Berhasil Dihubungi' | 'Belum Dicoba'
          viral_risk?: 'Normal' | 'Potensi Viral'
          follow_up_note?: string | null
          status?: 'Open' | 'Monitoring' | 'Closed'
          created_at?: string
        }
        Update: {
          id?: string
          channel?: string
          username?: string
          link?: string | null
          datetime?: string
          complain_category?: string
          complain_summary?: string
          original_complain_text?: string
          contact_status?: 'Sulit Dihubungi' | 'Berhasil Dihubungi' | 'Belum Dicoba'
          viral_risk?: 'Normal' | 'Potensi Viral'
          follow_up_note?: string | null
          status?: 'Open' | 'Monitoring' | 'Closed'
          created_at?: string
        }
        Relationships: []
      }
      tire_brands: {
        Row: {
          id: string
          slug: string
          name: string
          country: string | null
          logo: string | null
          tier: 'premium' | 'mid' | 'budget' | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          country?: string | null
          logo?: string | null
          tier?: 'premium' | 'mid' | 'budget' | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          country?: string | null
          logo?: string | null
          tier?: 'premium' | 'mid' | 'budget' | null
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tire_products: {
        Row: {
          id: string
          brand_id: string
          name: string
          sizes: string[] | null
          types: string[] | null
          price_min: number | null
          price_max: number | null
          features: string[] | null
          rating: number | null
          warranty: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          sizes?: string[] | null
          types?: string[] | null
          price_min?: number | null
          price_max?: number | null
          features?: string[] | null
          rating?: number | null
          warranty?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          sizes?: string[] | null
          types?: string[] | null
          price_min?: number | null
          price_max?: number | null
          features?: string[] | null
          rating?: number | null
          warranty?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tire_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "tire_brands"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "tech_support" | "psd" | "viewer"
      user_role: "admin" | "staff" | "tech_support" | "psd" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "tech_support", "psd", "viewer"],
      user_role: ["admin", "staff", "tech_support", "psd", "viewer"],
    },
  },
} as const

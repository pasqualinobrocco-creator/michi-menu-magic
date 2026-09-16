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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: number
          logo_dark_url: string | null
          logo_light_url: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          logo_dark_url?: string | null
          logo_light_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          logo_dark_url?: string | null
          logo_light_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_menu_items: {
        Row: {
          created_at: string
          id: string
          menu_id: string
          name: string
          position: number
          price: number | null
          section: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_id: string
          name: string
          position?: number
          price?: number | null
          section: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_id?: string
          name?: string
          position?: number
          price?: number | null
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "daily_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_menus: {
        Row: {
          bread: string
          closing_message: string
          created_at: string
          id: string
          menu_date: string
          status: string
          updated_at: string
        }
        Insert: {
          bread?: string
          closing_message?: string
          created_at?: string
          id?: string
          menu_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          bread?: string
          closing_message?: string
          created_at?: string
          id?: string
          menu_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      fixed_menu_items: {
        Row: {
          description: string | null
          id: string
          is_active: boolean
          name: string
          position: number
          price: number | null
          section_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          position?: number
          price?: number | null
          section_id: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          price?: number | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_menu_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "fixed_menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_menu_sections: {
        Row: {
          id: string
          menu_id: string
          name: string
          position: number
        }
        Insert: {
          id?: string
          menu_id: string
          name: string
          position?: number
        }
        Update: {
          id?: string
          menu_id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "fixed_menu_sections_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "fixed_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_menus: {
        Row: {
          closing_message: string
          id: string
          position: number
          slug: string
          title: string
        }
        Insert: {
          closing_message?: string
          id?: string
          position?: number
          slug: string
          title: string
        }
        Update: {
          closing_message?: string
          id?: string
          position?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          close_time: string
          created_at: string
          enabled: boolean
          id: string
          label: string
          open_time: string
          position: number
          updated_at: string
        }
        Insert: {
          close_time: string
          created_at?: string
          enabled?: boolean
          id?: string
          label: string
          open_time: string
          position?: number
          updated_at?: string
        }
        Update: {
          close_time?: string
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          open_time?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      recipe_book: {
        Row: {
          created_at: string
          default_price: number | null
          id: string
          last_used_at: string
          name: string
          section: string | null
        }
        Insert: {
          created_at?: string
          default_price?: number | null
          id?: string
          last_used_at?: string
          name: string
          section?: string | null
        }
        Update: {
          created_at?: string
          default_price?: number | null
          id?: string
          last_used_at?: string
          name?: string
          section?: string | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

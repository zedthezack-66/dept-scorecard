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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_collections: {
        Row: {
          agent_name: string
          apr_actual: number | null
          aug_actual: number | null
          collection_target: number
          dec_actual: number | null
          feb_actual: number | null
          id: number
          jan_actual: number | null
          jul_actual: number | null
          jun_actual: number | null
          mar_actual: number | null
          may_actual: number | null
          nov_actual: number | null
          oct_actual: number | null
          sep_actual: number | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          apr_actual?: number | null
          aug_actual?: number | null
          collection_target?: number
          dec_actual?: number | null
          feb_actual?: number | null
          id?: never
          jan_actual?: number | null
          jul_actual?: number | null
          jun_actual?: number | null
          mar_actual?: number | null
          may_actual?: number | null
          nov_actual?: number | null
          oct_actual?: number | null
          sep_actual?: number | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          apr_actual?: number | null
          aug_actual?: number | null
          collection_target?: number
          dec_actual?: number | null
          feb_actual?: number | null
          id?: never
          jan_actual?: number | null
          jul_actual?: number | null
          jun_actual?: number | null
          mar_actual?: number | null
          may_actual?: number | null
          nov_actual?: number | null
          oct_actual?: number | null
          sep_actual?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      agent_settlements: {
        Row: {
          agent_name: string
          apr_actual: number | null
          aug_actual: number | null
          dec_actual: number | null
          feb_actual: number | null
          id: number
          jan_actual: number | null
          jul_actual: number | null
          jun_actual: number | null
          mar_actual: number | null
          may_actual: number | null
          nov_actual: number | null
          oct_actual: number | null
          sep_actual: number | null
          settlement_target: number
          updated_at: string
        }
        Insert: {
          agent_name: string
          apr_actual?: number | null
          aug_actual?: number | null
          dec_actual?: number | null
          feb_actual?: number | null
          id?: never
          jan_actual?: number | null
          jul_actual?: number | null
          jun_actual?: number | null
          mar_actual?: number | null
          may_actual?: number | null
          nov_actual?: number | null
          oct_actual?: number | null
          sep_actual?: number | null
          settlement_target?: number
          updated_at?: string
        }
        Update: {
          agent_name?: string
          apr_actual?: number | null
          aug_actual?: number | null
          dec_actual?: number | null
          feb_actual?: number | null
          id?: never
          jan_actual?: number | null
          jul_actual?: number | null
          jun_actual?: number | null
          mar_actual?: number | null
          may_actual?: number | null
          nov_actual?: number | null
          oct_actual?: number | null
          sep_actual?: number | null
          settlement_target?: number
          updated_at?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          avg_days_arrears: number
          count: number
          id: number
          movement: number
          name: string
          phone: string
          target: number
          updated_at: string
        }
        Insert: {
          avg_days_arrears?: number
          count?: number
          id?: number
          movement?: number
          name: string
          phone?: string
          target?: number
          updated_at?: string
        }
        Update: {
          avg_days_arrears?: number
          count?: number
          id?: number
          movement?: number
          name?: string
          phone?: string
          target?: number
          updated_at?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          actual: number | null
          apr: number | null
          aug: number | null
          dec: number | null
          feb: number | null
          id: number
          jan: number | null
          jul: number | null
          jun: number | null
          key: string
          lower_is_better: boolean
          mar: number | null
          may: number | null
          name: string
          nov: number | null
          oct: number | null
          sep: number | null
          target: number
          type: string
          unit: string
          updated_at: string
        }
        Insert: {
          actual?: number | null
          apr?: number | null
          aug?: number | null
          dec?: number | null
          feb?: number | null
          id?: number
          jan?: number | null
          jul?: number | null
          jun?: number | null
          key: string
          lower_is_better?: boolean
          mar?: number | null
          may?: number | null
          name: string
          nov?: number | null
          oct?: number | null
          sep?: number | null
          target?: number
          type?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          actual?: number | null
          apr?: number | null
          aug?: number | null
          dec?: number | null
          feb?: number | null
          id?: number
          jan?: number | null
          jul?: number | null
          jun?: number | null
          key?: string
          lower_is_better?: boolean
          mar?: number | null
          may?: number | null
          name?: string
          nov?: number | null
          oct?: number | null
          sep?: number | null
          target?: number
          type?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly: {
        Row: {
          actual: number | null
          id: number
          month: string
          target: number
          updated_at: string
        }
        Insert: {
          actual?: number | null
          id?: number
          month: string
          target?: number
          updated_at?: string
        }
        Update: {
          actual?: number | null
          id?: number
          month?: string
          target?: number
          updated_at?: string
        }
        Relationships: []
      }
      weekly: {
        Row: {
          actual: number | null
          end_date: string
          id: number
          start_date: string
          target: number
          updated_at: string
          week: string
        }
        Insert: {
          actual?: number | null
          end_date?: string
          id?: number
          start_date?: string
          target?: number
          updated_at?: string
          week: string
        }
        Update: {
          actual?: number | null
          end_date?: string
          id?: number
          start_date?: string
          target?: number
          updated_at?: string
          week?: string
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
    Enums: {},
  },
} as const

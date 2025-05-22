export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          address: string | null
          cover_letter: string | null
          date_of_birth: string | null
          email: string
          experience: string | null
          full_name: string
          gender: string | null
          id: string
          local_government: string | null
          phone: string
          position: string | null
          resume_url: string | null
          state: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          address?: string | null
          cover_letter?: string | null
          date_of_birth?: string | null
          email: string
          experience?: string | null
          full_name: string
          gender?: string | null
          id?: string
          local_government?: string | null
          phone: string
          position?: string | null
          resume_url?: string | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          address?: string | null
          cover_letter?: string | null
          date_of_birth?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          local_government?: string | null
          phone?: string
          position?: string | null
          resume_url?: string | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      BlogPost: {
        Row: {
          created_at: string
          Date: string | null
          email: string | null
          FirstName: string | null
          Header: string | null
          id: number
          LastName: string | null
          Post: string | null
        }
        Insert: {
          created_at?: string
          Date?: string | null
          email?: string | null
          FirstName?: string | null
          Header?: string | null
          id?: number
          LastName?: string | null
          Post?: string | null
        }
        Update: {
          created_at?: string
          Date?: string | null
          email?: string | null
          FirstName?: string | null
          Header?: string | null
          id?: number
          LastName?: string | null
          Post?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string
          responded: boolean | null
          responded_at: string | null
          responded_by: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone: string
          responded?: boolean | null
          responded_at?: string | null
          responded_by?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          responded?: boolean | null
          responded_at?: string | null
          responded_by?: string | null
          subject?: string
        }
        Relationships: []
      }
      estate: {
        Row: {
          actual_price: number | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          media: string[] | null
          name: string
          phase: number | null
          prelaunch_price: number | null
          promo_price: number | null
          scheme: number | null
          size: number | null
          sub_form: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          actual_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          media?: string[] | null
          name: string
          phase?: number | null
          prelaunch_price?: number | null
          promo_price?: number | null
          scheme?: number | null
          size?: number | null
          sub_form?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          actual_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          media?: string[] | null
          name?: string
          phase?: number | null
          prelaunch_price?: number | null
          promo_price?: number | null
          scheme?: number | null
          size?: number | null
          sub_form?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      Estate: {
        Row: {
          ActualPrice: number | null
          created_at: string
          Description: string | null
          EstateName: string | null
          id: number
          Location: string | null
          Media: string[] | null
          Phase: number | null
          PreLaunchPrice: number | null
          PromoPrice: number | null
          Scheme: number | null
          size: number | null
          Tittle: string | null
          Type: string | null
        }
        Insert: {
          ActualPrice?: number | null
          created_at?: string
          Description?: string | null
          EstateName?: string | null
          id?: number
          Location?: string | null
          Media?: string[] | null
          Phase?: number | null
          PreLaunchPrice?: number | null
          PromoPrice?: number | null
          Scheme?: number | null
          size?: number | null
          Tittle?: string | null
          Type?: string | null
        }
        Update: {
          ActualPrice?: number | null
          created_at?: string
          Description?: string | null
          EstateName?: string | null
          id?: number
          Location?: string | null
          Media?: string[] | null
          Phase?: number | null
          PreLaunchPrice?: number | null
          PromoPrice?: number | null
          Scheme?: number | null
          size?: number | null
          Tittle?: string | null
          Type?: string | null
        }
        Relationships: []
      }
      hidden_properties: {
        Row: {
          created_at: string | null
          id: string
          property_ids: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_ids?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_ids?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_registrations: {
        Row: {
          address: string | null
          country: string | null
          email: string
          event_date: string | null
          event_title: string | null
          gender: string | null
          id: string
          invite_another: boolean | null
          invitee_name: string | null
          invitee_phone: string | null
          is_pbo: string | null
          local_government: string | null
          name: string
          need_reminder: boolean | null
          phone: string
          registered_at: string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          email: string
          event_date?: string | null
          event_title?: string | null
          gender?: string | null
          id?: string
          invite_another?: boolean | null
          invitee_name?: string | null
          invitee_phone?: string | null
          is_pbo?: string | null
          local_government?: string | null
          name: string
          need_reminder?: boolean | null
          phone: string
          registered_at?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          email?: string
          event_date?: string | null
          event_title?: string | null
          gender?: string | null
          id?: string
          invite_another?: boolean | null
          invitee_name?: string | null
          invitee_phone?: string | null
          is_pbo?: string | null
          local_government?: string | null
          name?: string
          need_reminder?: boolean | null
          phone?: string
          registered_at?: string | null
          state?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          created_at: string
          email: string | null
          id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
          user_id?: string | null
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
          sold_plots: number | null
          sub_form: string | null
          title: string | null
          total_plots: number | null
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
          sold_plots?: number | null
          sub_form?: string | null
          title?: string | null
          total_plots?: number | null
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
          sold_plots?: number | null
          sub_form?: string | null
          title?: string | null
          total_plots?: number | null
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
      inspection_bookings: {
        Row: {
          created_at: string
          estate_name: string
          id: string
          inspection_date: string
          inspection_time: string
          message: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estate_name: string
          id?: string
          inspection_date: string
          inspection_time: string
          message?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estate_name?: string
          id?: string
          inspection_date?: string
          inspection_time?: string
          message?: string | null
          status?: string | null
          updated_at?: string
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
      newsletter_subscriptions: {
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
      posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_path: string | null
          published: boolean
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_path?: string | null
          published?: boolean
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_path?: string | null
          published?: boolean
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          current_residence: string | null
          date_of_birth: string | null
          employer_address: string | null
          employer_name: string | null
          first_name: string | null
          gender: string | null
          id: string
          languages_spoken: string[] | null
          last_name: string | null
          local_government: string | null
          marital_status: string | null
          nationality: string | null
          next_of_kin_address: string | null
          next_of_kin_email: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          occupation: string | null
          phone_number: string | null
          profile_completed: boolean | null
          spouse_name: string | null
          state_of_origin: string | null
          terms_accepted: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          current_residence?: string | null
          date_of_birth?: string | null
          employer_address?: string | null
          employer_name?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          languages_spoken?: string[] | null
          last_name?: string | null
          local_government?: string | null
          marital_status?: string | null
          nationality?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          occupation?: string | null
          phone_number?: string | null
          profile_completed?: boolean | null
          spouse_name?: string | null
          state_of_origin?: string | null
          terms_accepted?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          current_residence?: string | null
          date_of_birth?: string | null
          employer_address?: string | null
          employer_name?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          languages_spoken?: string[] | null
          last_name?: string | null
          local_government?: string | null
          marital_status?: string | null
          nationality?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          occupation?: string | null
          phone_number?: string | null
          profile_completed?: boolean | null
          spouse_name?: string | null
          state_of_origin?: string | null
          terms_accepted?: boolean | null
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
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_roles: string[] | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          user_roles?: string[] | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_roles?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_user_profile: {
        Args: { user_id: number }
        Returns: undefined
      }
      get_user_profile: {
        Args: { user_id: number }
        Returns: {
          id: number
          first_name: string
          last_name: string
          email: string
        }[]
      }
      list_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          first_name: string
          last_name: string
          email: string
        }[]
      }
      update_user_profile: {
        Args: { user_id: number; first_name: string; last_name: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "pbo" | "client"
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
    Enums: {
      app_role: ["admin", "staff", "pbo", "client"],
    },
  },
} as const

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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action_description: string
          action_type: string
          admin_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
        }
        Insert: {
          action_description: string
          action_type: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          action_description?: string
          action_type?: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_calendar_events: {
        Row: {
          all_day: boolean | null
          attendees: string[] | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          attendees?: string[] | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          attendees?: string[] | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_chat_messages: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_departments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          role_name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          role_name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role_name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          account_email: string | null
          attachments: Json | null
          body: string
          created_at: string
          external_ref: string | null
          folder: string
          from_email: string
          from_name: string | null
          html: string | null
          id: string
          is_read: boolean
          is_starred: boolean
          parent_id: string | null
          sender_id: string | null
          source: string
          subject: string
          to_email: string
          to_name: string | null
          updated_at: string
        }
        Insert: {
          account_email?: string | null
          attachments?: Json | null
          body?: string
          created_at?: string
          external_ref?: string | null
          folder?: string
          from_email: string
          from_name?: string | null
          html?: string | null
          id?: string
          is_read?: boolean
          is_starred?: boolean
          parent_id?: string | null
          sender_id?: string | null
          source?: string
          subject?: string
          to_email: string
          to_name?: string | null
          updated_at?: string
        }
        Update: {
          account_email?: string | null
          attachments?: Json | null
          body?: string
          created_at?: string
          external_ref?: string | null
          folder?: string
          from_email?: string
          from_name?: string | null
          html?: string | null
          id?: string
          is_read?: boolean
          is_starred?: boolean
          parent_id?: string | null
          sender_id?: string | null
          source?: string
          subject?: string
          to_email?: string
          to_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_emails_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "admin_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_emails_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_mailboxes: {
        Row: {
          access_level: string
          created_at: string
          id: string
          is_primary: boolean
          mailbox_email: string
          mailbox_provider: string
          provider_account_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          mailbox_email: string
          mailbox_provider?: string
          provider_account_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          mailbox_email?: string
          mailbox_provider?: string
          provider_account_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notices: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          permission_key: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_key: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      admin_presence: {
        Row: {
          id: string
          is_online: boolean | null
          last_seen: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_role_mailbox_access: {
        Row: {
          created_at: string
          id: string
          mailbox_email: string
          role_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          mailbox_email: string
          role_name: string
        }
        Update: {
          created_at?: string
          id?: string
          mailbox_email?: string
          role_name?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          role_name: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role_name: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_role_name_fkey"
            columns: ["role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      admin_shared_files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder: string | null
          id: string
          is_public: boolean | null
          shared_with: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder?: string | null
          id?: string
          is_public?: boolean | null
          shared_with?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder?: string | null
          id?: string
          is_public?: boolean | null
          shared_with?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_shared_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      audit_log: {
        Row: {
          data_accessed: Json | null
          id: string
          operation: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          data_accessed?: Json | null
          id?: string
          operation: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          data_accessed?: Json | null
          id?: string
          operation?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_carousel_slides: {
        Row: {
          created_at: string
          eyebrow: string
          id: string
          image_url: string
          is_active: boolean
          link: string | null
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          eyebrow?: string
          id?: string
          image_url: string
          is_active?: boolean
          link?: string | null
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          eyebrow?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link?: string | null
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bh_property_sales: {
        Row: {
          buyer_id: string
          commissioned_at: string
          created_at: string
          id: string
          order_id: string
          plot_id: string | null
          property_id: string
          property_price: number
        }
        Insert: {
          buyer_id: string
          commissioned_at?: string
          created_at?: string
          id?: string
          order_id: string
          plot_id?: string | null
          property_id: string
          property_price: number
        }
        Update: {
          buyer_id?: string
          commissioned_at?: string
          created_at?: string
          id?: string
          order_id?: string
          plot_id?: string | null
          property_id?: string
          property_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bh_property_sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bh_property_sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "my_properties"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "bh_property_sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      bh_subscription_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          paid_at: string
          paystack_reference: string | null
          status: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paid_at?: string
          paystack_reference?: string | null
          status?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string
          paystack_reference?: string | null
          status?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bh_subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "bh_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      bh_subscriptions: {
        Row: {
          created_at: string
          estate_name: string
          estate_slug: string
          expected_end_date: string
          frequency: string
          id: string
          installment_amount: number
          next_due_date: string
          paid_amount: number
          paid_installments: number
          plot_size: string
          start_date: string
          status: string
          total_amount: number
          total_installments: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estate_name: string
          estate_slug: string
          expected_end_date: string
          frequency: string
          id?: string
          installment_amount: number
          next_due_date?: string
          paid_amount?: number
          paid_installments?: number
          plot_size: string
          start_date?: string
          status?: string
          total_amount: number
          total_installments: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estate_name?: string
          estate_slug?: string
          expected_end_date?: string
          frequency?: string
          id?: string
          installment_amount?: number
          next_due_date?: string
          paid_amount?: number
          paid_installments?: number
          plot_size?: string
          start_date?: string
          status?: string
          total_amount?: number
          total_installments?: number
          updated_at?: string
          user_id?: string
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      centertraining: {
        Row: {
          address: string
          center_leader_name: string
          center_name: string
          created_at: string
          email: string
          expected_attendance: number
          id: string
          phone_number: string
          training_date: string
          training_time: string
          updated_at: string
          venue_capacity: number
        }
        Insert: {
          address: string
          center_leader_name: string
          center_name: string
          created_at?: string
          email: string
          expected_attendance: number
          id?: string
          phone_number: string
          training_date: string
          training_time: string
          updated_at?: string
          venue_capacity: number
        }
        Update: {
          address?: string
          center_leader_name?: string
          center_name?: string
          created_at?: string
          email?: string
          expected_attendance?: number
          id?: string
          phone_number?: string
          training_date?: string
          training_time?: string
          updated_at?: string
          venue_capacity?: number
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
      content_items: {
        Row: {
          body: string | null
          category: string | null
          content_type: string
          created_at: string
          created_by: string | null
          cta_label: string | null
          display_order: number
          event_date: string | null
          event_location: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          link_url: string | null
          metadata: Json
          page: string
          slug: string | null
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          content_type: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          display_order?: number
          event_date?: string | null
          event_location?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          link_url?: string | null
          metadata?: Json
          page: string
          slug?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          display_order?: number
          event_date?: string | null
          event_location?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          link_url?: string | null
          metadata?: Json
          page?: string
          slug?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_follow_ups: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          notes: string | null
          scheduled_at: string
        }
        Insert: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          scheduled_at: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          scheduled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_follow_ups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          lead_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          lead_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          estate_interest: string | null
          id: string
          last_contacted_at: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          estate_interest?: string | null
          id?: string
          last_contacted_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          estate_interest?: string | null
          id?: string
          last_contacted_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          created_at: string
          id: string
          mailbox_email: string
          metadata: Json | null
          oauth_state: string | null
          provider: string
          scopes: string[]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mailbox_email: string
          metadata?: Json | null
          oauth_state?: string | null
          provider: string
          scopes?: string[]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mailbox_email?: string
          metadata?: Json | null
          oauth_state?: string | null
          provider?: string
          scopes?: string[]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          failed_count: number | null
          id: string
          name: string
          recipient_emails: string[] | null
          recipient_filter: string | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string
          template_id: string | null
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          name: string
          recipient_emails?: string[] | null
          recipient_filter?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          recipient_emails?: string[] | null
          recipient_filter?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          body: string
          created_at: string
          id: string
          recipient_email: string
          recipient_name: string | null
          sender_id: string | null
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          recipient_email: string
          recipient_name?: string | null
          sender_id?: string | null
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sender_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      email_sessions: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_validated_at: string | null
          mailbox_email: string
          provider: string
          refresh_token_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_validated_at?: string | null
          mailbox_email: string
          provider: string
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_validated_at?: string | null
          mailbox_email?: string
          provider?: string
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estate: {
        Row: {
          actual_price: number | null
          annual_rent: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          description: string | null
          id: string
          is_for_rent: boolean | null
          is_for_sale: boolean | null
          is_sold_out: boolean | null
          location: string | null
          media: string[] | null
          monthly_rent: number | null
          name: string
          phase: number | null
          prelaunch_price: number | null
          promo_price: number | null
          property_category: string | null
          scheme: number | null
          size: number | null
          size_unit: string | null
          sold_plots: number | null
          sub_form: string | null
          subscription_form_url: string | null
          title: string | null
          total_plots: number | null
          type: string | null
        }
        Insert: {
          actual_price?: number | null
          annual_rent?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_for_rent?: boolean | null
          is_for_sale?: boolean | null
          is_sold_out?: boolean | null
          location?: string | null
          media?: string[] | null
          monthly_rent?: number | null
          name: string
          phase?: number | null
          prelaunch_price?: number | null
          promo_price?: number | null
          property_category?: string | null
          scheme?: number | null
          size?: number | null
          size_unit?: string | null
          sold_plots?: number | null
          sub_form?: string | null
          subscription_form_url?: string | null
          title?: string | null
          total_plots?: number | null
          type?: string | null
        }
        Update: {
          actual_price?: number | null
          annual_rent?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_for_rent?: boolean | null
          is_for_sale?: boolean | null
          is_sold_out?: boolean | null
          location?: string | null
          media?: string[] | null
          monthly_rent?: number | null
          name?: string
          phase?: number | null
          prelaunch_price?: number | null
          promo_price?: number | null
          property_category?: string | null
          scheme?: number | null
          size?: number | null
          size_unit?: string | null
          sold_plots?: number | null
          sub_form?: string | null
          subscription_form_url?: string | null
          title?: string | null
          total_plots?: number | null
          type?: string | null
        }
        Relationships: []
      }
      estate_doc_pricing: {
        Row: {
          created_at: string
          deed_of_assignment: number | null
          estate_id: string
          id: string
          plot_demarcation: number | null
          plot_maintenance_fee: number | null
          survey_plan: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deed_of_assignment?: number | null
          estate_id: string
          id?: string
          plot_demarcation?: number | null
          plot_maintenance_fee?: number | null
          survey_plan?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deed_of_assignment?: number | null
          estate_id?: string
          id?: string
          plot_demarcation?: number | null
          plot_maintenance_fee?: number | null
          survey_plan?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_doc_pricing_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: true
            referencedRelation: "estate"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_documentation_payments: {
        Row: {
          amount: number
          created_at: string
          documentation_type_id: string | null
          estate_id: string
          id: string
          is_bundle: boolean | null
          order_id: string | null
          plot_count: number
          reference: string | null
          status: string
          total_bundle_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          documentation_type_id?: string | null
          estate_id: string
          id?: string
          is_bundle?: boolean | null
          order_id?: string | null
          plot_count?: number
          reference?: string | null
          status?: string
          total_bundle_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          documentation_type_id?: string | null
          estate_id?: string
          id?: string
          is_bundle?: boolean | null
          order_id?: string | null
          plot_count?: number
          reference?: string | null
          status?: string
          total_bundle_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estate_documentation_payments_documentation_type_id_fkey"
            columns: ["documentation_type_id"]
            isOneToOne: false
            referencedRelation: "documentation_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_documentation_payments_documentation_type_id_fkey"
            columns: ["documentation_type_id"]
            isOneToOne: false
            referencedRelation: "my_properties"
            referencedColumns: ["documentation_type_id"]
          },
        ]
      }
      estate_other_payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          estate_id: string
          id: string
          is_active: boolean | null
          payment_name: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          estate_id: string
          id?: string
          is_active?: boolean | null
          payment_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          estate_id?: string
          id?: string
          is_active?: boolean | null
          payment_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_other_payments_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estate"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_subscription_counters: {
        Row: {
          created_at: string
          estate_code: string
          estate_key: string
          next_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estate_code: string
          estate_key: string
          next_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estate_code?: string
          estate_key?: string
          next_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      estate_subscriptions: {
        Row: {
          amount: number
          created_at: string
          estate_code: string
          estate_id: string | null
          estate_name: string
          id: string
          order_id: string | null
          payment_plan: string | null
          payment_request_id: string | null
          subscribed_at: string
          subscription_number: string
          subscription_status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          estate_code: string
          estate_id?: string | null
          estate_name: string
          id?: string
          order_id?: string | null
          payment_plan?: string | null
          payment_request_id?: string | null
          subscribed_at?: string
          subscription_number: string
          subscription_status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          estate_code?: string
          estate_id?: string | null
          estate_name?: string
          id?: string
          order_id?: string | null
          payment_plan?: string | null
          payment_request_id?: string | null
          subscribed_at?: string
          subscription_number?: string
          subscription_status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      gallery_media_items: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          display_order: number
          event_description: string | null
          id: string
          is_published: boolean
          media_type: string
          media_url: string
          poster_url: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          event_description?: string | null
          id?: string
          is_published?: boolean
          media_type: string
          media_url: string
          poster_url?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          event_description?: string | null
          id?: string
          is_published?: boolean
          media_type?: string
          media_url?: string
          poster_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gmail_oauth_state: {
        Row: {
          created_at: string
          mailbox_email: string | null
          requested_by: string | null
          state: string
          used: boolean
        }
        Insert: {
          created_at?: string
          mailbox_email?: string | null
          requested_by?: string | null
          state: string
          used?: boolean
        }
        Update: {
          created_at?: string
          mailbox_email?: string | null
          requested_by?: string | null
          state?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "gmail_oauth_state_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_oauth_tokens: {
        Row: {
          access_token: string
          connected_by: string | null
          created_at: string
          email: string
          expires_at: string
          google_account_email: string | null
          id: string
          is_active: boolean
          mailbox_id: string | null
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_by?: string | null
          created_at?: string
          email: string
          expires_at: string
          google_account_email?: string | null
          id?: string
          is_active?: boolean
          mailbox_id?: string | null
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          google_account_email?: string | null
          id?: string
          is_active?: boolean
          mailbox_id?: string | null
          refresh_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gmail_oauth_tokens_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gmail_oauth_tokens_mailbox_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "admin_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
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
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
      listing_contacts: {
        Row: {
          created_at: string
          listing_id: string
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_contacts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          amenities: string[] | null
          annual_rent: number | null
          approved_at: string | null
          approved_by: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_sqm: number | null
          city: string | null
          created_at: string | null
          created_by: string | null
          deposit_amount: number | null
          description: string | null
          drone_footage: string[] | null
          encumbrances: string | null
          estate: string | null
          floor_plans: string[] | null
          hoa_fees: number | null
          hotspot: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          land_sqm: number | null
          latitude: number | null
          listing_start_date: string | null
          longitude: number | null
          maintenance_fees: number | null
          max_rental_months: number | null
          min_rental_months: number | null
          moderation_status: string
          monthly_rent: number | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          ownership_status: string | null
          parking: number | null
          parking_type: string | null
          payment_options: string[] | null
          photos: string[] | null
          price_amount: number
          price_currency: string
          price_negotiable: boolean | null
          price_period: string
          property_type: string
          region: string
          rejection_reason: string | null
          roi_percent: number | null
          special_notes: string | null
          submitted_at: string | null
          tax_status: string | null
          title: string
          tour_3d_url: string | null
          updated_at: string | null
          video_tours: string[] | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          annual_rent?: number | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_sqm?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          deposit_amount?: number | null
          description?: string | null
          drone_footage?: string[] | null
          encumbrances?: string | null
          estate?: string | null
          floor_plans?: string[] | null
          hoa_fees?: number | null
          hotspot?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          land_sqm?: number | null
          latitude?: number | null
          listing_start_date?: string | null
          longitude?: number | null
          maintenance_fees?: number | null
          max_rental_months?: number | null
          min_rental_months?: number | null
          moderation_status?: string
          monthly_rent?: number | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          ownership_status?: string | null
          parking?: number | null
          parking_type?: string | null
          payment_options?: string[] | null
          photos?: string[] | null
          price_amount?: number
          price_currency?: string
          price_negotiable?: boolean | null
          price_period?: string
          property_type?: string
          region: string
          rejection_reason?: string | null
          roi_percent?: number | null
          special_notes?: string | null
          submitted_at?: string | null
          tax_status?: string | null
          title: string
          tour_3d_url?: string | null
          updated_at?: string | null
          video_tours?: string[] | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          annual_rent?: number | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_sqm?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          deposit_amount?: number | null
          description?: string | null
          drone_footage?: string[] | null
          encumbrances?: string | null
          estate?: string | null
          floor_plans?: string[] | null
          hoa_fees?: number | null
          hotspot?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          land_sqm?: number | null
          latitude?: number | null
          listing_start_date?: string | null
          longitude?: number | null
          maintenance_fees?: number | null
          max_rental_months?: number | null
          min_rental_months?: number | null
          moderation_status?: string
          monthly_rent?: number | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          ownership_status?: string | null
          parking?: number | null
          parking_type?: string | null
          payment_options?: string[] | null
          photos?: string[] | null
          price_amount?: number
          price_currency?: string
          price_negotiable?: boolean | null
          price_period?: string
          property_type?: string
          region?: string
          rejection_reason?: string | null
          roi_percent?: number | null
          special_notes?: string | null
          submitted_at?: string | null
          tax_status?: string | null
          title?: string
          tour_3d_url?: string | null
          updated_at?: string | null
          video_tours?: string[] | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_settings: {
        Row: {
          created_at: string
          folder_filters: string[]
          id: string
          mailbox_email: string
          notifications_enabled: boolean
          provider: string
          sync_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_filters?: string[]
          id?: string
          mailbox_email: string
          notifications_enabled?: boolean
          provider: string
          sync_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_filters?: string[]
          id?: string
          mailbox_email?: string
          notifications_enabled?: boolean
          provider?: string
          sync_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mail_sync_status: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          mailbox_email: string
          message_count: number
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          mailbox_email: string
          message_count?: number
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          mailbox_email?: string
          message_count?: number
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mail_tokens: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          expires_at: string | null
          id: string
          mailbox_email: string
          provider: string
          refresh_token_encrypted: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          mailbox_email: string
          provider: string
          refresh_token_encrypted?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          mailbox_email?: string
          provider?: string
          refresh_token_encrypted?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mlm_commissions: {
        Row: {
          beneficiary_id: string
          commission_amount: number
          commission_rate: number
          commission_source: string
          created_at: string
          description: string | null
          id: string
          source_order_id: string | null
          source_property_sale_id: string | null
          source_purchase_id: string | null
          sponsor_level: number
          status: string
        }
        Insert: {
          beneficiary_id: string
          commission_amount: number
          commission_rate: number
          commission_source?: string
          created_at?: string
          description?: string | null
          id?: string
          source_order_id?: string | null
          source_property_sale_id?: string | null
          source_purchase_id?: string | null
          sponsor_level: number
          status?: string
        }
        Update: {
          beneficiary_id?: string
          commission_amount?: number
          commission_rate?: number
          commission_source?: string
          created_at?: string
          description?: string | null
          id?: string
          source_order_id?: string | null
          source_property_sale_id?: string | null
          source_purchase_id?: string | null
          sponsor_level?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlm_commissions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "my_properties"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "mlm_commissions_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_source_property_sale_id_fkey"
            columns: ["source_property_sale_id"]
            isOneToOne: false
            referencedRelation: "bh_property_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_source_purchase_id_fkey"
            columns: ["source_purchase_id"]
            isOneToOne: false
            referencedRelation: "mlm_membership_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      mlm_membership_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          package_code: string
          paystack_reference: string | null
          purchase_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          package_code: string
          paystack_reference?: string | null
          purchase_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          package_code?: string
          paystack_reference?: string | null
          purchase_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlm_membership_purchases_package_code_fkey"
            columns: ["package_code"]
            isOneToOne: false
            referencedRelation: "mlm_packages"
            referencedColumns: ["package_code"]
          },
          {
            foreignKeyName: "mlm_membership_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mlm_packages: {
        Row: {
          created_at: string
          description: string
          direct_commission_pct: number
          first_level_sales_commission_pct: number
          indirect_commission_pct: number
          package_code: string
          package_name: string
          price: number
          sales_commission_locked: boolean
          sales_commission_pct: number
          withdrawable: boolean
        }
        Insert: {
          created_at?: string
          description: string
          direct_commission_pct: number
          first_level_sales_commission_pct?: number
          indirect_commission_pct: number
          package_code: string
          package_name: string
          price: number
          sales_commission_locked?: boolean
          sales_commission_pct: number
          withdrawable?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          direct_commission_pct?: number
          first_level_sales_commission_pct?: number
          indirect_commission_pct?: number
          package_code?: string
          package_name?: string
          price?: number
          sales_commission_locked?: boolean
          sales_commission_pct?: number
          withdrawable?: boolean
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
      notifications: {
        Row: {
          audience: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_installments: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          due_date: string | null
          id: string
          installment_number: number
          order_id: string
          paid_at: string | null
          payment_id: string | null
          payment_reference: string | null
          payment_sequence: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number: number
          order_id: string
          paid_at?: string | null
          payment_id?: string | null
          payment_reference?: string | null
          payment_sequence?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number?: number
          order_id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_reference?: string | null
          payment_sequence?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_installments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "my_properties"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_installments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_installments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number
          balance: number
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          items: Json
          payment_reference: string
          payment_status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          balance?: number
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          items: Json
          payment_reference: string
          payment_status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          balance?: number
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          items?: Json
          payment_reference?: string
          payment_status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_gateway_events: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway: string
          id: string
          metadata: Json
          order_id: string | null
          reference: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway: string
          id?: string
          metadata?: Json
          order_id?: string | null
          reference: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway?: string
          id?: string
          metadata?: Json
          order_id?: string | null
          reference?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "my_properties"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_gateway_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_request_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          amount: number | null
          created_at: string
          id: string
          new_status: string
          payment_request_id: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          amount?: number | null
          created_at?: string
          id?: string
          new_status: string
          payment_request_id: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          amount?: number | null
          created_at?: string
          id?: string
          new_status?: string
          payment_request_id?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_request_audit_log_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          reference: string | null
          related_payment_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reference?: string | null
          related_payment_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reference?: string | null
          related_payment_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          channel: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_id: string
          user_id: string
        }
        Insert: {
          amount: number
          channel?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_id: string
          user_id: string
        }
        Update: {
          amount?: number
          channel?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          balance: number
          created_at: string
          id: string
          interest_amount: number
          interest_percent: number
          months: number
          plan_type: string
          principal_amount: number
          promo_estate_slug: string | null
          promo_installment_amount: number | null
          property_id: string
          reference: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          balance: number
          created_at?: string
          id?: string
          interest_amount: number
          interest_percent: number
          months: number
          plan_type: string
          principal_amount: number
          promo_estate_slug?: string | null
          promo_installment_amount?: number | null
          property_id: string
          reference?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          balance?: number
          created_at?: string
          id?: string
          interest_amount?: number
          interest_percent?: number
          months?: number
          plan_type?: string
          principal_amount?: number
          promo_estate_slug?: string | null
          promo_installment_amount?: number | null
          property_id?: string
          reference?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_admin_requests: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          rejection_reason: string | null
          requested_at: string
          requested_role: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_role?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_role?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          updated_at?: string
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
          account_locked: boolean
          account_locked_at: string | null
          account_locked_reason: string | null
          address: string | null
          aml_notes: string | null
          aml_risk_rating: string | null
          banking_details: string | null
          birthday_reminder_sent_year: number | null
          company_address: string | null
          company_name: string | null
          company_registration_number: string | null
          created_at: string | null
          current_package: string | null
          current_rank: string | null
          current_residence: string | null
          date_of_birth: string | null
          employer_address: string | null
          employer_country: string | null
          employer_name: string | null
          employment_role: string | null
          employment_status: string | null
          financial_crimes_details: string | null
          first_name: string | null
          gender: string | null
          has_financial_crimes_history: boolean
          id: string
          id_country_of_issue: string | null
          id_date_of_issue: string | null
          id_expiry: string | null
          id_issuing_authority: string | null
          id_number: string | null
          id_type: string | null
          incorporation_country: string | null
          incorporation_date: string | null
          is_active: boolean | null
          is_foreigner: boolean | null
          is_organization: boolean
          is_pbo: boolean | null
          is_politically_exposed: boolean
          kyc_docs: Json | null
          languages_spoken: string[] | null
          last_name: string | null
          local_government: string | null
          marital_status: string | null
          monthly_income: number | null
          nationality: string | null
          nature_of_business: string | null
          nature_of_corporate_business: string | null
          next_of_kin_address: string | null
          next_of_kin_email: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          nin_number: string | null
          occupation: string | null
          pbo_referral_code: string | null
          personally_sponsored_count: number | null
          phone_number: string | null
          political_exposure_details: string | null
          profile_completed: boolean | null
          profile_completion_percentage: number | null
          profile_picture_url: string | null
          referred_by_code: string | null
          referred_by_id: string | null
          referrer_email: string | null
          referrer_name: string | null
          referrer_phone: string | null
          registration_date: string | null
          registration_expires_at: string | null
          renewal_reminder_sent_at: string | null
          residence_permit: string | null
          sales_status: string | null
          source_of_income: string | null
          spouse_name: string | null
          state_of_origin: string | null
          team_size: number | null
          terms_accepted: boolean | null
          tin_number: string | null
          total_commissions: number | null
          total_personal_volume: number | null
          updated_at: string | null
          visa_status: string | null
          wallet_balance: number | null
        }
        Insert: {
          account_locked?: boolean
          account_locked_at?: string | null
          account_locked_reason?: string | null
          address?: string | null
          aml_notes?: string | null
          aml_risk_rating?: string | null
          banking_details?: string | null
          birthday_reminder_sent_year?: number | null
          company_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          created_at?: string | null
          current_package?: string | null
          current_rank?: string | null
          current_residence?: string | null
          date_of_birth?: string | null
          employer_address?: string | null
          employer_country?: string | null
          employer_name?: string | null
          employment_role?: string | null
          employment_status?: string | null
          financial_crimes_details?: string | null
          first_name?: string | null
          gender?: string | null
          has_financial_crimes_history?: boolean
          id: string
          id_country_of_issue?: string | null
          id_date_of_issue?: string | null
          id_expiry?: string | null
          id_issuing_authority?: string | null
          id_number?: string | null
          id_type?: string | null
          incorporation_country?: string | null
          incorporation_date?: string | null
          is_active?: boolean | null
          is_foreigner?: boolean | null
          is_organization?: boolean
          is_pbo?: boolean | null
          is_politically_exposed?: boolean
          kyc_docs?: Json | null
          languages_spoken?: string[] | null
          last_name?: string | null
          local_government?: string | null
          marital_status?: string | null
          monthly_income?: number | null
          nationality?: string | null
          nature_of_business?: string | null
          nature_of_corporate_business?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nin_number?: string | null
          occupation?: string | null
          pbo_referral_code?: string | null
          personally_sponsored_count?: number | null
          phone_number?: string | null
          political_exposure_details?: string | null
          profile_completed?: boolean | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          referred_by_code?: string | null
          referred_by_id?: string | null
          referrer_email?: string | null
          referrer_name?: string | null
          referrer_phone?: string | null
          registration_date?: string | null
          registration_expires_at?: string | null
          renewal_reminder_sent_at?: string | null
          residence_permit?: string | null
          sales_status?: string | null
          source_of_income?: string | null
          spouse_name?: string | null
          state_of_origin?: string | null
          team_size?: number | null
          terms_accepted?: boolean | null
          tin_number?: string | null
          total_commissions?: number | null
          total_personal_volume?: number | null
          updated_at?: string | null
          visa_status?: string | null
          wallet_balance?: number | null
        }
        Update: {
          account_locked?: boolean
          account_locked_at?: string | null
          account_locked_reason?: string | null
          address?: string | null
          aml_notes?: string | null
          aml_risk_rating?: string | null
          banking_details?: string | null
          birthday_reminder_sent_year?: number | null
          company_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          created_at?: string | null
          current_package?: string | null
          current_rank?: string | null
          current_residence?: string | null
          date_of_birth?: string | null
          employer_address?: string | null
          employer_country?: string | null
          employer_name?: string | null
          employment_role?: string | null
          employment_status?: string | null
          financial_crimes_details?: string | null
          first_name?: string | null
          gender?: string | null
          has_financial_crimes_history?: boolean
          id?: string
          id_country_of_issue?: string | null
          id_date_of_issue?: string | null
          id_expiry?: string | null
          id_issuing_authority?: string | null
          id_number?: string | null
          id_type?: string | null
          incorporation_country?: string | null
          incorporation_date?: string | null
          is_active?: boolean | null
          is_foreigner?: boolean | null
          is_organization?: boolean
          is_pbo?: boolean | null
          is_politically_exposed?: boolean
          kyc_docs?: Json | null
          languages_spoken?: string[] | null
          last_name?: string | null
          local_government?: string | null
          marital_status?: string | null
          monthly_income?: number | null
          nationality?: string | null
          nature_of_business?: string | null
          nature_of_corporate_business?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nin_number?: string | null
          occupation?: string | null
          pbo_referral_code?: string | null
          personally_sponsored_count?: number | null
          phone_number?: string | null
          political_exposure_details?: string | null
          profile_completed?: boolean | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          referred_by_code?: string | null
          referred_by_id?: string | null
          referrer_email?: string | null
          referrer_name?: string | null
          referrer_phone?: string | null
          registration_date?: string | null
          registration_expires_at?: string | null
          renewal_reminder_sent_at?: string | null
          residence_permit?: string | null
          sales_status?: string | null
          source_of_income?: string | null
          spouse_name?: string | null
          state_of_origin?: string | null
          team_size?: number | null
          terms_accepted?: boolean | null
          tin_number?: string | null
          total_commissions?: number | null
          total_personal_volume?: number | null
          updated_at?: string | null
          visa_status?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_id_fkey"
            columns: ["referred_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          property_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          property_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          property_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      property_reviews: {
        Row: {
          created_at: string | null
          dislikes: number | null
          id: string
          likes: number | null
          parent_id: string | null
          property_id: string
          property_type: string
          rating: number
          review_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          parent_id?: string | null
          property_id: string
          property_type?: string
          rating: number
          review_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          parent_id?: string | null
          property_id?: string
          property_type?: string
          rating?: number
          review_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "property_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          id: string
          ip_hash: string | null
          property_id: string
          property_type: string
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_hash?: string | null
          property_id: string
          property_type?: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_hash?: string | null
          property_id?: string
          property_type?: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: []
      }
      review_reactions: {
        Row: {
          created_at: string | null
          estate: string | null
          id: string
          reaction: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estate?: string | null
          id?: string
          reaction: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          estate?: string | null
          id?: string
          reaction?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "property_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      role_default_mailboxes: {
        Row: {
          created_at: string
          id: string
          mailbox_email: string
          mailbox_provider: string
          role_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          mailbox_email: string
          mailbox_provider?: string
          role_name: string
        }
        Update: {
          created_at?: string
          id?: string
          mailbox_email?: string
          mailbox_provider?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_default_mailboxes_role_name_fkey"
            columns: ["role_name"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          permission_key: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          permission_key: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          permission_key?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          label: string
          location: string | null
          max_price: number | null
          min_price: number | null
          property_category: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          location?: string | null
          max_price?: number | null
          min_price?: number | null
          property_category?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          location?: string | null
          max_price?: number | null
          min_price?: number | null
          property_category?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      training_attendance: {
        Row: {
          attendance_date: string | null
          attended: boolean | null
          certificate_issued: boolean | null
          certificate_issued_at: string | null
          completed: boolean | null
          created_at: string | null
          event_id: string | null
          id: string
          registration_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendance_date?: string | null
          attended?: boolean | null
          certificate_issued?: boolean | null
          certificate_issued_at?: string | null
          completed?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          registration_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendance_date?: string | null
          attended?: boolean | null
          certificate_issued?: boolean | null
          certificate_issued_at?: string | null
          completed?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          registration_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "training_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "training_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_events: {
        Row: {
          capacity: string
          category: string
          created_at: string | null
          date: string
          description: string | null
          featured: boolean | null
          id: string
          image: string | null
          location: string
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity: string
          category?: string
          created_at?: string | null
          date: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location: string
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: string
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location?: string
          time?: string
          title?: string
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
          referrer_email: string | null
          referrer_name: string | null
          referrer_phone: string | null
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
          referrer_email?: string | null
          referrer_name?: string | null
          referrer_phone?: string | null
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
          referrer_email?: string | null
          referrer_name?: string | null
          referrer_phone?: string | null
          registered_at?: string | null
          state?: string | null
        }
        Relationships: []
      }
      travel_bookings: {
        Row: {
          created_at: string
          departure_date: string
          destination: string | null
          email: string
          id: string
          name: string
          notes: string | null
          package: string
          phone: string
          return_date: string
          status: string
          travelers: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          departure_date: string
          destination?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          package: string
          phone: string
          return_date: string
          status?: string
          travelers: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          departure_date?: string
          destination?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          package?: string
          phone?: string
          return_date?: string
          status?: string
          travelers?: number
          updated_at?: string
        }
        Relationships: []
      }
      travel_package_blackouts: {
        Row: {
          created_at: string
          end_date: string
          id: string
          package: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          package: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          package?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "users_profile_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          admin_notes?: string | null
          amount: number
          bank_name: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      my_properties: {
        Row: {
          amount_paid: number | null
          balance: number | null
          created_at: string | null
          customer_email: string | null
          documentation_amount_paid: number | null
          documentation_name: string | null
          documentation_payment_reference: string | null
          documentation_payment_status: string | null
          documentation_price: number | null
          documentation_type_id: string | null
          item_property_id: string | null
          order_id: string | null
          payment_status: string | null
          plot_id: string | null
          property_name: string | null
          property_type: string | null
          quantity: number | null
          total_amount: number | null
          unit_price: number | null
          user_id: string | null
        }
        Relationships: []
      }
      pbo_referral_leaderboard: {
        Row: {
          current_package: string | null
          current_rank: string | null
          downline_count: number | null
          first_name: string | null
          last_initial: string | null
          pbo_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_approve_admin_request: {
        Args: {
          _decision: string
          _rejection_reason?: string
          _request_id: string
        }
        Returns: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          rejection_reason: string | null
          requested_at: string
          requested_role: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pending_admin_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_approve_payment_request: {
        Args: { _decision: string; _notes?: string; _request_id: string }
        Returns: Json
      }
      admin_approve_withdrawal: {
        Args: { _decision: string; _notes?: string; _request_id: string }
        Returns: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_get_estate_subscribers: {
        Args: { _estate_code?: string; _search?: string }
        Returns: {
          amount_paid: number
          client_email: string
          client_id: string
          estate_code: string
          estate_name: string
          order_id: string
          order_total: number
          outstanding_balance: number
          payment_plan: string
          plot_count: number
          subscribed_at: string
          subscriber_name: string
          subscription_amount: number
          subscription_number: string
          subscription_status: string
        }[]
      }
      admin_get_subscriber_history: {
        Args: { _order_id: string }
        Returns: {
          amount: number
          description: string
          documentation_name: string
          installment_amount_due: number
          installment_amount_paid: number
          installment_number: number
          installment_status: string
          payment_date: string
          payment_id: string
          payment_type: string
          reference: string
          status: string
        }[]
      }
      admin_has_permission: {
        Args: { _permission: string; _user_id?: string }
        Returns: boolean
      }
      admin_set_user_role: {
        Args: { _role: string; _target_user_id: string }
        Returns: undefined
      }
      admin_update_withdrawal_status: {
        Args: { p_admin_notes?: string; p_request_id: string; p_status: string }
        Returns: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      allocate_land_payment: {
        Args: { _amount: number; _order_id: string }
        Returns: Json
      }
      apply_flexible_installment_payment: {
        Args: { _amount: number; _order_id: string; _payment_id?: string }
        Returns: number
      }
      audit_bhrealtor_financials: {
        Args: { p_user_id?: string }
        Returns: {
          current_package: string
          expected_wallet: number
          is_reconciled: boolean
          ledger_available: number
          ledger_locked: number
          ledger_total_commissions: number
          ledger_withdrawn: number
          reserved_withdrawals: number
          total_commissions_variance: number
          user_id: string
          wallet_balance: number
          wallet_variance: number
        }[]
      }
      bhrealtor_has_completed_membership: {
        Args: { _user_id: string }
        Returns: boolean
      }
      bhrealtor_package_can_withdraw: {
        Args: { p_package: string }
        Returns: boolean
      }
      bhrealtor_package_rank: { Args: { p_package: string }; Returns: number }
      build_order_installment_schedule: {
        Args: {
          _months: number
          _order_id: string
          _start_date?: string
          _total_amount: number
        }
        Returns: undefined
      }
      can_approve_admin_request: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      can_approve_financial_requests: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      can_manage_admin_module: { Args: { _user_id?: string }; Returns: boolean }
      can_manage_admin_structure: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      can_manage_bhrealtor_financials: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      can_manage_bhrealtor_funnel: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      can_manage_departments: { Args: { _user_id?: string }; Returns: boolean }
      can_manage_mailboxes: { Args: { _user_id?: string }; Returns: boolean }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      clear_failed_logins: { Args: { clear_email: string }; Returns: undefined }
      count_users: { Args: never; Returns: number }
      create_authoritative_property_order_snapshot: {
        Args: {
          _listing_id: string
          _order_id: string
          _payment_plan?: string
          _quantity?: number
        }
        Returns: {
          amount_paid: number
          balance: number
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          items: Json
          payment_reference: string
          payment_status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_documentation_payment_request: {
        Args: { _order_id: string }
        Returns: Json
      }
      create_estate_subscription: {
        Args: {
          _amount: number
          _estate_code: string
          _estate_id: string
          _estate_key: string
          _estate_name: string
          _order_id: string
          _payment_plan: string
          _payment_request_id: string
          _status?: string
          _user_id: string
        }
        Returns: {
          amount: number
          created_at: string
          estate_code: string
          estate_id: string | null
          estate_name: string
          id: string
          order_id: string | null
          payment_plan: string | null
          payment_request_id: string | null
          subscribed_at: string
          subscription_number: string
          subscription_status: string
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "estate_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_user_profile: { Args: { user_id: number }; Returns: undefined }
      estate_code_from_name: { Args: { _name: string }; Returns: string }
      generate_order_installment_schedule: {
        Args: { _order_id: string }
        Returns: number
      }
      generate_order_installments: {
        Args: { _months: number; _order_id: string; _start_date?: string }
        Returns: undefined
      }
      get_admin_payment_request_details: {
        Args: { _request_id: string }
        Returns: Json
      }
      get_available_mailboxes: {
        Args: { _user_id: string }
        Returns: {
          is_connected: boolean
          mailbox_email: string
          mailbox_provider: string
        }[]
      }
      get_bhrealtor_admin_analytics: { Args: never; Returns: Json }
      get_documentation_payment_checkout: {
        Args: { _payment_id: string }
        Returns: Json
      }
      get_downline_ids: {
        Args: { root_id: string }
        Returns: {
          id: string
        }[]
      }
      get_my_bhrealtor_commission_history: {
        Args: { _limit?: number }
        Returns: Json
      }
      get_my_bhrealtor_dashboard: { Args: never; Returns: Json }
      get_my_bhrealtor_network_tree: {
        Args: { _limit?: number }
        Returns: Json
      }
      get_my_bhrealtor_withdrawals: { Args: { _limit?: number }; Returns: Json }
      get_my_property_installments: {
        Args: { _order_id: string }
        Returns: {
          amount_paid: number
          balance: number
          due_date: string
          id: string
          installment_number: number
          scheduled_amount: number
          status: string
        }[]
      }
      get_my_property_payment_timeline: {
        Args: { _order_id: string }
        Returns: {
          amount: number
          balance_after: number
          event_at: string
          event_id: string
          event_label: string
          event_type: string
          reference: string
          status: string
        }[]
      }
      get_order_installment_balance: {
        Args: { _order_id: string }
        Returns: {
          balance: number
          next_due_date: string
          next_installment_id: string
          order_id: string
          total_amount: number
          total_paid: number
        }[]
      }
      get_pbo_referral_leaderboard: {
        Args: never
        Returns: {
          current_package: string
          current_rank: string
          downline_count: number
          first_name: string
          last_initial: string
          pbo_id: string
        }[]
      }
      get_user_profile:
        | { Args: never; Returns: undefined }
        | {
            Args: { p_user_id: string }
            Returns: {
              profile: Json
            }[]
          }
        | {
            Args: { user_id: number }
            Returns: {
              email: string
              first_name: string
              id: number
              last_name: string
            }[]
          }
      get_withdrawal_funnel_stats: {
        Args: never
        Returns: {
          request_count: number
          status: string
          total_amount: number
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_account_locked: {
        Args: {
          check_email: string
          lockout_minutes?: number
          max_attempts?: number
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_global_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      list_all_users: {
        Args: never
        Returns: {
          email: string
          first_name: string
          id: number
          last_name: string
        }[]
      }
      list_privileged_mailbox_managers: {
        Args: never
        Returns: {
          email: string
          id: string
          legacy_role: string
          rbac_roles: string[]
        }[]
      }
      next_estate_subscription_number: {
        Args: {
          _estate_code: string
          _estate_key: string
          _estate_name: string
        }
        Returns: string
      }
      rebuild_order_installments: {
        Args: { _order_id: string }
        Returns: undefined
      }
      record_failed_login: {
        Args: { attempt_email: string; attempt_ip?: string }
        Returns: undefined
      }
      record_order_installment_payment: {
        Args: {
          _amount: number
          _order_id: string
          _payment_id?: string
          _reference: string
        }
        Returns: {
          amount_due: number
          amount_paid: number
          created_at: string
          due_date: string | null
          id: string
          installment_number: number
          order_id: string
          paid_at: string | null
          payment_id: string | null
          payment_reference: string | null
          payment_sequence: number | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "order_installments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      refresh_bhrealtor_network_counters: {
        Args: { p_root_id: string }
        Returns: undefined
      }
      resolve_payment_order: {
        Args: { _payment_request_id: string }
        Returns: {
          amount_paid: number
          balance: number
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          items: Json
          payment_reference: string
          payment_status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_estate_subscribers: {
        Args: { _estate_code?: string; _search?: string; _status?: string }
        Returns: {
          amount: number
          created_at: string
          estate_code: string
          estate_id: string | null
          estate_name: string
          id: string
          order_id: string | null
          payment_plan: string | null
          payment_request_id: string | null
          subscribed_at: string
          subscription_number: string
          subscription_status: string
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "estate_subscriptions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      submit_withdrawal_request: {
        Args: {
          p_account_name: string
          p_account_number: string
          p_amount: number
          p_bank_name: string
          p_user_id: string
        }
        Returns: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_business_user_role: { Args: { _user_id: string }; Returns: string }
      update_bhrealtor_package_price: {
        Args: { p_package_code: string; p_price: number }
        Returns: {
          created_at: string
          description: string
          direct_commission_pct: number
          first_level_sales_commission_pct: number
          indirect_commission_pct: number
          package_code: string
          package_name: string
          price: number
          sales_commission_locked: boolean
          sales_commission_pct: number
          withdrawable: boolean
        }
        SetofOptions: {
          from: "*"
          to: "mlm_packages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_user_profile: {
        Args: { first_name: string; last_name: string; user_id: number }
        Returns: undefined
      }
      user_has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
      user_mailbox_access: {
        Args: { _mailbox_email: string; _provider?: string; _user_id: string }
        Returns: boolean
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
    Enums: {
      app_role: ["admin", "staff", "pbo", "client"],
    },
  },
} as const

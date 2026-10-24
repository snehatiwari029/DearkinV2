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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      care_blocks: {
        Row: {
          assigned_user_id: string | null
          child_alias: string
          coverage_status: Database["public"]["Enums"]["coverage_status"]
          created_at: string
          created_by: string
          date: string
          end_time: string
          id: string
          start_time: string
          village_id: string
        }
        Insert: {
          assigned_user_id?: string | null
          child_alias: string
          coverage_status?: Database["public"]["Enums"]["coverage_status"]
          created_at?: string
          created_by?: string
          date: string
          end_time: string
          id?: string
          start_time: string
          village_id: string
        }
        Update: {
          assigned_user_id?: string | null
          child_alias?: string
          coverage_status?: Database["public"]["Enums"]["coverage_status"]
          created_at?: string
          created_by?: string
          date?: string
          end_time?: string
          id?: string
          start_time?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_blocks_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          caregiver_kind: Database["public"]["Enums"]["caregiver_kind"]
          created_at: string
          display_name: string
          expires_at: string
          id: string
          invited_email: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
          village_id: string
        }
        Insert: {
          caregiver_kind?: Database["public"]["Enums"]["caregiver_kind"]
          created_at?: string
          display_name: string
          expires_at?: string
          id?: string
          invited_email: string
          role: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
          village_id: string
        }
        Update: {
          caregiver_kind?: Database["public"]["Enums"]["caregiver_kind"]
          created_at?: string
          display_name?: string
          expires_at?: string
          id?: string
          invited_email?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_members: {
        Row: {
          caregiver_kind: Database["public"]["Enums"]["caregiver_kind"]
          created_at: string
          display_name: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string
          village_id: string
        }
        Insert: {
          caregiver_kind?: Database["public"]["Enums"]["caregiver_kind"]
          created_at?: string
          display_name: string
          id?: string
          role: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id: string
          village_id: string
        }
        Update: {
          caregiver_kind?: Database["public"]["Enums"]["caregiver_kind"]
          created_at?: string
          display_name?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_members_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          child_age_bracket: Database["public"]["Enums"]["age_bracket"]
          child_alias: string
          created_at: string
          created_by: string
          id: string
          name: string
          timezone: string
        }
        Insert: {
          child_age_bracket: Database["public"]["Enums"]["age_bracket"]
          child_alias: string
          created_at?: string
          created_by: string
          id?: string
          name?: string
          timezone?: string
        }
        Update: {
          child_age_bracket?: Database["public"]["Enums"]["age_bracket"]
          child_alias?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          timezone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { _token: string }; Returns: string }
      confirm_block: { Args: { _block: string }; Returns: undefined }
      create_village: {
        Args: {
          _alias: string
          _bracket: Database["public"]["Enums"]["age_bracket"]
          _display_name: string
          _name: string
          _pattern: string
          _tz: string
        }
        Returns: string
      }
      flag_conflict: { Args: { _block: string }; Returns: undefined }
      get_invite: {
        Args: { _token: string }
        Returns: {
          caregiver_kind: Database["public"]["Enums"]["caregiver_kind"]
          display_name: string
          invited_email: string
          role: Database["public"]["Enums"]["member_role"]
          valid: boolean
          village_name: string
        }[]
      }
      is_parent: { Args: { _village: string }; Returns: boolean }
      my_role: {
        Args: { _village: string }
        Returns: Database["public"]["Enums"]["member_role"]
      }
      remove_member: { Args: { _member: string }; Returns: undefined }
    }
    Enums: {
      age_bracket: "0-3mo" | "3-12mo" | "1-2y" | "2-5y"
      caregiver_kind: "nanny" | "family" | "sitter" | "none"
      coverage_status:
        | "needs_coverage"
        | "pending"
        | "confirmed"
        | "conflict_flagged"
        | "parent_covered"
        | "completed"
      invite_status: "pending" | "accepted" | "revoked"
      member_role: "parent_admin" | "co_parent" | "caregiver"
      member_status: "invited" | "active" | "removed"
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
      age_bracket: ["0-3mo", "3-12mo", "1-2y", "2-5y"],
      caregiver_kind: ["nanny", "family", "sitter", "none"],
      coverage_status: [
        "needs_coverage",
        "pending",
        "confirmed",
        "conflict_flagged",
        "parent_covered",
        "completed",
      ],
      invite_status: ["pending", "accepted", "revoked"],
      member_role: ["parent_admin", "co_parent", "caregiver"],
      member_status: ["invited", "active", "removed"],
    },
  },
} as const

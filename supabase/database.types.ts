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
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      activities: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean | null
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      attachments: {
        Row: {
          bug_id: string
          created_at: string | null
          id: string
          type: string | null
          url: string
        }
        Insert: {
          bug_id: string
          created_at?: string | null
          id?: string
          type?: string | null
          url: string
        }
        Update: {
          bug_id?: string
          created_at?: string | null
          id?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_bug_id_fkey"
            columns: ["bug_id"]
            isOneToOne: false
            referencedRelation: "bugs"
            referencedColumns: ["id"]
          },
        ]
      }
      bugs: {
        Row: {
          actual_result: string | null
          assigned_to: string | null
          bug_id: string | null
          bug_number: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_result: string | null
          id: string
          priority: Database["public"]["Enums"]["bug_priority"] | null
          project_id: string
          result: string | null
          severity: Database["public"]["Enums"]["bug_severity"] | null
          status: Database["public"]["Enums"]["bug_status"] | null
          steps_to_reproduce: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_result?: string | null
          assigned_to?: string | null
          bug_id?: string | null
          bug_number?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["bug_priority"] | null
          project_id: string
          result?: string | null
          severity?: Database["public"]["Enums"]["bug_severity"] | null
          status?: Database["public"]["Enums"]["bug_status"] | null
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_result?: string | null
          assigned_to?: string | null
          bug_id?: string | null
          bug_number?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["bug_priority"] | null
          project_id?: string
          result?: string | null
          severity?: Database["public"]["Enums"]["bug_severity"] | null
          status?: Database["public"]["Enums"]["bug_status"] | null
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bugs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          bug_id: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          bug_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          bug_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_bug_id_fkey"
            columns: ["bug_id"]
            isOneToOne: false
            referencedRelation: "bugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_profiles"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          closed_bugs: number | null
          open_bugs: number | null
          total_bugs: number | null
          total_projects: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_activity: {
        Args: {
          p_action_type: string
          p_description?: string
          p_entity_id: string
          p_entity_type: string
          p_title: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      bug_priority: "Highest" | "High" | "Medium" | "Low"
      bug_result: "Confirmed" | "Closed" | "Unresolved" | "To-Do"
      bug_severity: "Crash/Undoable" | "High" | "Medium" | "Low" | "Suggestion"
      bug_status:
        | "Open"
        | "New"
        | "Blocked"
        | "Not A Bug"
        | "Could Not Reproduce"
        | "Fixed"
        | "To Fix in Update"
        | "Will Not Fix"
        | "In Progress"
      user_role: "QA" | "Developer" | "Manager"
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
      bug_priority: ["Highest", "High", "Medium", "Low"],
      bug_result: ["Confirmed", "Closed", "Unresolved", "To-Do"],
      bug_severity: ["Crash/Undoable", "High", "Medium", "Low", "Suggestion"],
      bug_status: [
        "Open",
        "New",
        "Blocked",
        "Not A Bug",
        "Could Not Reproduce",
        "Fixed",
        "To Fix in Update",
        "Will Not Fix",
        "In Progress",
      ],
      user_role: ["QA", "Developer", "Manager"],
    },
  },
} as const

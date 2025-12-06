// supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ActivityActionType =
  | 'bug_created'
  | 'bug_updated'
  | 'bug_deleted'
  | 'comment_added'
  | 'status_changed';

export type ActivityEntityType = 'bug' | 'comment' | 'project';

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      attachments: {
        Row: {
          bug_id: string;
          created_at: string | null;
          id: string;
          type: string | null;
          url: string;
        };
        Insert: {
          bug_id: string;
          created_at?: string | null;
          id?: string;
          type?: string | null;
          url: string;
        };
        Update: {
          bug_id?: string;
          created_at?: string | null;
          id?: string;
          type?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          }
        ];
      };

      bug_activity: {
        Row: {
          action: string;
          bug_id: string;
          created_at: string | null;
          details: Json | null;
          id: string;
          user_id: string;
        };
        Insert: {
          action: string;
          bug_id: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          user_id: string;
        };
        Update: {
          action?: string;
          bug_id?: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_activity_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bug_activity_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      bug_attachments: {
        Row: {
          bug_id: string;
          created_at: string | null;
          file_name: string;
          file_size: number | null;
          file_type: string | null;
          file_url: string;
          id: string;
          uploaded_by: string;
        };
        Insert: {
          bug_id: string;
          created_at?: string | null;
          file_name: string;
          file_size?: number | null;
          file_type?: string | null;
          file_url: string;
          id?: string;
          uploaded_by: string;
        };
        Update: {
          bug_id?: string;
          created_at?: string | null;
          file_name?: string;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string;
          id?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_attachments_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bug_attachments_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      bug_comments: {
        Row: {
          bug_id: string;
          content: string;
          created_at: string | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          bug_id: string;
          content: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          bug_id?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_comments_bug_id_fkey";
            columns: ["bug_id"];
            isOneToOne: false;
            referencedRelation: "bugs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bug_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      bugs: {
        Row: {
          project: any;
          actual_result: string | null;
          assigned_to: string | null;
          bug_id: string | null;
          bug_number: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          expected_result: string | null;
          id: string;
          priority: Database["public"]["Enums"]["bug_priority"] | null;
          project_id: string;
          result: string | null;
          severity: Database["public"]["Enums"]["bug_severity"] | null;
          status: Database["public"]["Enums"]["bug_status"] | null;
          steps_to_reproduce: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          actual_result?: string | null;
          assigned_to?: string | null;
          bug_id?: string | null;
          bug_number?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          expected_result?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["bug_priority"] | null;
          project_id: string;
          result?: string | null;
          severity?: Database["public"]["Enums"]["bug_severity"] | null;
          status?: Database["public"]["Enums"]["bug_status"] | null;
          steps_to_reproduce?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          actual_result?: string | null;
          assigned_to?: string | null;
          bug_id?: string | null;
          bug_number?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          expected_result?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["bug_priority"] | null;
          project_id?: string;
          result?: string | null;
          severity?: Database["public"]["Enums"]["bug_severity"] | null;
          status?: Database["public"]["Enums"]["bug_status"] | null;
          steps_to_reproduce?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bugs_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bugs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bugs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };

      bugs_backup: {
        Row: {
          actual_result: string | null;
          assigned_to: string | null;
          bug_number: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          expected_result: string | null;
          id: string | null;
          priority: Database["public"]["Enums"]["bug_priority"] | null;
          project_id: string | null;
          result: string | null;
          severity: Database["public"]["Enums"]["bug_severity"] | null;
          steps_to_reproduce: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          actual_result?: string | null;
          assigned_to?: string | null;
          bug_number?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          expected_result?: string | null;
          id?: string | null;
          priority?: Database["public"]["Enums"]["bug_priority"] | null;
          project_id?: string | null;
          result?: string | null;
          severity?: Database["public"]["Enums"]["bug_severity"] | null;
          steps_to_reproduce?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          actual_result?: string | null;
          assigned_to?: string | null;
          bug_number?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          expected_result?: string | null;
          id?: string | null;
          priority?: Database["public"]["Enums"]["bug_priority"] | null;
          project_id?: string | null;
          result?: string | null;
          severity?: Database["public"]["Enums"]["bug_severity"] | null;
          steps_to_reproduce?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      comments: {
  Row: {
    id: string;
    bug_id: string;
    content: string;
    created_at: string | null;
    created_by: string | null;
  };
  Insert: {
    bug_id: string;
    content: string;
    created_at?: string | null;
    id?: string;
    created_by?: string | null;
  };
  Update: {
    bug_id?: string;
    content?: string;
    created_at?: string | null;
    id?: string;
    created_by?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "comments_bug_id_fkey";
      columns: ["bug_id"];
      referencedRelation: "bugs";
      referencedColumns: ["id"];
    }
  ];
};
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      projects: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          name: string;
          project_number: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          project_number?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          project_number?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // Tambahkan tabel activities
      activities: {
        Row: {
          id: string;
          user_id: string;
          action_type: ActivityActionType;
          entity_type: ActivityEntityType;
          entity_id: string;
          title: string;
          description: string | null;
          metadata: Record<string, any> | null;
          is_read: boolean;
          created_at: string;
        };
         Insert: {
    user_id: string;
    action_type: ActivityActionType;
    entity_type: ActivityEntityType;
    entity_id: string;
    title: string;
    description?: string | null;
    metadata?: Record<string, any> | null;
    is_read?: boolean;
  };
       Update: Partial<{
    id: string;
    user_id: string;
    action_type: ActivityActionType;
    entity_type: ActivityEntityType;
    entity_id: string;
    title: string;
    description: string | null;
    metadata: Record<string, any> | null;
    is_read: boolean;
    created_at: string;
  }>;
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      bug_priority: "Highest" | "High" | "Medium" | "Low";
      bug_result: "Confirmed" | "Closed" | "Unresolved" | "To-Do";
      bug_severity: "Crash/Undoable" | "High" | "Medium" | "Low" | "Suggestion";
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
        | "Unresolved";
      user_role: "QA" | "Developer" | "Manager";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

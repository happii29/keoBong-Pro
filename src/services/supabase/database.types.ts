export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          phone: string | null;
          zalo_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          phone?: string | null;
          zalo_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          phone?: string | null;
          zalo_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: Database["public"]["Enums"]["team_plan"];
          timezone: string;
          area: string | null;
          default_format: Database["public"]["Enums"]["match_format"];
          home_venue_name: string | null;
          fixed_schedule: Json;
          zalo_group_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: Database["public"]["Enums"]["team_plan"];
          timezone?: string;
          area?: string | null;
          default_format?: Database["public"]["Enums"]["match_format"];
          home_venue_name?: string | null;
          fixed_schedule?: Json;
          zalo_group_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: Database["public"]["Enums"]["team_plan"];
          timezone?: string;
          area?: string | null;
          default_format?: Database["public"]["Enums"]["match_format"];
          home_venue_name?: string | null;
          fixed_schedule?: Json;
          zalo_group_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["team_role"];
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["team_role"];
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_invites: {
        Row: {
          id: string;
          team_id: string;
          token: string;
          role: Database["public"]["Enums"]["team_role"];
          expires_at: string;
          max_uses: number;
          used_count: number;
          revoked_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          token: string;
          role?: Database["public"]["Enums"]["team_role"];
          expires_at: string;
          max_uses?: number;
          used_count?: number;
          revoked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          token?: string;
          role?: Database["public"]["Enums"]["team_role"];
          expires_at?: string;
          max_uses?: number;
          used_count?: number;
          revoked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          user_id: string | null;
          display_name: string;
          phone: string | null;
          zalo_name: string | null;
          shirt_number: number | null;
          position: Database["public"]["Enums"]["player_position"] | null;
          level: number;
          status: Database["public"]["Enums"]["player_status"];
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id?: string | null;
          display_name: string;
          phone?: string | null;
          zalo_name?: string | null;
          shirt_number?: number | null;
          position?: Database["public"]["Enums"]["player_position"] | null;
          level?: number;
          status?: Database["public"]["Enums"]["player_status"];
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string | null;
          display_name?: string;
          phone?: string | null;
          zalo_name?: string | null;
          shirt_number?: number | null;
          position?: Database["public"]["Enums"]["player_position"] | null;
          level?: number;
          status?: Database["public"]["Enums"]["player_status"];
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          team_id: string;
          opponent_name: string | null;
          venue_name: string | null;
          starts_at: string;
          format: Database["public"]["Enums"]["match_format"];
          min_players: number;
          status: Database["public"]["Enums"]["match_status"];
          notes: string | null;
          team_score: number | null;
          opponent_score: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          opponent_name?: string | null;
          venue_name?: string | null;
          starts_at: string;
          format?: Database["public"]["Enums"]["match_format"];
          min_players?: number;
          status?: Database["public"]["Enums"]["match_status"];
          notes?: string | null;
          team_score?: number | null;
          opponent_score?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          opponent_name?: string | null;
          venue_name?: string | null;
          starts_at?: string;
          format?: Database["public"]["Enums"]["match_format"];
          min_players?: number;
          status?: Database["public"]["Enums"]["match_status"];
          notes?: string | null;
          team_score?: number | null;
          opponent_score?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          match_id: string;
          team_id: string;
          player_id: string;
          user_id: string | null;
          status: Database["public"]["Enums"]["attendance_status"];
          note: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          team_id: string;
          player_id: string;
          user_id?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
          note?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          team_id?: string;
          player_id?: string;
          user_id?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
          note?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fund_transactions: {
        Row: {
          id: string;
          team_id: string;
          match_id: string | null;
          player_id: string | null;
          type: Database["public"]["Enums"]["fund_transaction_type"];
          category: string;
          title: string;
          amount_vnd: number;
          transaction_date: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          match_id?: string | null;
          player_id?: string | null;
          type: Database["public"]["Enums"]["fund_transaction_type"];
          category: string;
          title: string;
          amount_vnd: number;
          transaction_date?: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          match_id?: string | null;
          player_id?: string | null;
          type?: Database["public"]["Enums"]["fund_transaction_type"];
          category?: string;
          title?: string;
          amount_vnd?: number;
          transaction_date?: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      player_stats: {
        Row: {
          id: string;
          team_id: string;
          match_id: string;
          player_id: string;
          goals: number;
          assists: number;
          mvp: boolean;
          rating: number | null;
          minutes_played: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          match_id: string;
          player_id: string;
          goals?: number;
          assists?: number;
          mvp?: boolean;
          rating?: number | null;
          minutes_played?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          match_id?: string;
          player_id?: string;
          goals?: number;
          assists?: number;
          mvp?: boolean;
          rating?: number | null;
          minutes_played?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      automation_settings: {
        Row: {
          id: string;
          team_id: string;
          automation_enabled: boolean;
          webhook_url: string | null;
          webhook_secret: string | null;
          workflows: Json;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          automation_enabled?: boolean;
          webhook_url?: string | null;
          webhook_secret?: string | null;
          workflows?: Json;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          automation_enabled?: boolean;
          webhook_url?: string | null;
          webhook_secret?: string | null;
          workflows?: Json;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_team_with_owner: {
        Args: {
          team_name: string;
          team_slug: string;
          team_area?: string | null;
          team_default_format?: Database["public"]["Enums"]["match_format"];
          team_home_venue_name?: string | null;
          team_fixed_schedule?: Json;
        };
        Returns: {
          created_team_id: string;
          created_team_slug: string;
        }[];
      };
      join_team_by_slug: {
        Args: {
          team_slug: string;
        };
        Returns: {
          joined_team_id: string;
          joined_team_slug: string;
        }[];
      };
      accept_team_invite: {
        Args: {
          invite_token: string;
        };
        Returns: {
          joined_team_id: string;
          joined_team_slug: string;
        }[];
      };
      has_team_role: {
        Args: {
          target_team_id: string;
          allowed_roles: Database["public"]["Enums"]["team_role"][];
        };
        Returns: boolean;
      };
      is_player_owner: {
        Args: { target_player_id: string };
        Returns: boolean;
      };
      is_team_member: {
        Args: { target_team_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      attendance_status: "pending" | "going" | "absent" | "late" | "goalkeeper";
      automation_workflow_status: "ready" | "scheduled" | "paused" | "warning";
      fund_transaction_type: "income" | "expense";
      match_format: "5v5" | "7v7" | "9v9" | "11v11" | "other";
      match_status: "draft" | "scheduled" | "locked" | "completed" | "cancelled";
      player_position: "GK" | "CB" | "LB" | "RB" | "DM" | "CM" | "AM" | "LW" | "RW" | "ST";
      player_status: "active" | "injured" | "inactive" | "left";
      team_plan: "free" | "pro" | "club";
      team_role: "owner" | "manager" | "captain" | "member" | "viewer";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TTable extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TTable]["Row"];

export type Inserts<TTable extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TTable]["Insert"];

export type Updates<TTable extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TTable]["Update"];

export type Enums<TEnum extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][TEnum];

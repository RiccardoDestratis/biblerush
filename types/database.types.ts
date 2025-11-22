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
      game_players: {
        Row: {
          game_id: string | null
          id: string
          joined_at: string | null
          player_name: string
          total_score: number | null
        }
        Insert: {
          game_id?: string | null
          id?: string
          joined_at?: string | null
          player_name: string
          total_score?: number | null
        }
        Update: {
          game_id?: string | null
          id?: string
          joined_at?: string | null
          player_name?: string
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_question_index: number | null
          host_id: string | null
          id: string
          question_count: number
          question_set_id: string | null
          room_code: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_question_index?: number | null
          host_id?: string | null
          id?: string
          question_count: number
          question_set_id?: string | null
          room_code: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_question_index?: number | null
          host_id?: string | null
          id?: string
          question_count?: number
          question_set_id?: string | null
          room_code?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_question_set_id_fkey"
            columns: ["question_set_id"]
            isOneToOne: false
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      player_answers: {
        Row: {
          answered_at: string | null
          game_id: string | null
          id: string
          is_correct: boolean | null
          player_id: string | null
          points_earned: number | null
          question_id: string | null
          response_time_ms: number | null
          selected_answer: string | null
        }
        Insert: {
          answered_at?: string | null
          game_id?: string | null
          id?: string
          is_correct?: boolean | null
          player_id?: string | null
          points_earned?: number | null
          question_id?: string | null
          response_time_ms?: number | null
          selected_answer?: string | null
        }
        Update: {
          answered_at?: string | null
          game_id?: string | null
          id?: string
          is_correct?: boolean | null
          player_id?: string | null
          points_earned?: number | null
          question_id?: string | null
          response_time_ms?: number | null
          selected_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_answers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_sets: {
        Row: {
          created_at: string | null
          description: string | null
          description_de: string | null
          description_en: string | null
          description_it: string | null
          difficulty: string | null
          id: string
          is_published: boolean | null
          name_de: string | null
          name_en: string
          name_it: string | null
          question_count: number | null
          tier_required: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          description_it?: string | null
          difficulty?: string | null
          id?: string
          is_published?: boolean | null
          name_de?: string | null
          name_en: string
          name_it?: string | null
          question_count?: number | null
          tier_required?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_de?: string | null
          description_en?: string | null
          description_it?: string | null
          difficulty?: string | null
          id?: string
          is_published?: boolean | null
          name_de?: string | null
          name_en?: string
          name_it?: string | null
          question_count?: number | null
          tier_required?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          id: string
          image_location: string | null
          image_prompt: string | null
          image_style: string | null
          is_custom_image: boolean | null
          option_a_de: string | null
          option_a_en: string
          option_a_it: string | null
          option_b_de: string | null
          option_b_en: string
          option_b_it: string | null
          option_c_de: string | null
          option_c_en: string
          option_c_it: string | null
          option_d_de: string | null
          option_d_en: string
          option_d_it: string | null
          order_index: number | null
          question_de: string | null
          question_en: string
          question_it: string | null
          question_set_id: string | null
          right_answer_de: string | null
          right_answer_en: string
          right_answer_it: string | null
          verse_content_de: string | null
          verse_content_en: string | null
          verse_content_it: string | null
          verse_reference_de: string | null
          verse_reference_en: string | null
          verse_reference_it: string | null
          video_location: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          id?: string
          image_location?: string | null
          image_prompt?: string | null
          image_style?: string | null
          is_custom_image?: boolean | null
          option_a_de?: string | null
          option_a_en: string
          option_a_it?: string | null
          option_b_de?: string | null
          option_b_en: string
          option_b_it?: string | null
          option_c_de?: string | null
          option_c_en: string
          option_c_it?: string | null
          option_d_de?: string | null
          option_d_en: string
          option_d_it?: string | null
          order_index?: number | null
          question_de?: string | null
          question_en: string
          question_it?: string | null
          question_set_id?: string | null
          right_answer_de?: string | null
          right_answer_en: string
          right_answer_it?: string | null
          verse_content_de?: string | null
          verse_content_en?: string | null
          verse_content_it?: string | null
          verse_reference_de?: string | null
          verse_reference_en?: string | null
          verse_reference_it?: string | null
          video_location?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          id?: string
          image_location?: string | null
          image_prompt?: string | null
          image_style?: string | null
          is_custom_image?: boolean | null
          option_a_de?: string | null
          option_a_en?: string
          option_a_it?: string | null
          option_b_de?: string | null
          option_b_en?: string
          option_b_it?: string | null
          option_c_de?: string | null
          option_c_en?: string
          option_c_it?: string | null
          option_d_de?: string | null
          option_d_en?: string
          option_d_it?: string | null
          order_index?: number | null
          question_de?: string | null
          question_en?: string
          question_it?: string | null
          question_set_id?: string | null
          right_answer_de?: string | null
          right_answer_en?: string
          right_answer_it?: string | null
          verse_content_de?: string | null
          verse_content_en?: string | null
          verse_content_it?: string | null
          verse_reference_de?: string | null
          verse_reference_en?: string | null
          verse_reference_it?: string | null
          video_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_question_set_id_fkey"
            columns: ["question_set_id"]
            isOneToOne: false
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          is_admin: boolean | null
          locale_preference: string | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          locale_preference?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          locale_preference?: string | null
          tier?: string | null
          updated_at?: string | null
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
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
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

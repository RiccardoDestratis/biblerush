/**
 * TypeScript types for Supabase Realtime events
 * Used for type-safe event handling in game channels
 * 
 * Note: Database types come from Supabase generated types (types/database.types.ts)
 * These types are only for custom Realtime broadcast events (not in database schema)
 */

import type { Tables } from "@/types/database.types";

/**
 * Realtime event names for game channels
 */
export type RealtimeEvent =
  | "player_joined"
  | "game_start"
  | "question_advance"
  | "game_end";

/**
 * Payload for player_joined event
 * Uses database types for player data
 */
export interface PlayerJoinedPayload {
  playerId: string; // From game_players.id
  playerName: string; // From game_players.player_name
}

/**
 * Payload for game_start event
 */
export interface GameStartPayload {
  startedAt: string; // ISO timestamp
}

/**
 * Payload for question_advance event
 * Uses database types for question data
 */
export interface QuestionAdvancePayload {
  questionIndex: number; // From games.current_question_index
  questionData: {
    id: string; // From questions.id
    question: string; // From questions.question_text
    options: string[]; // From questions.option_a, option_b, option_c, option_d
    correctAnswer: string; // From questions.correct_answer
    scriptureReference?: string; // From questions.scripture_reference
  };
}

/**
 * Payload for game_end event
 */
export interface GameEndPayload {
  completedAt: string; // ISO timestamp
}

/**
 * Union type for all event payloads
 */
export type RealtimeEventPayload =
  | PlayerJoinedPayload
  | GameStartPayload
  | QuestionAdvancePayload
  | GameEndPayload;

/**
 * Callback function type for realtime event handlers
 */
export type RealtimeEventHandler<T extends RealtimeEventPayload = RealtimeEventPayload> = (
  payload: T
) => void;

/**
 * Callbacks object for subscribing to game channel events
 */
export interface GameChannelCallbacks {
  onPlayerJoined?: RealtimeEventHandler<PlayerJoinedPayload>;
  onGameStart?: RealtimeEventHandler<GameStartPayload>;
  onQuestionAdvance?: RealtimeEventHandler<QuestionAdvancePayload>;
  onGameEnd?: RealtimeEventHandler<GameEndPayload>;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

/**
 * Connection status for realtime channels
 */
export type ConnectionStatus = "connected" | "reconnecting" | "failed" | "disconnected";


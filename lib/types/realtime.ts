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
  | "player_removed"
  | "player_renamed"
  | "game_start"
  | "question_advance"
  | "game_end"
  | "timer_expired";

/**
 * Payload for player_joined event
 * Uses database types for player data
 */
export interface PlayerJoinedPayload {
  playerId: string; // From game_players.id
  playerName: string; // From game_players.player_name
}

/**
 * Payload for player_removed event
 */
export interface PlayerRemovedPayload {
  playerId: string; // From game_players.id
}

/**
 * Payload for player_renamed event
 */
export interface PlayerRenamedPayload {
  playerId: string; // From game_players.id
  newName: string; // New player name
}

/**
 * Payload for game_start event
 */
export interface GameStartPayload {
  questionId: string; // UUID from questions.id
  questionText: string; // From questions.question_en
  options: string[]; // [optionA, optionB, optionC, optionD]
  questionNumber: number; // e.g., 1 of 15
  timerDuration: number; // 15 seconds
  startedAt: string; // ISO timestamp (server timestamp for synchronization)
  questionSetId?: string; // UUID of question set (for pre-loading)
  totalQuestions: number; // Total number of questions in the game (from games.question_count)
}

/**
 * Payload for question_advance event
 * Uses database types for question data
 */
export interface QuestionAdvancePayload {
  questionIndex: number; // From games.current_question_index (0-based)
  questionNumber: number; // Display question number (1-based, e.g., "Question 3 of 15")
  questionId: string; // From questions.id
  questionText: string; // From questions.question_en
  options: string[]; // From questions.option_a_en, option_b_en, option_c_en, option_d_en
  correctAnswer: string; // From questions.correct_answer
  scriptureReference?: string; // From questions.verse_reference_en
  timerDuration: number; // Timer duration in seconds (15)
  startedAt: string; // ISO timestamp (server timestamp for synchronization)
  totalQuestions: number; // Total questions in game (from games.question_count)
}

/**
 * Payload for game_end event
 */
export interface GameEndPayload {
  completedAt: string; // ISO timestamp
}

/**
 * Payload for timer_expired event
 */
export interface TimerExpiredPayload {
  questionId: string; // UUID from questions.id
  questionNumber: number; // Current question number
  timestamp: string; // ISO timestamp when timer expired
}

/**
 * Union type for all event payloads
 */
export type RealtimeEventPayload =
  | PlayerJoinedPayload
  | PlayerRemovedPayload
  | PlayerRenamedPayload
  | GameStartPayload
  | QuestionAdvancePayload
  | GameEndPayload
  | TimerExpiredPayload;

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
  onPlayerRemoved?: RealtimeEventHandler<PlayerRemovedPayload>;
  onPlayerRenamed?: RealtimeEventHandler<PlayerRenamedPayload>;
  onGameStart?: RealtimeEventHandler<GameStartPayload>;
  onQuestionAdvance?: RealtimeEventHandler<QuestionAdvancePayload>;
  onGameEnd?: RealtimeEventHandler<GameEndPayload>;
  onTimerExpired?: RealtimeEventHandler<TimerExpiredPayload>;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

/**
 * Connection status for realtime channels
 */
export type ConnectionStatus = "connected" | "reconnecting" | "failed" | "disconnected";


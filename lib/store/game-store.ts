"use client";

import { create } from "zustand";
import type { GameStartPayload } from "@/lib/types/realtime";

/**
 * Question data structure
 */
export interface QuestionData {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  scriptureReference?: string;
}

/**
 * Game store state
 */
interface GameState {
  // Current question data
  currentQuestion: QuestionData | null;
  
  // Question metadata
  questionNumber: number;
  totalQuestions: number;
  timerDuration: number;
  startedAt: string | null; // Server timestamp for timer synchronization
  
  // Game status
  gameStatus: "waiting" | "active" | "ended";
  
  // Pre-loaded questions (for Epic 4 image loading)
  preloadedQuestions: QuestionData[];
  
  // Actions
  setCurrentQuestion: (question: QuestionData) => void;
  startGame: (questionData: GameStartPayload, totalQuestions: number) => void;
  setGameStatus: (status: "waiting" | "active" | "ended") => void;
  addPreloadedQuestion: (question: QuestionData) => void;
  clearPreloadedQuestions: () => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 0,
  timerDuration: 15,
  startedAt: null,
  gameStatus: "waiting" as const,
  preloadedQuestions: [],
};

/**
 * Zustand game store
 * Manages game state accessible from both host and player views
 */
export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  /**
   * Set current question data
   */
  setCurrentQuestion: (question: QuestionData) =>
    set({
      currentQuestion: question,
    }),

  /**
   * Start game with first question
   */
  startGame: (questionData: GameStartPayload, totalQuestions: number) =>
    set({
      currentQuestion: {
        id: questionData.questionId,
        questionText: questionData.questionText,
        options: questionData.options,
        correctAnswer: "", // Will be set when question is revealed
        scriptureReference: undefined, // Will be set when question is loaded
      },
      questionNumber: questionData.questionNumber,
      totalQuestions,
      timerDuration: questionData.timerDuration,
      startedAt: questionData.startedAt,
      gameStatus: "active",
    }),

  /**
   * Set game status
   */
  setGameStatus: (status: "waiting" | "active" | "ended") =>
    set({
      gameStatus: status,
    }),

  /**
   * Add pre-loaded question
   */
  addPreloadedQuestion: (question: QuestionData) =>
    set((state) => ({
      preloadedQuestions: [...state.preloadedQuestions, question],
    })),

  /**
   * Clear pre-loaded questions
   */
  clearPreloadedQuestions: () =>
    set({
      preloadedQuestions: [],
    }),

  /**
   * Reset store to initial state
   */
  reset: () => set(initialState),
}));


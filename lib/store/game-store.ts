"use client";

import { create } from "zustand";
import type { GameStartPayload, QuestionAdvancePayload } from "@/lib/types/realtime";

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
  
  // Pause state
  isPaused: boolean;
  pausedAt: string | null; // ISO timestamp when pause occurred
  pauseDuration: number; // Total paused time in seconds (accumulated)
  
  // Reveal state (Story 3.2)
  revealState: "question" | "reveal" | "leaderboard" | "results";
  correctAnswer: string | null; // Correct answer letter: 'A', 'B', 'C', or 'D'
  answerContent: string | null; // Full text content of the correct answer
  showSource: boolean; // Whether to show verse source (reference + content)
  verseReference: string | null; // Scripture reference (e.g., "Matthew 2:1")
  verseContent: string | null; // Full verse text content
  
  // Previous ranks for rank change calculation (Story 3.4)
  previousRanks: Record<string, number>; // Maps playerId to previous rank
  
  // Pre-loaded questions (for Epic 4 image loading)
  preloadedQuestions: QuestionData[];
  
  // Actions
  setCurrentQuestion: (question: QuestionData) => void;
  startGame: (questionData: GameStartPayload, totalQuestions: number) => void;
  advanceQuestion: (questionData: QuestionAdvancePayload) => void;
  setGameStatus: (status: "waiting" | "active" | "ended") => void;
  setPaused: (pausedAt: string) => void; // Set isPaused = true, record pausedAt
  setResumed: (resumedAt: string) => void; // Set isPaused = false, calculate pauseDuration
  setRevealState: (state: "question" | "reveal" | "leaderboard" | "results") => void;
  setCorrectAnswer: (
    answer: string, 
    answerContent: string,
    showSource: boolean,
    verseReference: string | null,
    verseContent: string | null
  ) => void;
  setPreviousRanks: (ranks: Record<string, number>) => void;
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
  isPaused: false,
  pausedAt: null,
  pauseDuration: 0,
  revealState: "question" as const,
  correctAnswer: null,
  answerContent: null,
  showSource: false,
  verseReference: null,
  verseContent: null,
  previousRanks: {},
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
   * Advance to next question
   */
  advanceQuestion: (questionData: QuestionAdvancePayload) => {
    console.log(`[GameStore] 🔄 advanceQuestion called: question ${questionData.questionNumber}`);
    console.log(`[GameStore] 📝 Setting revealState: "leaderboard" → "question"`);
    return set({
      currentQuestion: {
        id: questionData.questionId,
        questionText: questionData.questionText,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        scriptureReference: questionData.scriptureReference,
      },
      questionNumber: questionData.questionNumber,
      totalQuestions: questionData.totalQuestions,
      timerDuration: questionData.timerDuration,
      startedAt: questionData.startedAt,
      // Reset pause state when advancing
      isPaused: false,
      pausedAt: null,
      pauseDuration: 0,
      // Reset reveal state when advancing to new question
      revealState: "question",
      correctAnswer: null,
      answerContent: null,
      showSource: false,
      verseReference: null,
      verseContent: null,
      // Keep gameStatus as "active" (will change to "ended" when game ends)
    });
  },

  /**
   * Set game status
   */
  setGameStatus: (status: "waiting" | "active" | "ended") =>
    set({
      gameStatus: status,
    }),

  /**
   * Set game as paused
   */
  setPaused: (pausedAt: string) =>
    set({
      isPaused: true,
      pausedAt,
    }),

  /**
   * Set game as resumed
   */
  setResumed: (resumedAt: string) =>
    set((state) => {
      if (!state.pausedAt) {
        // If no pausedAt, just clear pause state
        return {
          isPaused: false,
          pausedAt: null,
        };
      }
      // Calculate pause duration
      const pauseStart = new Date(state.pausedAt).getTime();
      const pauseEnd = new Date(resumedAt).getTime();
      const duration = Math.floor((pauseEnd - pauseStart) / 1000);
      
      return {
        isPaused: false,
        pausedAt: null,
        pauseDuration: state.pauseDuration + duration,
      };
    }),

  /**
   * Set reveal state (Story 3.2)
   */
  setRevealState: (state: "question" | "reveal" | "leaderboard" | "results") => {
    console.log(`[GameStore] 📝 setRevealState: "${state}"`);
    return set({
      revealState: state,
    });
  },

  /**
   * Set correct answer, answer content, and verse information (Story 3.2)
   */
  setCorrectAnswer: (
    answer: string,
    answerContent: string,
    showSource: boolean,
    verseReference: string | null,
    verseContent: string | null
  ) =>
    set({
      correctAnswer: answer,
      answerContent: answerContent,
      showSource: showSource,
      verseReference: verseReference,
      verseContent: verseContent,
    }),

  /**
   * Set previous ranks for rank change calculation (Story 3.4)
   */
  setPreviousRanks: (ranks: Record<string, number>) =>
    set({
      previousRanks: ranks,
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


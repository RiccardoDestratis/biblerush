"use client";

import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { PlayerWaitingView } from "@/components/game/player-waiting-view";
import { QuestionDisplayPlayer } from "@/components/game/question-display-player";
import { PlayerAnswerFeedback } from "@/components/game/player-answer-feedback";
import { AnswerRevealPlayer } from "@/components/game/answer-reveal-player";
import { LeaderboardPlayer } from "@/components/game/leaderboard-player";
import { FinalResultsPlayer } from "@/components/game/final-results-player";
import { subscribeToGame } from "@/lib/supabase/realtime";
import type { AnswerRevealPayload, LeaderboardReadyPayload, QuestionAdvancePayload, GameEndPayload, GameStartPayload } from "@/lib/types/realtime";
import { getPlayerAnswerResult } from "@/lib/actions/answers";
import { GameErrorBoundary } from "@/components/game/error-boundary";

interface PlayerGameViewProps {
  gameId: string;
  playerId: string;
  gameStatus: string;
  playerName: string;
  playerCount: number;
  roomCode: string;
}

// REMOVED: FeedbackState type - using revealState from store instead

/**
 * Player game view wrapper
 * Conditionally renders waiting room, question display, feedback, or leaderboard based on game state
 */
export function PlayerGameView({
  gameId,
  playerId,
  gameStatus: initialGameStatus,
  playerName,
  playerCount,
  roomCode,
}: PlayerGameViewProps) {
  const { gameStatus, currentQuestion, revealState, setRevealState, correctAnswer: storeCorrectAnswer, answerContent: storeAnswerContent, showSource: storeShowSource, verseReference: storeVerseReference, verseContent: storeVerseContent, setCorrectAnswer, startGame: startGameStore, setGameStatus, advanceQuestion: advanceQuestionStore, questionNumber, totalQuestions } = useGameStore();
  // REMOVED: feedbackState - using only revealState from store for consistency with host
  const [playerAnswer, setPlayerAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  // Use game store for correctAnswer and scriptureReference - same as host
  const [responseTimeMs, setResponseTimeMs] = useState<number>(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasShownFeedbackRef = useRef(false);
  const currentQuestionRef = useRef(currentQuestion);
  
  // Keep ref in sync with currentQuestion to avoid stale closures
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // Use store status if available, otherwise fall back to initial status
  const activeGameStatus = gameStatus || initialGameStatus;

  // Subscribe to game events
  useEffect(() => {
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = subscribeToGame(gameId, {
        onGameStart: (payload: GameStartPayload) => {
          // Update store when game starts
          startGameStore(payload, payload.totalQuestions);
          setGameStatus("active");
        },
        onAnswerReveal: async (payload: AnswerRevealPayload) => {
          setCorrectAnswer(
            payload.correctAnswer,
            payload.answerContent,
            payload.showSource,
            payload.verseReference,
            payload.verseContent
          );
          setRevealState("reveal");
          hasShownFeedbackRef.current = true;

          // Fetch player's answer result in background
          getPlayerAnswerResult(gameId, playerId, payload.questionId)
            .then((result) => {
              if (result.success) {
                setPlayerAnswer(result.selectedAnswer);
                setPointsEarned(result.pointsEarned);
                setTotalScore(result.totalScore);
                setResponseTimeMs(result.responseTimeMs);
              } else {
                console.error(`[Player ${playerId}] Failed to fetch answer result:`, result.error);
                // Non-critical error - answer result is for display only, game continues
              }
            })
            .catch((error) => {
              console.error(`[Player ${playerId}] Error fetching answer result:`, error);
              // Non-critical error - answer result is for display only, game continues
            });
        },
        onLeaderboardReady: (payload: LeaderboardReadyPayload) => {
          if (payload.questionId === currentQuestionRef.current?.id) {
            // Event received - confirm state (may have already been set by local echo)
            console.log(`[Player ${playerId}] Received leaderboard_ready event for question ${payload.questionId}`);
            setRevealState("leaderboard");
          }
        },
        onQuestionAdvance: (payload: QuestionAdvancePayload) => {
          console.log(`[Player] ✅ Received question_advance event, advancing to question ${payload.questionNumber}`);
          // CRITICAL: Reset revealState FIRST, before updating store
          // This ensures we don't show leaderboard when question advances
          setRevealState("question");
          setPlayerAnswer(null);
          setPointsEarned(0);
          hasShownFeedbackRef.current = false;
          // THEN update store (this will trigger re-render with new question)
          advanceQuestionStore(payload);
          console.log(`[Player] 📝 Updated to question state for question ${payload.questionNumber}`);
        },
        onGameEnd: (payload: GameEndPayload) => {
          setRevealState("results"); // Use "results" to match host pattern
        },
      });
    }

    // Set initial state to question if game is active
    if (activeGameStatus === "active" && currentQuestion && revealState !== "question") {
      setRevealState("question");
    }

    return () => {
      // Cleanup callbacks on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [gameId, playerId]); // Only depend on gameId and playerId - store functions are stable
  
  // Reset feedback flag when question changes (new question loaded)
  useEffect(() => {
    if (currentQuestion) {
      // Reset revealState to question when new question loads (if not already set)
      if (revealState !== "question") {
        setRevealState("question");
      }
      // Reset the feedback flag when question ID changes
      hasShownFeedbackRef.current = false;
    }
  }, [currentQuestion?.id]); // Only reset when question ID changes

  // Show waiting room if game is not active
  if (activeGameStatus !== "active" || !currentQuestion) {
    return (
      <GameErrorBoundary>
        <PlayerWaitingView
          gameId={gameId}
          playerId={playerId}
          gameStatus={initialGameStatus}
          playerName={playerName}
          playerCount={playerCount}
          roomCode={roomCode}
        />
      </GameErrorBoundary>
    );
  }

  // Show answer reveal (mobile version) - matches projector reveal
  // Use game store revealState (same as host)
  // Helper function to check if reveal should be shown
  const shouldShowReveal = (): boolean => {
    return revealState === "reveal" 
      && !!storeCorrectAnswer 
      && !!storeAnswerContent 
      && !!currentQuestion;
  };
  if (shouldShowReveal()) {
    return (
      <GameErrorBoundary>
        <AnswerRevealPlayer
          gameId={gameId}
          questionId={currentQuestion.id}
          questionText={currentQuestion.questionText}
          options={currentQuestion.options}
          correctAnswer={storeCorrectAnswer || ""}
          answerContent={storeAnswerContent || ""}
          showSource={storeShowSource}
          verseReference={storeVerseReference}
          verseContent={storeVerseContent}
          selectedAnswer={playerAnswer}
          onComplete={() => {
            // If this is the final question, skip leaderboard and go directly to final results
            if (questionNumber === totalQuestions) {
              // Final question - will be handled by game_end event, but set state immediately for local echo
              setRevealState("results");
            } else {
              // Transition to leaderboard after reveal completes (5 seconds)
              // Use local echo: update store immediately, then wait for event to confirm
              setRevealState("leaderboard");
            }
          }}
        />
      </GameErrorBoundary>
    );
  }

  // Show full leaderboard (same as projector view, one-to-one match)
  // Use game store revealState (same as host)
  const shouldShowLeaderboard = revealState === "leaderboard";
  
  if (shouldShowLeaderboard) {
    return (
      <GameErrorBoundary>
        <LeaderboardPlayer
          gameId={gameId}
          questionId={currentQuestion.id}
        />
      </GameErrorBoundary>
    );
  }

  // Story 3.7: Show final results when game ends
  if (revealState === "results" || gameStatus === "ended") {
    return (
      <GameErrorBoundary>
        <FinalResultsPlayer gameId={gameId} playerId={playerId} />
      </GameErrorBoundary>
    );
  }

  // Show question display
  return (
    <GameErrorBoundary>
      <QuestionDisplayPlayer gameId={gameId} playerId={playerId} />
    </GameErrorBoundary>
  );
}


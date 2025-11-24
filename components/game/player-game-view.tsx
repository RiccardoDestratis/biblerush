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
          // Don't set hasShownFeedbackRef yet - show reveal first, then feedback
          hasShownFeedbackRef.current = false;

          // Fetch player's answer result in background
          // Retry mechanism: scores might not be processed yet, so retry a few times
          const fetchAnswerResult = async (retries = 5): Promise<void> => {
            const result = await getPlayerAnswerResult(gameId, playerId, payload.questionId);
            
            if (result.success) {
              // Check if scores have been processed (points_earned should not be null for submitted answers)
              // If answer was submitted but points_earned is still null, scores haven't been processed yet
              if (result.selectedAnswer !== null && result.pointsEarned === 0 && result.isCorrect === false) {
                // This might mean scores aren't processed yet, or answer was wrong
                // Check if we should retry by looking at total_score - if it's > 0, scores were processed
                // If total_score is 0 and we submitted an answer, might need to wait
                if (retries > 0) {
                  console.log(`[Player ${playerId}] Answer result fetched but scores might not be processed yet, retrying... (${retries} retries left)`);
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                  return fetchAnswerResult(retries - 1);
                }
              }
              
              setPlayerAnswer(result.selectedAnswer);
              setPointsEarned(result.pointsEarned);
              setTotalScore(result.totalScore);
              setResponseTimeMs(result.responseTimeMs);
              console.log(`[Player ${playerId}] Answer result: correct=${result.isCorrect}, points=${result.pointsEarned}, total=${result.totalScore}, time=${result.responseTimeMs}ms`);
            } else {
              console.error(`[Player ${playerId}] Failed to fetch answer result:`, result.error);
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchAnswerResult(retries - 1);
              }
              // Set defaults if fetch fails after retries
              setPlayerAnswer(null);
              setPointsEarned(0);
              setTotalScore(0);
              setResponseTimeMs(0);
            }
          };
          
          fetchAnswerResult().catch((error) => {
            console.error(`[Player ${playerId}] Error fetching answer result:`, error);
            // Set defaults if fetch fails
            setPlayerAnswer(null);
            setPointsEarned(0);
            setTotalScore(0);
            setResponseTimeMs(0);
          });
        },
        onLeaderboardReady: (payload: LeaderboardReadyPayload) => {
          if (payload.questionId === currentQuestionRef.current?.id) {
            // Event received - confirm state (may have already been set by local echo)
            console.log(`[Player ${playerId}] Received leaderboard_ready event for question ${payload.questionId}`);
            
            // Refresh pointsEarned and totalScore before showing leaderboard to ensure latest values
            const refreshScores = async () => {
              const { getPlayerAnswerResult } = await import("@/lib/actions/answers");
              const result = await getPlayerAnswerResult(gameId, playerId, payload.questionId);
              if (result.success) {
                setPointsEarned(result.pointsEarned);
                setTotalScore(result.totalScore);
                console.log(`[Player ${playerId}] Refreshed scores: points=${result.pointsEarned}, total=${result.totalScore}`);
              }
            };
            refreshScores();
            
            // CRITICAL FIX: Transition to leaderboard immediately when leaderboard_ready is received
            // This ensures synchronization with the host/projector view
            // The reveal component will handle its own countdown display, but we transition immediately
            console.log(`[Player ${playerId}] Transitioning to leaderboard immediately (synchronized with host)`);
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
    // Show the reveal screen (same as host/projector)
    // After reveal completes, it will transition to leaderboard automatically
    return (
      <GameErrorBoundary>
        <AnswerRevealPlayer
          gameId={gameId}
          questionId={currentQuestion.id}
          questionText={currentQuestion.questionText}
          correctAnswer={storeCorrectAnswer || ""}
          answerContent={storeAnswerContent || ""}
          options={currentQuestion.options}
          verseReference={storeVerseReference}
          verseContent={storeVerseContent}
          showSource={storeShowSource}
          selectedAnswer={playerAnswer}
            onComplete={() => {
              // onComplete callback is kept for compatibility but transition happens via leaderboard_ready event
              // This ensures synchronization with host/projector view
              console.log(`[Player ${playerId}] Reveal countdown completed (transition handled by leaderboard_ready event)`);
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
          playerId={playerId} // Pass playerId to highlight their row and show speed bonus
          pointsEarned={pointsEarned} // Pass points earned to show in message
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


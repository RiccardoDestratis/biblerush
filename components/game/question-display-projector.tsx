"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { CircularTimer } from "@/components/game/circular-timer";
import { AnswerRevealProjector } from "@/components/game/answer-reveal-projector";
import { LeaderboardProjector } from "@/components/game/leaderboard-projector";
import { FinalResultsProjector } from "@/components/game/final-results-projector";
import { subscribeToGame, getGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { TimerExpiredPayload, QuestionAdvancePayload, GameEndPayload, GamePausePayload, GameResumePayload, ScoresUpdatedPayload, AnswerRevealPayload, LeaderboardReadyPayload, AnswerSubmittedPayload } from "@/lib/types/realtime";
import { getPlayerCount } from "@/lib/actions/players";
import { broadcastAnswerReveal } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { advanceQuestionAndBroadcast } from "@/lib/utils/question-advancement";

interface QuestionDisplayProjectorProps {
  gameId: string;
  initialPlayerCount?: number; // Server-fetched initial count (optimization)
}

/**
 * Projector view for question display
 * Full-screen layout optimized for 1920x1080 with responsive fallback
 * Displays question, answer options, countdown timer, and metadata
 */
export function QuestionDisplayProjector({
  gameId,
  initialPlayerCount = 0,
}: QuestionDisplayProjectorProps) {
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    timerDuration,
    startedAt,
    isPaused,
    pausedAt,
    pauseDuration,
    revealState,
    correctAnswer,
    answerContent,
    showSource,
    verseReference,
    verseContent,
    gameStatus,
    advanceQuestion: advanceQuestionStore,
    setGameStatus,
    setPaused,
    setResumed,
    setRevealState,
    setCorrectAnswer,
  } = useGameStore();

  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const channelRef = useRef<ReturnType<typeof getGameChannel> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasBroadcastExpiredRef = useRef(false);
  const currentQuestionIdRef = useRef<string | null>(null);
  const hasTriggeredRevealRef = useRef(false); // Track if reveal has been triggered for this question
  const answerCountRef = useRef(0); // Track answer submissions in memory for instant detection

  // Update player count periodically (initial count already set from server)
  useEffect(() => {
    const fetchPlayerCount = async () => {
      const result = await getPlayerCount(gameId);
      if (result.success) {
        setPlayerCount(result.count);
      }
    };

    // Only fetch if we don't have initial count, or update every 5 seconds
    if (initialPlayerCount === 0) {
      fetchPlayerCount();
    }
    // Update player count every 5 seconds for real-time updates
    const interval = setInterval(fetchPlayerCount, 5000);
    return () => clearInterval(interval);
  }, [gameId, initialPlayerCount]);

  // Dismiss "Starting game..." toast when question display appears
  useEffect(() => {
    if (currentQuestion && startedAt) {
      // Dismiss the loading toast from HostWaitingRoom
      toast.dismiss("game-start");
    }
  }, [currentQuestion, startedAt]);

  // Reset expired flag and reveal trigger when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== currentQuestionIdRef.current) {
      currentQuestionIdRef.current = currentQuestion.id;
      hasBroadcastExpiredRef.current = false;
      hasTriggeredRevealRef.current = false;
      answerCountRef.current = 0; // Reset answer count for new question
    }
  }, [currentQuestion]);

  // Automatic reveal logic removed - let timer run out instead

  // Subscribe to game events
  useEffect(() => {
    // Clean up previous subscription if it exists
    if (unsubscribeRef.current) {
      console.log(`[Host] 🧹 Cleaning up previous subscription`);
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    console.log(`[Host] 🔌 Subscribing to game events for gameId: ${gameId}`);
    unsubscribeRef.current = subscribeToGame(gameId, {
        onQuestionAdvance: (payload: QuestionAdvancePayload) => {
          console.log(`[Host] ✅ Received question_advance event, advancing to question ${payload.questionNumber}`);
          
          // Check if we already have this question (prevent duplicate updates)
          if (payload.questionNumber === questionNumber) {
            console.log(`[Host] ⚠️ Ignoring duplicate question_advance (already on question ${questionNumber})`);
            return;
          }

          // Update store - same pattern as players (no local echo, wait for event)
          console.log(`[Host] 📝 Updating store: revealState = "question"`);
          setRevealState("question"); // Reset to question state
          advanceQuestionStore(payload);
          console.log(`[Host] ✅ Store updated, component should re-render`);
          toast.dismiss();
        },
        onGameEnd: (payload: GameEndPayload) => {
          console.log(`[Host] 🏁 Game ended event received, setting status to "ended" and revealState to "results"`);
          console.log(`[Host] 📝 Updating store: gameStatus = "ended", revealState = "results"`);
          // Note: Store uses "ended" but database uses "completed" - that's fine, they're separate
          setGameStatus("ended");
          setRevealState("results");
          toast.success("Game completed!");
          console.log(`[Host] ✅ Store updated, FinalResultsProjector should render`);
        },
        onGamePause: (payload: GamePausePayload) => {
          setPaused(payload.pausedAt);
        },
        onGameResume: (payload: GameResumePayload) => {
          setResumed(payload.resumedAt);
        },
        onScoresUpdated: async (payload: ScoresUpdatedPayload) => {
          // Helper function to check if reveal should be triggered
          const shouldTriggerReveal = (): boolean => {
            const questionIdMatches = currentQuestion && payload.questionId === currentQuestion.id;
            const isInQuestionState = revealState === "question" || !revealState;
            return !hasTriggeredRevealRef.current && !!questionIdMatches && isInQuestionState;
          };

          console.log(`[Host] onScoresUpdated received:`, {
            questionIdMatches: currentQuestion && payload.questionId === currentQuestion.id,
            isInQuestionState: revealState === "question" || !revealState,
            hasTriggered: hasTriggeredRevealRef.current,
            payloadQuestionId: payload.questionId,
            currentQuestionId: currentQuestion?.id,
            revealState,
          });

          if (shouldTriggerReveal()) {
            console.log(`[Host] ✅ Triggering reveal from onScoresUpdated`);
            hasTriggeredRevealRef.current = true;
            await triggerAnswerReveal(payload.questionId);
          } else {
            console.log(`[Host] ⚠️ Skipping reveal from onScoresUpdated:`, {
              hasTriggered: hasTriggeredRevealRef.current,
              questionIdMatches: currentQuestion && payload.questionId === currentQuestion.id,
              isInQuestionState: revealState === "question" || !revealState,
            });
          }
        },
        onAnswerReveal: (payload: AnswerRevealPayload) => {
          const questionIdMatches = payload.questionId === currentQuestion?.id;
          const isInQuestionState = revealState === "question" || !revealState;
          if (questionIdMatches || isInQuestionState) {
            setCorrectAnswer(
              payload.correctAnswer,
              payload.answerContent,
              payload.showSource,
              payload.verseReference,
              payload.verseContent
            );
            setRevealState("reveal");
          }
        },
        onLeaderboardReady: (payload: LeaderboardReadyPayload) => {
          if (payload.questionId === currentQuestion?.id) {
            setRevealState("leaderboard");
          }
        },
        // Automatic reveal on answer submission removed - let timer run out instead
      });
      
      channelRef.current = getGameChannel(gameId);
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        channelRef.current = null;
      }
    };
  }, [gameId, currentQuestion, revealState, advanceQuestionStore, setGameStatus, setPaused, setResumed, setRevealState, setCorrectAnswer, questionNumber]);

  // Handle question timer expiration (15 seconds)
  const handleTimerExpire = async () => {
    // Helper function to check if timer expiration should be skipped
    const shouldSkipTimerExpiration = (): boolean => {
      return hasBroadcastExpiredRef.current || !currentQuestion || isPaused;
    };

    if (shouldSkipTimerExpiration()) {
      console.log(`[Host] ⏱️ Timer expired but skipping:`, {
        hasBroadcastExpired: hasBroadcastExpiredRef.current,
        hasQuestion: !!currentQuestion,
        isPaused,
      });
      return;
    }
    
    console.log(`[Host] ⏱️ Timer expired for question ${currentQuestion?.id || 'unknown'}`);
    hasBroadcastExpiredRef.current = true;
    
    if (!currentQuestion) {
      console.error("[Host] ❌ Cannot broadcast timer_expired - no current question");
      return;
    }
    
    const payload: TimerExpiredPayload = {
      questionId: currentQuestion.id,
      questionNumber,
      timestamp: new Date().toISOString(),
    };

    if (channelRef.current) {
      console.log(`[Host] 📢 Broadcasting timer_expired event`);
      await broadcastGameEvent(gameId, "timer_expired", payload);
      
      // Reset reveal trigger flag - timer expiration should trigger scoring and reveal
      // Even if reveal was already triggered (from auto-reveal), we still need to process scores
      const wasAlreadyTriggered = hasTriggeredRevealRef.current;
      hasTriggeredRevealRef.current = false;
      console.log(`[Host] Reset hasTriggeredRevealRef (was: ${wasAlreadyTriggered})`);
      
      // Process scores for current question (this broadcasts scores_updated)
      const { processQuestionScores } = await import("@/lib/actions/answers");
      console.log(`[Host] 📊 Processing scores after timer expiration...`);
      const scoreResult = await processQuestionScores(gameId, currentQuestion.id);
      
      if (!scoreResult.success) {
        console.error(`[Host] ❌ Error processing scores after timer:`, scoreResult.error);
        // Continue anyway - try to trigger reveal
        // Note: Scores will be recalculated when leaderboard is displayed
        toast.error("Error processing scores. Game will continue.", { duration: 3000 });
      } else {
        console.log(`[Host] ✅ Scores processed after timer (${scoreResult.processedCount} answers)`);
      }
      
      // Set up fallback: if reveal doesn't trigger within 2 seconds, trigger it directly
      const fallbackTimeout = setTimeout(async () => {
        if (!hasTriggeredRevealRef.current) {
          console.log(`[Host] ⚠️ Fallback (timer): scores_updated event didn't trigger reveal within 2s, triggering directly...`);
          hasTriggeredRevealRef.current = true;
          await triggerAnswerReveal(currentQuestion.id);
        } else {
          console.log(`[Host] ✅ Fallback (timer): reveal already triggered (hasTriggeredRevealRef is true)`);
        }
      }, 2000);
      
      // Clear fallback if reveal triggers normally (check hasTriggeredRevealRef)
      const checkInterval = setInterval(() => {
        if (hasTriggeredRevealRef.current) {
          console.log(`[Host] ✅ Reveal triggered normally (timer), clearing fallback`);
          clearTimeout(fallbackTimeout);
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Clean up interval after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        clearTimeout(fallbackTimeout);
      }, 5000);
    }
    // Note: Answer reveal is triggered after scores_updated event (Story 3.2)
    // Timer expiration will trigger scoring, which then triggers reveal
  };

  // Story 3.2: Trigger answer reveal after scoring completes
  const triggerAnswerReveal = async (questionId: string) => {
    console.log(`[Host] 🎯 triggerAnswerReveal called`, {
      questionId,
      hasChannel: !!channelRef.current,
      channelState: channelRef.current?.state,
      hasQuestion: !!currentQuestion,
      currentQuestionId: currentQuestion?.id,
    });

    if (!channelRef.current || !currentQuestion) {
      console.error("[Host] ❌ Cannot trigger answer reveal - channel or question missing", {
        hasChannel: !!channelRef.current,
        hasQuestion: !!currentQuestion,
      });
      return;
    }

    // Ensure channel is subscribed before broadcasting (channel is subscribed in useEffect)
    // Just log the state for debugging
    const channelState = channelRef.current.state as string;
    console.log(`[Host] Channel state before check: ${channelState}`);
    
    // Try to ensure subscribed (channel should already be subscribed in useEffect)
    if (channelState !== "SUBSCRIBED" && channelState !== "joined") {
      console.log(`[Host] ⏳ Channel not subscribed yet (state: ${channelState}), subscribing...`);
      channelRef.current.subscribe();
      // Wait a moment for subscription
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`[Host] Channel subscription wait complete - state: ${channelRef.current.state as string}`);
    }

    // Fetch correct answer and scripture reference from Server Action
    console.log(`[Host] 📡 Fetching answer reveal data for question ${questionId}...`);
    const result = await broadcastAnswerReveal(gameId, questionId);
    
    if (!result.success) {
      console.error("[Host] ❌ Failed to fetch answer reveal data:", result.error);
      toast.error("Failed to reveal answer. Please try again.");
      return;
    }

    console.log(`[Host] ✅ Answer reveal data fetched - correct answer: ${result.correctAnswer}`);

    // Prepare payload
    const payload: AnswerRevealPayload = {
      gameId,
      questionId,
      correctAnswer: result.correctAnswer,
      answerContent: result.answerContent,
      showSource: result.showSource,
      verseReference: result.verseReference,
      verseContent: result.verseContent,
    };

    // Broadcast answer_reveal event FIRST, then update local state
    // This ensures players receive the event at roughly the same time host shows it
    console.log(`[Host] 📢 Broadcasting answer_reveal event FIRST`, payload);
    const broadcastPromise = broadcastGameEvent(gameId, "answer_reveal", payload).catch((error) => {
      console.error("[Host] ❌ Error broadcasting answer_reveal:", error);
    });

    // Update store immediately after broadcast starts (local echo for responsiveness)
    // Players will receive the event via network and update at roughly the same time
    console.log(`[Host] 📝 Updating store (local echo) - setting revealState to "reveal"`);
    setCorrectAnswer(
      result.correctAnswer,
      result.answerContent,
      result.showSource,
      result.verseReference,
      result.verseContent
    );
    setRevealState("reveal");

    // Wait for broadcast to complete (but don't block UI)
    await broadcastPromise;
    console.log(`[Host] ✅ answer_reveal event broadcast complete`);
  };

  // Story 3.4: Handle leaderboard complete (after 10 seconds, advance to next question)
  const handleLeaderboardComplete = useCallback(async () => {
    console.log(`[Host] 🎯 Leaderboard complete for question ${currentQuestion?.id}`);
    
    if (!channelRef.current || !currentQuestion) {
      console.error("[Host] ❌ Cannot advance question - missing channel or question");
      return;
    }

    // Advance question and broadcast event
    // Broadcast FIRST, wait a bit for players to receive it, then do local echo
    // This ensures players receive the event before host shows new question
    const { advanceQuestionAndBroadcast } = await import("@/lib/utils/question-advancement");
    const result = await advanceQuestionAndBroadcast(gameId);
    
    if (!result.success) {
      console.error(`[Host] ❌ Failed to advance question:`, result.error);
      return;
    }
    
    // Wait for broadcast to propagate to players (network latency)
    // This ensures players receive the event before host does local echo
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms buffer for network
    
    // Update store after players have received the event (local echo)
    if (!result.gameEnded && result.questionData) {
      console.log(`[Host] 📝 Updating store (local echo) for question ${result.questionData.questionNumber}`);
      setRevealState("question"); // Reset to question state
      advanceQuestionStore(result.questionData);
      toast.dismiss();
    }
    
    console.log(`[Host] ✅ Advancement complete - store updated, event broadcast`);
  }, [gameId, currentQuestion, advanceQuestionStore]);

  // Story 3.2: Handle reveal complete (after 5 seconds, transition to leaderboard OR final results if last question)
  const handleRevealComplete = async () => {
    console.log(`[Host] 🎯 Reveal complete for question ${currentQuestion?.id}`, {
      hasChannel: !!channelRef.current,
      channelState: channelRef.current?.state,
      hasQuestion: !!currentQuestion,
      questionNumber,
      totalQuestions,
      isLastQuestion: questionNumber === totalQuestions,
    });

    if (!channelRef.current || !currentQuestion) {
      console.error("[Host] ❌ Cannot complete reveal - missing channel or question");
      return;
    }

    // If this is the final question, skip leaderboard and go directly to final results
    if (questionNumber === totalQuestions) {
      console.log(`[Host] 🏁 Final question - skipping leaderboard, going directly to final results`);
      // Call handleLeaderboardComplete which will advance and trigger game_end
      await handleLeaderboardComplete();
      return;
    }

    // Broadcast leaderboard_ready event (for non-final questions)
    const payload: LeaderboardReadyPayload = {
      gameId,
      questionId: currentQuestion.id,
    };

    console.log(`[Host] 📢 Broadcasting leaderboard_ready event`, payload);
    try {
      await broadcastGameEvent(gameId, "leaderboard_ready", payload);
      console.log(`[Host] ✅ leaderboard_ready event broadcast complete`);
    } catch (error) {
      console.error("[Host] ❌ Error broadcasting leaderboard_ready:", error);
    }
    
    // Update store to transition to leaderboard
    console.log(`[Host] 📝 Setting revealState to "leaderboard"`);
    setRevealState("leaderboard");
  };

  // Handle pause button click
  const handlePause = async () => {
    if (!channelRef.current) return;
    
    const pausedAt = new Date().toISOString();
    const payload: GamePausePayload = { pausedAt };
    
    // Update local state immediately
    setPaused(pausedAt);
    
    // Broadcast to all devices
    await broadcastGameEvent(gameId, "game_pause", payload);
    toast.info("Game paused");
  };

  // Handle resume button click
  const handleResume = async () => {
    if (!channelRef.current || !pausedAt) return;
    
    const resumedAt = new Date().toISOString();
    const pauseDuration = Math.floor((new Date(resumedAt).getTime() - new Date(pausedAt).getTime()) / 1000);
    const payload: GameResumePayload = { resumedAt, pauseDuration };
    
    // Update local state immediately
    setResumed(resumedAt);
    
    // Broadcast to all devices
    await broadcastGameEvent(gameId, "game_resume", payload);
    toast.success("Game resumed");
  };

  // Handle skip button click
  const handleSkip = async () => {
    if (!channelRef.current || !currentQuestion) {
      console.error("[Host] ❌ Cannot skip - missing channel or question");
      return;
    }
    
    console.log(`[Host] ⏭️ Skip button clicked for question ${currentQuestion.id}`, {
      channelState: channelRef.current.state,
      isPaused,
      revealState,
      hasTriggeredReveal: hasTriggeredRevealRef.current,
    });
    
    // If paused, resume first
    if (isPaused && pausedAt) {
      const resumedAt = new Date().toISOString();
      const pauseDuration = Math.floor((new Date(resumedAt).getTime() - new Date(pausedAt).getTime()) / 1000);
      const resumePayload: GameResumePayload = { resumedAt, pauseDuration };
      setResumed(resumedAt);
      await broadcastGameEvent(gameId, "game_resume", resumePayload);
    }
    
    // Ensure channel is subscribed before processing scores (channel is subscribed in useEffect)
    const channelState = channelRef.current.state as string;
    if (channelState !== "SUBSCRIBED" && channelState !== "joined") {
      console.log(`[Host] ⏳ Channel not subscribed (state: ${channelState}), subscribing...`);
      channelRef.current.subscribe();
      // Wait a moment for subscription
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`[Host] Channel subscription complete - state: ${channelRef.current.state as string}`);
    }
    
    // Reset reveal trigger flag for this question (even if already triggered)
    const wasAlreadyTriggered = hasTriggeredRevealRef.current;
    hasTriggeredRevealRef.current = false;
    console.log(`[Host] Reset hasTriggeredRevealRef for skip (was: ${wasAlreadyTriggered})`);
    
    // Process scores for current question (this broadcasts scores_updated)
    // This will trigger the reveal flow via onScoresUpdated handler
    const { processQuestionScores } = await import("@/lib/actions/answers");
    console.log(`[Host] 📊 Processing scores for question ${currentQuestion.id}...`);
    const scoreResult = await processQuestionScores(gameId, currentQuestion.id);
    
      if (!scoreResult.success) {
        console.error(`[Host] ❌ Error processing scores:`, scoreResult.error);
        toast.error("Failed to process scores. Please try again.", { duration: 5000 });
        // Note: Scores will be recalculated when leaderboard is displayed
        return;
      }
    
    console.log(`[Host] ✅ Scores processed successfully (${scoreResult.processedCount} answers)`, {
      channelState: channelRef.current.state,
      waitingForEvent: true,
    });
    
    // Set up fallback: if reveal doesn't trigger within 2 seconds, trigger it directly
    const fallbackTimeout = setTimeout(async () => {
      if (!hasTriggeredRevealRef.current) {
        console.log(`[Host] ⚠️ Fallback: scores_updated event didn't trigger reveal within 2s, triggering directly...`);
        hasTriggeredRevealRef.current = true;
        await triggerAnswerReveal(currentQuestion.id);
      } else {
        console.log(`[Host] ✅ Fallback: reveal already triggered (hasTriggeredRevealRef is true)`);
      }
    }, 2000);
    
    // Clear fallback if reveal triggers normally (check hasTriggeredRevealRef)
    const checkInterval = setInterval(() => {
      if (hasTriggeredRevealRef.current) {
        console.log(`[Host] ✅ Reveal triggered normally, clearing fallback`);
        clearTimeout(fallbackTimeout);
        clearInterval(checkInterval);
      }
    }, 100);
    
    // Clean up interval after 5 seconds (should be enough time)
    setTimeout(() => {
      clearInterval(checkInterval);
      clearTimeout(fallbackTimeout);
    }, 5000);
    
    // Don't advance here - let the natural flow happen:
    // scores_updated event → onScoresUpdated handler → triggerAnswerReveal → reveal → leaderboard → advance
  };

  // Story 3.6: Show final results when game ends
  // CRITICAL: Check this FIRST before leaderboard, even if revealState is "leaderboard"
  // If gameStatus is "ended" OR revealState is "results", show final results
  if (gameStatus === "ended" || revealState === "results") {
    console.log(`[Host] 🏁 Rendering FinalResultsProjector: gameStatus="${gameStatus}", revealState="${revealState}"`);
    console.log(`[Host] 🏁 Current question: ${currentQuestion?.id || 'none'}, questionNumber: ${questionNumber}`);
    return <FinalResultsProjector gameId={gameId} />;
  }

  if (!currentQuestion || !startedAt) {
    return null;
  }

  // Story 3.2: Show answer reveal when revealState is 'reveal'
  if (revealState === "reveal" && correctAnswer && answerContent) {
    return (
      <AnswerRevealProjector
        gameId={gameId}
        questionId={currentQuestion.id}
        questionText={currentQuestion.questionText}
        options={currentQuestion.options}
        correctAnswer={correctAnswer}
        answerContent={answerContent}
        showSource={showSource}
        verseReference={verseReference}
        verseContent={verseContent}
        onComplete={handleRevealComplete}
      />
    );
  }

  // Story 3.4: Show leaderboard when revealState is 'leaderboard'
  // Only show if game is NOT ended (final results takes priority)
  // Note: gameStatus is already checked above (not "ended"), and revealState is already "leaderboard"
  if (revealState === "leaderboard" && currentQuestion) {
    return (
      <LeaderboardProjector
        gameId={gameId}
        questionId={currentQuestion.id}
        onComplete={handleLeaderboardComplete}
      />
    );
  }

  // Answer box colors
  const answerColors = [
    { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-900" }, // A
    { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-900" }, // B
    { border: "border-teal-500", bg: "bg-teal-50", text: "text-teal-900" }, // C
    { border: "border-green-500", bg: "bg-green-50", text: "text-green-900" }, // D
  ];

  const answerLabels = ["A", "B", "C", "D"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-8"
      style={{ minHeight: "100vh" }}
    >
      {/* Freezing overlay when paused */}
      {isPaused && (
        <motion.div
          className="absolute inset-0 bg-white/30 backdrop-blur-sm z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/90 rounded-3xl p-12 shadow-2xl flex flex-col items-center gap-6"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="text-8xl"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ⏸
            </motion.div>
            <div className="text-4xl font-bold text-gray-800">Game Paused</div>
            <div className="text-xl text-gray-600">Click Play to continue</div>
          </motion.div>
        </motion.div>
      )}
      {/* Top metadata bar */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 z-10">
        {/* Player count */}
        <div className="text-lg md:text-2xl font-semibold text-gray-700">
          {playerCount} {playerCount === 1 ? "player" : "players"}
        </div>

        {/* Question number */}
        <div className="text-lg md:text-2xl font-semibold text-gray-700">
          Question {questionNumber} of {totalQuestions}
        </div>
      </div>

      {/* Floating Gamey Control Buttons - Bottom Right */}
      <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 flex flex-col gap-3 md:gap-4 z-30">
        {/* Pause/Play Button - Gamey Style */}
        <motion.button
          onClick={isPaused ? handleResume : handlePause}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative
            px-6 md:px-8 py-4 md:py-5
            text-lg md:text-2xl font-black
            text-white
            rounded-2xl md:rounded-3xl
            shadow-2xl
            border-4 border-white/30
            transition-all duration-200
            ${isPaused 
              ? "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700" 
              : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700"
            }
            transform
            active:translate-y-1
          `}
          style={{
            boxShadow: "0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)",
          }}
        >
          <div className="flex items-center gap-2 md:gap-3">
            {isPaused ? (
              <>
                <Play className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" />
                <span className="hidden sm:inline">PLAY</span>
              </>
            ) : (
              <>
                <Pause className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            )}
          </div>
        </motion.button>
        
        {/* Skip Button - Gamey Style */}
        <motion.button
          onClick={handleSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            relative
            px-6 md:px-8 py-4 md:py-5
            text-lg md:text-2xl font-black
            text-white
            rounded-2xl md:rounded-3xl
            shadow-2xl
            border-4 border-white/30
            bg-gradient-to-br from-orange-500 via-red-500 to-pink-600
            hover:from-orange-600 hover:via-red-600 hover:to-pink-700
            transition-all duration-200
            transform
            active:translate-y-1
          "
          style={{
            boxShadow: "0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)",
          }}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <SkipForward className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" />
            <span className="hidden sm:inline">SKIP</span>
          </div>
        </motion.button>
      </div>

      {/* Main content area */}
      <div className="flex flex-col items-center justify-center max-w-6xl w-full space-y-6 md:space-y-12 px-4 md:px-8 pt-20 md:pt-0">
        {/* Question text */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 text-center leading-tight px-4 md:px-8"
          style={{
            maxHeight: "4.5em", // ~3 lines at 48px
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {currentQuestion.questionText}
        </motion.h1>

        {/* Timer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="scale-75 md:scale-100"
        >
          <CircularTimer
            duration={timerDuration}
            startedAt={startedAt}
            onExpire={handleTimerExpire}
            isPaused={isPaused}
            pausedAt={pausedAt}
            pauseDuration={pauseDuration}
          />
        </motion.div>

        {/* Answer boxes grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 w-full max-w-4xl"
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`
                ${answerColors[index].border}
                ${answerColors[index].bg}
                border-2 md:border-4 rounded-xl md:rounded-2xl p-4 md:p-6
                flex items-center space-x-3 md:space-x-4
                transition-all duration-200
                hover:shadow-lg
              `}
              style={{ minHeight: "80px" }}
            >
              {/* Letter label */}
              <div
                className={`
                  ${answerColors[index].text}
                  text-3xl md:text-5xl font-bold
                  flex-shrink-0
                  w-12 h-12 md:w-16 md:h-16
                  flex items-center justify-center
                  rounded-full
                  bg-white
                  border-2
                  ${answerColors[index].border.replace("border-", "border-")}
                `}
              >
                {answerLabels[index]}
              </div>

              {/* Option text */}
              <div
                className={`
                  ${answerColors[index].text}
                  text-lg md:text-3xl font-semibold
                  flex-1
                `}
                style={{
                  maxHeight: "3em",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {option}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}


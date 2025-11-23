"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionSetCard } from "@/components/game/question-set-card";
import { createGame } from "@/lib/actions/games";
import { getQuestionSets } from "@/lib/actions/question-sets";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionSetDisplay {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  tier: "free" | "pro" | "church";
  isComingSoon: boolean;
  cardBackgroundUrl: string | null;
  status: string | null;
}

export default function CreateGamePage() {
  const router = useRouter();
  const [questionSets, setQuestionSets] = useState<QuestionSetDisplay[]>([]);
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(3); // Default to 3 for demo
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load question sets from database
  useEffect(() => {
    async function loadQuestionSets() {
      const result = await getQuestionSets();
      
      if (!result.success) {
        toast.error(result.error || "Failed to load question sets");
        setIsLoading(false);
        return;
      }

      // Map question sets - they're already sorted by order from the server
      const displaySets: QuestionSetDisplay[] = result.questionSets.map((set) => ({
        id: set.id,
        title: set.name,
        description: set.description,
        questionCount: set.questionCount,
        tier: set.tier as "free" | "pro" | "church",
        isComingSoon: set.status === "locked", // Check status field from database
        cardBackgroundUrl: set.cardBackgroundUrl,
        status: set.status,
      }));
      
      setQuestionSets(displaySets);
      
      // Auto-select the first available set
      if (displaySets.length > 0) {
        setSelectedQuestionSetId(displaySets[0].id);
      } else {
        toast.info("No question sets available. Please import some questions first.");
      }
      
      setIsLoading(false);
    }

    loadQuestionSets();
  }, []);

  const handleCreateGame = async () => {
    if (!selectedQuestionSetId) {
      toast.error("Please select a question set");
      return;
    }

    setIsCreating(true);

    try {
      // Use the UUID from the database
      const result = await createGame(selectedQuestionSetId, questionCount);

      if (!result.success) {
        toast.error(result.error || "Failed to create game. Try again.");
        setIsCreating(false);
        return;
      }

      toast.success("Game created successfully!");
      
      // Redirect to waiting room
      router.push(`/game/${result.gameId}/host`);
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Create New Game</h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
          Choose your game settings and select a question set.
        </p>
      </div>

      {/* Game Length Selector */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Game Length</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Number of Questions!</p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {[3, 10, 15, 20].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setQuestionCount(count)}
              className={cn(
                "min-w-[60px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200",
                "border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                questionCount === count
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : "bg-background text-foreground border-border hover:bg-muted hover:border-primary/50 active:scale-95"
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Question Set Selection */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Select a Question Set</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
            {questionSets.map((set, index) => (
              <QuestionSetCard
                key={set.id}
                id={set.id}
                title={set.title}
                description={set.description}
                questionCount={set.questionCount}
                tier={set.tier}
                isComingSoon={set.isComingSoon}
                isSelected={selectedQuestionSetId === set.id}
                onSelect={() => !set.isComingSoon && setSelectedQuestionSetId(set.id)}
                cardBackgroundUrl={set.cardBackgroundUrl}
                priority={index < 2} // Prioritize first 2 cards (above the fold)
              />
            ))}
          </div>
        )}
      </div>

      {/* Start Game Button */}
      <div className="flex justify-center sm:justify-start mt-8 sm:mt-10">
        <Button
          onClick={handleCreateGame}
          disabled={!selectedQuestionSetId || isCreating}
          size="lg"
          className="w-full sm:w-auto sm:min-w-[240px] h-14 sm:h-16 text-lg sm:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Starting...
            </>
          ) : (
            "Start"
          )}
        </Button>
      </div>
    </div>
  );
}


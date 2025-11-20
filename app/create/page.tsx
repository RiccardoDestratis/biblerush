"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuestionSetCard } from "@/components/game/question-set-card";
import { createGame } from "@/lib/actions/games";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getPlaceholderQuestionSets } from "./question-sets";

interface QuestionSetDisplay {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  tier: "free" | "pro" | "church";
  isComingSoon: boolean;
}

export default function CreateGamePage() {
  const router = useRouter();
  const [questionSets, setQuestionSets] = useState<QuestionSetDisplay[]>([]);
  const [selectedQuestionSetId, setSelectedQuestionSetId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load question sets on mount
  useEffect(() => {
    // For MVP, use placeholder question sets
    // In production, this would fetch from the database
    const placeholders = getPlaceholderQuestionSets();
    const displaySets: QuestionSetDisplay[] = placeholders.map((set) => ({
      id: set.id,
      title: set.title,
      description: set.description,
      questionCount: set.question_count,
      tier: set.tier_required,
      isComingSoon: set.isComingSoon || !set.is_published,
    }));
    setQuestionSets(displaySets);
    
    // Auto-select the first available (non-coming-soon) set
    const firstAvailable = displaySets.find((set) => !set.isComingSoon);
    if (firstAvailable) {
      setSelectedQuestionSetId(firstAvailable.id);
    }
    
    setIsLoading(false);
  }, []);

  const handleCreateGame = async () => {
    if (!selectedQuestionSetId) {
      toast.error("Please select a question set");
      return;
    }

    setIsCreating(true);

    try {
      // For MVP, we'll use the placeholder ID directly
      // In production, this will be a real UUID from the database
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Game</h1>
        <p className="text-muted-foreground text-lg">
          Select a question set and choose how many questions to include in your game.
        </p>
      </div>

      {/* Question Set Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Select Question Set</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionSets.map((set) => (
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Game Length Selector */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Game Length</h2>
        <RadioGroup
          value={questionCount.toString()}
          onValueChange={(value) => setQuestionCount(parseInt(value, 10))}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="10" id="length-10" />
            <Label htmlFor="length-10" className="cursor-pointer text-lg">
              10 questions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="15" id="length-15" />
            <Label htmlFor="length-15" className="cursor-pointer text-lg">
              15 questions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="20" id="length-20" />
            <Label htmlFor="length-20" className="cursor-pointer text-lg">
              20 questions
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Create Game Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCreateGame}
          disabled={!selectedQuestionSetId || isCreating}
          size="lg"
          className="min-w-[200px] h-12 text-lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Game"
          )}
        </Button>
      </div>
    </div>
  );
}


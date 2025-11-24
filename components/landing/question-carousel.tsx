"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  scriptureReference?: string;
}

interface QuestionCarouselProps {
  questions: Question[];
}

export function QuestionCarousel({ questions }: QuestionCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!questions || questions.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? questions.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === questions.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentQuestion = questions[currentIndex];
  const answerLabels = ["A", "B", "C", "D"];

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-lg">
        <Card className="border-2 border-primary/20 bg-primary/5 transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div key={currentQuestion.id} className="space-y-6">
              {/* Question Text */}
              <div>
                <p className="text-lg md:text-xl font-semibold text-foreground mb-1">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const label = answerLabels[idx];
                  const isCorrect = label === currentQuestion.correctAnswer;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300",
                        isCorrect
                          ? "bg-primary/10 border-primary text-foreground"
                          : "bg-background border-border text-foreground hover:border-primary/30"
                      )}
                    >
                      <span className="font-semibold text-primary mr-3">
                        {label}.
                      </span>
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Scripture Reference */}
              {currentQuestion.scriptureReference && (
                <p className="text-sm text-muted-foreground italic">
                  {currentQuestion.scriptureReference}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="rounded-full"
          aria-label="Previous question"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full"
          aria-label="Next question"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}


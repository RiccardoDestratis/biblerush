"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { QuestionSetCard } from "@/components/game/question-set-card";
import { cn } from "@/lib/utils";

interface QuestionSetDisplay {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  tier: "free" | "pro" | "church" | "sub";
  isComingSoon: boolean;
  cardBackgroundUrl: string | null;
  status: string | null;
}

interface QuestionSetCarouselProps {
  questionSets: QuestionSetDisplay[];
  selectedQuestionSetId: string | null;
  onSelect: (id: string) => void;
  isLocked: (set: QuestionSetDisplay) => boolean;
}

export function QuestionSetCarousel({
  questionSets,
  selectedQuestionSetId,
  onSelect,
  isLocked,
}: QuestionSetCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (questionSets.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent extendOverflow className="-ml-4 sm:-ml-6">
          {questionSets.map((set, index) => {
            const locked = isLocked(set);
            return (
              <CarouselItem
                key={set.id}
                className="pl-4 sm:pl-6 basis-full md:basis-1/2"
              >
                <div className="h-full py-2">
                  <QuestionSetCard
                    id={set.id}
                    title={set.title}
                    description={set.description}
                    questionCount={set.questionCount}
                    tier={set.tier}
                    isComingSoon={set.isComingSoon}
                    isLocked={locked}
                    isSelected={selectedQuestionSetId === set.id}
                    onSelect={() => {
                      if (!set.isComingSoon && !locked) {
                        onSelect(set.id);
                      }
                    }}
                    cardBackgroundUrl={set.cardBackgroundUrl}
                    priority={true}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {count > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-12 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary hover:border-primary/50" />
            <CarouselNext className="hidden md:flex -right-12 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary hover:border-primary/50" />
          </>
        )}
      </Carousel>
      
      {/* Pagination Dots */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === current - 1
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

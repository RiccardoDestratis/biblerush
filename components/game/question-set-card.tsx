"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface QuestionSetCardProps {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  tier?: "free" | "pro" | "church";
  isComingSoon?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function QuestionSetCard({
  id,
  title,
  description,
  questionCount,
  tier = "free",
  isComingSoon = false,
  isSelected = false,
  onSelect,
}: QuestionSetCardProps) {
  return (
    <div className="relative">
      <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected
          ? "ring-2 ring-primary shadow-[0_8px_16px_-4px_rgba(124,58,237,0.3)] scale-[1.02]"
          : "hover:shadow-lg hover:-translate-y-1",
        isComingSoon && "opacity-60 cursor-not-allowed"
      )}
      onClick={!isComingSoon ? onSelect : undefined}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {isComingSoon && (
            <Badge variant="secondary" className="ml-2">
              <Lock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{questionCount} questions</Badge>
          {tier !== "free" && (
            <Badge variant="secondary" className="ml-2">
              {tier === "pro" ? "Pro" : "Church"}
            </Badge>
          )}
        </div>
      </CardContent>
      {isComingSoon && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
          </div>
        </div>
      )}
    </Card>
    </div>
  );
}


"use client";

import * as React from "react";
import Image from "next/image";
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
  cardBackgroundUrl?: string | null; // URL from Supabase Storage
  priority?: boolean; // Set to true for above-the-fold images
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
  cardBackgroundUrl,
  priority = false,
}: QuestionSetCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Fallback gradient based on id hash for variety
  const getGradientStyle = () => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple gradient
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink gradient
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue gradient
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green gradient
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange gradient
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal gradient
    ];
    return {
      background: gradients[hash % gradients.length],
    };
  };

  const hasValidImage = cardBackgroundUrl && !imageError;

  return (
    <div className="relative h-full flex" data-testid="question-set-card">
      <Card
        className={cn(
          "transition-all duration-200 relative overflow-hidden border-0 w-full h-full min-h-[170px] flex flex-col",
          isComingSoon 
            ? "cursor-not-allowed" 
            : "cursor-pointer",
          !isComingSoon && isSelected
            ? "ring-2 ring-primary shadow-[0_8px_16px_-4px_rgba(124,58,237,0.3)] scale-[1.01] sm:scale-[1.02]"
            : !isComingSoon && "hover:shadow-lg hover:-translate-y-1 active:scale-[0.99]"
        )}
        onClick={!isComingSoon ? onSelect : undefined}
        style={isComingSoon ? { filter: 'grayscale(40%) brightness(0.95)' } : undefined}
      >
        {/* Background Image or Gradient - NO blur, clear and visible */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Gradient fallback */}
          {!hasValidImage && (
            <div 
              className="absolute inset-0"
              style={getGradientStyle()}
            />
          )}
          
          {/* Optimized Next.js Image for background */}
          {hasValidImage && (
            <Image
              src={cardBackgroundUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover object-center transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              priority={priority} // Use priority for above-the-fold images
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
              quality={85} // Good balance between quality and file size
            />
          )}
        </div>
        
        {/* Minimal dark overlay for subtle depth */}
        <div className="absolute inset-0 z-[1] bg-black/5" />
        
        {/* Subtle glass effect - very light white overlay */}
        {!isComingSoon && (
          <div className="absolute inset-0 z-[2] bg-white/15" />
        )}
        
        {/* Locked overlay with glassy purple/white/gray gradient - only shown when locked */}
        {isComingSoon && (
          <>
            {/* Glassy gradient overlay for locked state */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-br from-purple-50/60 via-white/50 to-gray-100/60 backdrop-blur-md" />
            {/* Subtle purple tint */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-tr from-purple-200/30 via-transparent to-gray-200/30" />
            {/* Frosted glass effect */}
            <div className="absolute inset-0 z-[2] bg-white/20 backdrop-blur-sm" />
          </>
        )}
        
        {/* Content with semi-transparent white backdrop for readability */}
        <div className="relative z-[3] h-full flex flex-col">
          <div className={cn(
            "p-4 sm:p-6 rounded-xl h-full flex flex-col justify-between",
            isComingSoon ? "bg-white/50 backdrop-blur-sm" : "bg-white/65"
          )}>
            <CardHeader className="p-0 pb-3 sm:pb-4" style={{ border: 'none' }}>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl text-foreground font-semibold line-clamp-2 flex-1 min-w-0">{title}</CardTitle>
              </div>
              <CardDescription className="mt-2 text-foreground font-semibold text-sm sm:text-base drop-shadow-sm line-clamp-2">{description}</CardDescription>
            </CardHeader>
            {!isComingSoon && (
              <CardContent className="p-0" style={{ border: 'none' }}>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-white text-xs sm:text-sm">{questionCount} questions</Badge>
                  {tier !== "free" && (
                    <Badge variant="secondary" className="ml-2 bg-white text-xs sm:text-sm">
                      {tier === "pro" ? "Pro" : "Church"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            )}
          </div>
        </div>
        
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none">
            <div className="text-center p-4">
              <div className="relative mb-4">
                {/* Soft glow effect behind lock */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-200/40 blur-xl" />
                </div>
                {/* Lock icon with friendly glassy styling */}
                <div className="relative z-10 mx-auto w-12 h-12 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <Lock className="h-6 w-6 text-purple-600/80 drop-shadow-md stroke-[2]" />
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 inline-block shadow-md">
                <p className="text-base font-semibold text-gray-700 tracking-wide">Coming Soon</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}


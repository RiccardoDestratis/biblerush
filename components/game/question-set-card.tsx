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
  tier?: "free" | "pro" | "church" | "sub";
  isComingSoon?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  cardBackgroundUrl?: string | null; // URL from Supabase Storage
  priority?: boolean; // Set to true for above-the-fold images
  isLocked?: boolean; // If true, card is locked due to subscription requirement
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
  isLocked = false,
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
  const isDisabled = isComingSoon || isLocked;

  return (
    <div className="relative h-full flex" data-testid="question-set-card">
      <Card
        className={cn(
          "transition-all duration-200 relative overflow-hidden border w-full h-full min-h-[170px] flex flex-col",
          isDisabled 
            ? "cursor-not-allowed" 
            : "cursor-pointer",
          !isDisabled && isSelected
            ? "ring-2 ring-primary shadow-[0_8px_16px_-4px_rgba(124,58,237,0.3)] scale-[1.01] sm:scale-[1.02] border-primary"
            : !isDisabled && "hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] hover:border-primary/50"
        )}
        onClick={!isDisabled ? onSelect : undefined}
        style={isDisabled ? { filter: 'grayscale(40%) brightness(0.95)' } : undefined}
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
              loading={priority ? undefined : "lazy"} // Explicitly set loading for non-priority images
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
        {!isDisabled && (
          <div className="absolute inset-0 z-[2] bg-white/15" />
        )}
        
        {/* Distinctive glassy gray overlay for locked cards - allows content to show through but makes it clear it's locked */}
        {isLocked && (
          <>
            {/* Bright gray glassy overlay */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-br from-gray-100/60 via-gray-50/50 to-white/40 backdrop-blur-[2px]" />
            {/* Additional brightness layer */}
            <div className="absolute inset-0 z-[2] bg-white/30" />
          </>
        )}
        
        {/* Coming soon overlay - more opaque */}
        {isComingSoon && (
          <>
            {/* Solid base overlay to completely mask background - must be opaque enough */}
            <div className="absolute inset-0 z-[2]" style={{ 
              background: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #f3f4f6 100%)',
              opacity: 0.98
            }} />
            {/* Glassy gradient overlay for locked state */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-br from-purple-50/80 via-white/70 to-gray-100/80 backdrop-blur-md" />
            {/* Subtle purple tint */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-tr from-purple-200/50 via-transparent to-gray-200/50" />
            {/* Frosted glass effect */}
            <div className="absolute inset-0 z-[2] bg-white/40 backdrop-blur-sm" />
          </>
        )}
        
        {/* Content with semi-transparent white backdrop for readability */}
        <div className="relative z-[3] h-full flex flex-col">
          <div className={cn(
            "p-4 sm:p-6 rounded-xl h-full flex flex-col justify-between",
            isComingSoon ? "bg-white/50 backdrop-blur-sm" : isLocked ? "bg-white/60" : "bg-white/65"
          )}>
            <CardHeader className="p-0 pb-3 sm:pb-4" style={{ border: 'none' }}>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl text-foreground font-semibold line-clamp-2 flex-1 min-w-0">{title}</CardTitle>
              </div>
              <CardDescription className="mt-2 text-foreground font-semibold text-sm sm:text-base drop-shadow-sm line-clamp-2">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0" style={{ border: 'none' }}>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-white text-xs sm:text-sm">{questionCount} questions</Badge>
                {tier !== "free" && !isLocked && (
                  <Badge variant="secondary" className="ml-2 bg-white text-xs sm:text-sm">
                    {tier === "pro" ? "Pro" : tier === "sub" ? "Sub" : "Church"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </div>
        </div>
        
        {/* Coming Soon overlay - centered */}
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
        
        {/* Unlock badge - bottom right corner, clickable */}
        {isLocked && !isComingSoon && (
          <div className="absolute bottom-4 right-4 z-[5]">
            <a
              href="/pricing"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection
              }}
              className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2 border border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <Lock className="h-4 w-4 text-primary/80 flex-shrink-0 group-hover:text-primary" />
              <p className="text-xs font-semibold text-gray-700 group-hover:text-primary whitespace-nowrap">Unlock this set</p>
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}


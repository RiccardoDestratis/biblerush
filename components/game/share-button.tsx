"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  roomCode: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  url,
  roomCode,
  variant = "outline",
  size = "default",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Hey! Join the game: ${url}\nRoom Code: ${roomCode}`;

  const handleShare = async () => {
    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join the Quiz Game",
          text: `Hey! Join the game: Room Code: ${roomCode}`,
          url: url,
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall through to clipboard
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}


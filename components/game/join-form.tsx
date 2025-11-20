"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinGame } from "@/lib/actions/players";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface JoinFormProps {
  initialRoomCode?: string;
}

export function JoinForm({ initialRoomCode = "" }: JoinFormProps) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState(initialRoomCode.toUpperCase());
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    roomCode?: string;
    playerName?: string;
  }>({});

  // Format room code: uppercase, alphanumeric only, max 6 characters
  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setRoomCode(value);
    if (errors.roomCode) {
      setErrors((prev) => ({ ...prev, roomCode: undefined }));
    }
  };

  // Validate and set player name
  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlayerName(value);
    if (errors.playerName) {
      setErrors((prev) => ({ ...prev, playerName: undefined }));
    }
  };

  // Validate player name on blur
  const handlePlayerNameBlur = () => {
    const trimmed = playerName.trim();
    if (trimmed.length < 2) {
      setErrors((prev) => ({
        ...prev,
        playerName: "Name must be at least 2 characters",
      }));
    } else if (trimmed.length > 30) {
      setErrors((prev) => ({
        ...prev,
        playerName: "Name must be 30 characters or less",
      }));
    } else if (trimmed.length > 0 && !/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        playerName: "Name can only contain letters, numbers, and spaces",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    if (roomCode.length !== 6) {
      setErrors({ roomCode: "Room code must be 6 characters" });
      setIsLoading(false);
      return;
    }

    const trimmedName = playerName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      setErrors({
        playerName: "Name must be between 2 and 30 characters",
      });
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(trimmedName)) {
      setErrors({
        playerName: "Name can only contain letters, numbers, and spaces",
      });
      setIsLoading(false);
      return;
    }

    // Call Server Action
    const result = await joinGame(roomCode, trimmedName);

    if (result.success) {
      toast.success("Successfully joined game!");
      router.push(`/game/${result.gameId}/play?playerName=${encodeURIComponent(trimmedName)}`);
    } else {
      toast.error(result.error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="room-code" className="text-lg">
          Room Code
        </Label>
        <Input
          id="room-code"
          type="text"
          value={roomCode}
          onChange={handleRoomCodeChange}
          placeholder="ABC123"
          maxLength={6}
          className="h-[48px] text-lg text-center tracking-widest font-mono"
          disabled={isLoading}
          required
        />
        {errors.roomCode && (
          <p className="text-sm text-destructive">{errors.roomCode}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="player-name" className="text-lg">
          Your Name
        </Label>
        <Input
          id="player-name"
          type="text"
          value={playerName}
          onChange={handlePlayerNameChange}
          onBlur={handlePlayerNameBlur}
          placeholder="Enter your name"
          maxLength={30}
          className="h-[48px] text-lg"
          disabled={isLoading}
          required
        />
        {errors.playerName && (
          <p className="text-sm text-destructive">{errors.playerName}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-[60px] text-lg font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Game"
        )}
      </Button>
    </form>
  );
}


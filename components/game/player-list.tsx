"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface Player {
  id: string;
  player_name: string;
}

interface PlayerListProps {
  players: Player[];
  onPlayerAdded?: (player: Player) => void;
  variant?: "desktop" | "mobile"; // Variant for different display sizes
}

/**
 * Process player names to handle duplicates with numbering
 * Example: ["Alice", "Bob", "Alice"] -> ["Alice", "Bob", "Alice (2)"]
 */
function processPlayerNames(players: Player[]): Array<Player & { displayName: string }> {
  const nameCount = new Map<string, number>();
  const processed: Array<Player & { displayName: string }> = [];

  for (const player of players) {
    const name = player.player_name;
    const count = nameCount.get(name) || 0;
    
    if (count === 0) {
      // First occurrence of this name
      nameCount.set(name, 1);
      processed.push({
        ...player,
        displayName: name,
      });
    } else {
      // Duplicate name - number it
      nameCount.set(name, count + 1);
      processed.push({
        ...player,
        displayName: `${name} (${count + 1})`,
      });
    }
  }

  return processed;
}

export function PlayerList({ players, onPlayerAdded, variant = "desktop" }: PlayerListProps) {
  const isMobile = variant === "mobile";
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const prevPlayerIdsRef = useRef<Set<string>>(new Set());

  // Process player names and handle highlighting
  const processedPlayers = processPlayerNames(players);
  
  // On mobile, show only last 5 players if there are more (unless expanded)
  const MOBILE_MAX_VISIBLE = 5;
  const shouldTruncateMobile = isMobile && processedPlayers.length > MOBILE_MAX_VISIBLE && !isExpanded;
  const visiblePlayers = shouldTruncateMobile 
    ? processedPlayers.slice(-MOBILE_MAX_VISIBLE)
    : processedPlayers;
  const hiddenCount = shouldTruncateMobile 
    ? processedPlayers.length - MOBILE_MAX_VISIBLE 
    : 0;
  
  // Calculate the starting index number for visible players (accounting for truncated players)
  const startIndexNumber = shouldTruncateMobile 
    ? processedPlayers.length - MOBILE_MAX_VISIBLE + 1 
    : 1;

  // Detect new players and highlight them
  useEffect(() => {
    // Skip animation on initial mount (when players are first loaded)
    if (isInitialMount && players.length > 0) {
      setIsInitialMount(false);
      // Mark existing players as seen
      prevPlayerIdsRef.current = new Set(players.map(p => p.id));
      return;
    }

    const currentPlayerIds = new Set(players.map(p => p.id));
    const prevPlayerIds = prevPlayerIdsRef.current;

    // Find newly added players
    const newPlayers = players.filter(p => !prevPlayerIds.has(p.id));
    
    if (newPlayers.length > 0) {
      // Highlight the most recently added player
      const lastPlayer = newPlayers[newPlayers.length - 1];
      setHighlightedPlayerId(lastPlayer.id);
      
      // Remove highlight after 1 second
      const timer = setTimeout(() => {
        setHighlightedPlayerId(null);
      }, 1000);

      // Update ref for next comparison
      prevPlayerIdsRef.current = currentPlayerIds;

      // Call onPlayerAdded callback if provided
      if (onPlayerAdded) {
        onPlayerAdded(lastPlayer);
      }

      return () => clearTimeout(timer);
    }

    // Update ref even if no new players (in case players were removed)
    prevPlayerIdsRef.current = currentPlayerIds;
  }, [players, onPlayerAdded, isInitialMount]);

  if (players.length === 0) {
    return (
      <p className={`${isMobile ? "text-base" : "text-xl"} text-muted-foreground`}>
        Players will appear here when they join...
      </p>
    );
  }

  return (
    <div className={`${isMobile ? "mt-2 space-y-2" : "mt-6 space-y-2 max-h-96"} ${isMobile && isExpanded ? "max-h-[70vh] overflow-y-auto" : isMobile ? "max-h-64" : "overflow-y-auto"}`}>
      <AnimatePresence mode="popLayout">
        {visiblePlayers.map((player, visibleIndex) => {
          const isHighlighted = highlightedPlayerId === player.id;
          // Calculate the actual index number (accounting for truncated players on mobile)
          const actualIndex = startIndexNumber + visibleIndex;

          return (
            <motion.div
              key={player.id}
              initial={isInitialMount ? false : { opacity: 0, x: isMobile ? -20 : -30, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ 
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              layout
              className={`bg-background/50 backdrop-blur-sm rounded-lg ${isMobile ? "p-3" : "p-4"} text-left border transition-colors duration-1000 ${
                isHighlighted 
                  ? "border-primary bg-primary/20 shadow-lg shadow-primary/20" 
                  : "border-primary/20"
              }`}
            >
              <p className={`${isMobile ? "text-base" : "text-xl"} font-medium text-foreground`}>
                {actualIndex}. {player.displayName}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Clickable card at bottom for mobile when truncated */}
      {shouldTruncateMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsExpanded(true)}
          className="bg-background/70 backdrop-blur-sm rounded-lg p-4 text-center border border-primary/30 cursor-pointer hover:bg-background/90 active:scale-95 transition-all"
        >
          <p className={`${isMobile ? "text-sm" : "text-base"} text-muted-foreground font-medium`}>
            ... and {hiddenCount} more {hiddenCount === 1 ? "player" : "players"}
          </p>
          <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground mt-1`}>
            Tap to see all players
          </p>
        </motion.div>
      )}
      
      {/* Collapse button when expanded on mobile */}
      {isMobile && isExpanded && processedPlayers.length > MOBILE_MAX_VISIBLE && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsExpanded(false)}
          className="bg-background/70 backdrop-blur-sm rounded-lg p-3 text-center border border-primary/30 cursor-pointer hover:bg-background/90 active:scale-95 transition-all mt-2"
        >
          <p className="text-sm text-muted-foreground font-medium">
            Show less
          </p>
        </motion.div>
      )}
    </div>
  );
}

